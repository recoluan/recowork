import { execFile } from 'node:child_process'
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { realpathSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const TEMPLATES = new Set(['idea-to-project', 'learning-engineering', 'web-design-standard'])
const LOCALES = new Set(['zh', 'en'])
const MAX_DOCUMENT_CHARS = 12_000
const MAX_WORKSPACE_CHOICES = 100

function normalizeRoot(root) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) {
    throw new Error('root must be an absolute path.')
  }
  if (!existsSync(root) || !lstatSync(root).isDirectory()) {
    throw new Error(`Approved root does not exist or is not a directory: ${root}`)
  }
  return realpathSync(root)
}

function resolveDestination(roots, root, destination) {
  const normalizedRoot = normalizeRoot(root)
  if (!roots.has(normalizedRoot)) {
    throw new Error('root is not in this plugin\'s configured allowedRoots.')
  }
  if (typeof destination !== 'string' || destination.length === 0 || path.isAbsolute(destination)) {
    throw new Error('destination must be a non-empty relative path.')
  }
  const resolved = path.resolve(normalizedRoot, destination)
  if (resolved === normalizedRoot || !resolved.startsWith(`${normalizedRoot}${path.sep}`)) {
    throw new Error('destination must resolve strictly inside the approved root.')
  }
  return { root: normalizedRoot, destination: resolved }
}

function assertEmptyOrMissing(destination) {
  if (!existsSync(destination)) return
  if (!lstatSync(destination).isDirectory()) {
    throw new Error(`Destination exists and is not a directory: ${destination}`)
  }
  if (readdirSync(destination).length > 0) {
    throw new Error('Destination is not empty. This plugin refuses to modify an existing directory; use the RecoWork CLI directly after reviewing its contents.')
  }
}

function canonicalExistingDestination(root, destination) {
  if (!existsSync(destination) || !lstatSync(destination).isDirectory()) {
    throw new Error(`Destination does not exist or is not a directory: ${destination}`)
  }
  const canonical = realpathSync(destination)
  if (!canonical.startsWith(`${root}${path.sep}`)) {
    throw new Error('Destination resolves outside the approved root.')
  }
  return canonical
}

function documentCandidates(manifest) {
  const zh = manifest.locale === 'zh'
  if (manifest.template === 'web-design-standard') {
    return [zh ? '网页设计规范.md' : 'web-design-standard.md']
  }
  const root = zh ? '工作空间' : manifest.template === 'learning-engineering' ? 'learning-workspace' : 'workspace'
  const files = manifest.template === 'learning-engineering'
    ? (zh ? ['学习简报.md', '课程路线.md', '学习进度.md'] : ['learner-brief.md', 'course-roadmap.md', 'learning-progress.md'])
    : (zh ? ['项目简报.md', '待确认问题.md', '搁置想法.md'] : ['project-brief.md', 'open-questions.md', 'parked-ideas.md'])
  return files.map((file) => path.join(root, file))
}

function workspaceIndexPath(manifest) {
  if (manifest.template === 'web-design-standard') return null
  return manifest.locale === 'zh' ? '工作空间/index.md' : 'workspace/index.md'
}

function stageFromIndex(excerpt) {
  if (excerpt === null) return null
  const match = excerpt.content.match(/^>\s*(?:当前阶段|Current stage)\s*[:：]\s*(.+)$/m)
  return match?.[1]?.trim() || null
}

function actionableItems(excerpts) {
  const items = []
  for (const excerpt of excerpts) {
    for (const line of excerpt.content.split('\n')) {
      const match = line.match(/^\s*-\s+(.+)$/)
      const item = match?.[1]?.trim()
      if (!item || /^待填写[：:]/.test(item) || /^To be completed[：:]/i.test(item)) continue
      items.push(item)
      if (items.length === 3) return items
    }
  }
  return items
}

function healthSummary(manifest, candidates, excerpts) {
  const managedFiles = Object.values(manifest.files || {}).filter((file) => file?.ownership !== 'workspace')
  return {
    manifest: true,
    schemaVersion: manifest.schema_version,
    recognizedDocuments: excerpts.length,
    expectedDocuments: candidates.length,
    missingDocuments: candidates.filter((candidate) => !excerpts.some((excerpt) => excerpt.path === candidate)),
    modifiedManagedFiles: managedFiles.filter((file) => file?.user_modified === true).length,
  }
}

function deckActions(workflow) {
  const actions = [{ id: 'orient', kind: 'orient' }]
  for (const item of workflow.nextActions) {
    actions.push({ id: `question:${item}`, kind: 'resolve-question', item })
  }
  actions.push({ id: 'review', kind: 'review' })
  return actions
}

function memoryItems(excerpts) {
  const ignoredPath = /(?:待确认问题|open-questions|搁置想法|parked-ideas)\.md$/
  const ignoredItem = /^(?:待填写|To be completed|无|None|N\/A)(?:[：:]|$)/i
  const items = []
  for (const excerpt of excerpts.filter((item) => !ignoredPath.test(item.path))) {
    for (const line of excerpt.content.split('\n')) {
      const match = line.match(/^\s*-\s+(?!\[[ xX]\]\s*)(.+)$/)
      const text = match?.[1]?.trim()
      if (!text || ignoredItem.test(text) || /^[-|: ]+$/.test(text)) continue
      items.push({ text, source: excerpt.path })
      if (items.length === 3) return items
    }
  }
  return items
}

