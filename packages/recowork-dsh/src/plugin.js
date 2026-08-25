import { createRecoWorkService } from './recowork-service.js'

export const name = 'recowork-dsh'
export const inject = ['tools', 'systemPrompt', 'webServer']

const WORKFLOW_GUIDANCE = `
RecoWork workspace protocol:
- Use recowork_init only when the user explicitly asks to create a new RecoWork workflow. Confirm the requested root, destination, template, and locale in the tool call. Never use it to alter, repair, replace, or upgrade an existing directory.
- Use recowork_status when the user asks to inspect, continue, review, or begin durable work in an existing RecoWork workspace. Treat its result as a concise navigation summary, not the complete source of truth.
- After a successful status read and before planning or editing work, read the workspace root AGENTS.md, then the localized role contract and document standard named there. Follow their confirmation, ownership, and current-versus-archive rules.
- Do not infer an allowed root, create an allowed root, or propose bypassing a rejected initialization. Ask the user to choose or configure a safe path instead.
- recowork_status is read-only. It does not authorize edits. Make workspace changes only when the user explicitly asks for the underlying work.
`.trim()

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: true,
}

const INIT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['root', 'destination', 'template', 'locale'],
  properties: {
    root: { type: 'string', description: 'An exact absolute path from the configured approved roots.' },
    destination: { type: 'string', description: 'A relative path below root. The destination must not exist or must be empty.' },
    template: { type: 'string', enum: ['idea-to-project', 'learning-engineering', 'web-design-standard'], description: 'RecoWork template to initialize.' },
    locale: { type: 'string', enum: ['zh', 'en'], description: 'User-facing workspace language.' },
  },
}

const STATUS_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['root', 'destination'],
  properties: {
    root: { type: 'string', description: 'An exact absolute path from the configured approved roots.' },
    destination: { type: 'string', description: 'A relative path below root containing rw-manifest.json.' },
  },
}

function render(value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function respondJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(`${JSON.stringify(value)}\n`)
}

async function readJsonBody(request) {
  if (request.method !== 'POST') throw new Error('POST is required.')
  const contentType = request.headers['content-type'] || ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new Error('Content-Type must be application/json.')
  }
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 8_192) throw new Error('Request body is too large.')
  }
  try {
    const value = JSON.parse(body)
    if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error()
    return value
  } catch {
    throw new Error('Request body must be a JSON object.')
  }
}

function registerWebRoutes(ctx, service) {
  ctx.webServer.register({
    kind: 'exact',
    path: '/api/recowork/roots',
    handler: (_request, response) => {
      respondJson(response, 200, { roots: service.allowedRoots() })
    },
  })

  ctx.webServer.register({
    kind: 'exact',
    path: '/api/recowork/workspaces',
    handler: (request, response) => {
      try {
        const url = new URL(request.url || '/', 'http://127.0.0.1')
        const root = url.searchParams.get('root')
        if (root === null) {
          respondJson(response, 400, { error: 'root is required.' })
          return
        }
        respondJson(response, 200, { workspaces: service.workspaces(root) })
      } catch (error) {
        respondJson(response, 400, { error: error instanceof Error ? error.message : 'Cannot list RecoWork workspaces.' })
      }
    },
  })

  ctx.webServer.register({
    kind: 'exact',
    path: '/api/recowork/status',
    handler: (request, response) => {
      try {
        const url = new URL(request.url || '/', 'http://127.0.0.1')
        const root = url.searchParams.get('root')
        const destination = url.searchParams.get('destination')
        if (root === null || destination === null) {
          respondJson(response, 400, { error: 'root and destination are required.' })
          return
        }
        respondJson(response, 200, service.status({ root, destination }))
      } catch (error) {
        respondJson(response, 400, { error: error instanceof Error ? error.message : 'Cannot read RecoWork status.' })
      }
    },
  })

  ctx.webServer.register({
    kind: 'exact',
    path: '/api/recowork/init',
    async handler(request, response) {
      try {
        const input = await readJsonBody(request)
        if (input.confirmed !== true) {
          respondJson(response, 400, { error: 'Explicit confirmation is required before initialization.' })
          return
        }
        const { root, destination, template, locale } = input
        respondJson(response, 200, await service.init({ root, destination, template, locale }))
      } catch (error) {
        respondJson(response, 400, { error: error instanceof Error ? error.message : 'Cannot initialize RecoWork workspace.' })
      }
    },
  })
}

export function apply(ctx, config = {}) {
  const service = createRecoWorkService(config)

  registerWebRoutes(ctx, service)

  ctx.systemPrompt.section({
    name: 'recowork-dsh:workflow-protocol',
    order: 120,
    text: WORKFLOW_GUIDANCE,
  })

  ctx.tools.register({
    name: 'recowork_init',
    description: 'Create a new RecoWork local-agent workspace in an approved empty directory. Never use this for an existing RecoWork workspace.',
    parameters: INIT_PARAMETERS,
    output: { schema: OUTPUT_SCHEMA, render: (_args, value) => render(value) },
    async execute(args, exec) {
      return service.init(args, exec.signal)
    },
  })

  ctx.tools.register({
    name: 'recowork_status',
    description: 'Read a RecoWork workspace summary from an approved directory. This tool never writes, upgrades, moves, or deletes files.',
    parameters: STATUS_PARAMETERS,
    output: { schema: OUTPUT_SCHEMA, render: (_args, value) => render(value) },
    async execute(args) {
      return service.status(args)
    },
  })
}