function deckSummary(workflow, health, excerpts) {
  const expected = health.expectedDocuments || 0
  const complete = expected > 0 && health.recognizedDocuments >= expected
  const actions = deckActions(workflow)
  return {
    stage: workflow.stage,
    blockingCount: workflow.nextActions.length,
    primaryActionId: actions.find((action) => action.kind === 'resolve-question')?.id || 'orient',
    progress: {
      recognizedDocuments: health.recognizedDocuments,
      expectedDocuments: expected,
      complete,
    },
    actions,
    memory: memoryItems(excerpts),
  }
}

function readExcerpt(workspace, relativePath) {
  const fullPath = path.resolve(workspace, relativePath)
  if (!fullPath.startsWith(`${workspace}${path.sep}`) || !existsSync(fullPath) || !lstatSync(fullPath).isFile()) return null
  const content = readFileSync(fullPath, 'utf8')
  return {
    path: relativePath,
    content: content.slice(0, MAX_DOCUMENT_CHARS),
    truncated: content.length > MAX_DOCUMENT_CHARS,
  }
}

function parseManifest(destination) {
  const manifestPath = path.join(destination, 'rw-manifest.json')
  if (!existsSync(manifestPath)) throw new Error(`No rw-manifest.json found in: ${destination}`)
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    throw new Error(`Cannot parse rw-manifest.json in: ${destination}`)
  }
}

function createCommandRunner({ executable, packageRef }) {
  return async ({ template, locale, destination, signal }) => {
    const { stdout, stderr } = await execFileAsync(executable, [
      '--yes', packageRef, 'add', template, '--target', 'local-agent-project', '--locale', locale, destination,
    ], { signal, maxBuffer: 1024 * 1024 })
    return { stdout, stderr }
  }
}

export function createRecoWorkService(config = {}, dependencies = {}) {
  const allowedRoots = new Set((config.allowedRoots || []).map(normalizeRoot))
  const commandRunner = dependencies.commandRunner || createCommandRunner({
    executable: config.npxExecutable || 'npx',
    packageRef: config.recoworkPackage || 'recowork@3.2.2',
  })

  return {
    allowedRoots() {
      return [...allowedRoots].sort()
    },

    async init({ root, destination, template, locale }, signal) {
      if (!TEMPLATES.has(template)) throw new Error(`Unsupported template: ${template}`)
      if (!LOCALES.has(locale)) throw new Error(`Unsupported locale: ${locale}`)
      const resolved = resolveDestination(allowedRoots, root, destination)
      assertEmptyOrMissing(resolved.destination)
      const result = await commandRunner({ template, locale, destination: resolved.destination, signal })
      return {
        operation: 'initialized',
        destination: resolved.destination,
        template,
        target: 'local-agent-project',
        locale,
        output: [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, MAX_DOCUMENT_CHARS),
      }
    },

    status({ root, destination }) {
      const resolved = resolveDestination(allowedRoots, root, destination)
      const canonicalDestination = canonicalExistingDestination(resolved.root, resolved.destination)
      const manifest = parseManifest(canonicalDestination)
      const candidates = documentCandidates(manifest)
      const excerpts = candidates
        .map((candidate) => readExcerpt(canonicalDestination, candidate))
        .filter(Boolean)
      const indexPath = workspaceIndexPath(manifest)
      const indexExcerpt = indexPath === null ? null : readExcerpt(canonicalDestination, indexPath)
      const openQuestion = excerpts.find((excerpt) => /(?:待确认问题|open-questions)\.md$/.test(excerpt.path))
      const workflow = {
        stage: stageFromIndex(indexExcerpt),
        nextActions: openQuestion ? actionableItems([openQuestion]) : [],
      }
      const health = healthSummary(manifest, candidates, excerpts)
      return {
        operation: 'read-only-status',
        destination: canonicalDestination,
        manifest: {
          schema_version: manifest.schema_version,
          template: manifest.template,
          target: manifest.target,
          locale: manifest.locale,
          template_version: manifest.template_version,
          target_version: manifest.target_version,
          recowork_version: manifest.recowork_version,
          generated_at: manifest.generated_at,
        },
        workflow,
        health,
        deck: deckSummary(workflow, health, excerpts),
        documents: excerpts,
      }
    },

    workspaces(root) {
      const normalizedRoot = normalizeRoot(root)
      if (!allowedRoots.has(normalizedRoot)) {
        throw new Error('root is not in this plugin\'s configured allowedRoots.')
      }
      return readdirSync(normalizedRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .slice(0, MAX_WORKSPACE_CHOICES)
        .flatMap((entry) => {
          const destination = path.join(normalizedRoot, entry.name)
          try {
            const canonicalDestination = canonicalExistingDestination(normalizedRoot, destination)
            const manifest = parseManifest(canonicalDestination)
            return [{ destination: entry.name, template: manifest.template, locale: manifest.locale }]
          } catch {
            return []
          }
        })
        .sort((left, right) => left.destination.localeCompare(right.destination))
    },
  }
}
