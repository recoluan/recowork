import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { apply } from '../src/plugin.js'
import { createRecoWorkService } from '../src/recowork-service.js'
import { configureProfile, parseSetupArgs } from '../src/setup.js'

test('initialization is constrained to an empty descendant of an approved root', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-'))
  const calls = []
  const service = createRecoWorkService({ allowedRoots: [root] }, {
    commandRunner: async (input) => { calls.push(input); return { stdout: 'ok', stderr: '' } },
  })

  const result = await service.init({ root, destination: 'new-project', template: 'idea-to-project', locale: 'zh' })
  assert.equal(result.operation, 'initialized')
  assert.equal(calls[0].destination, path.join(realpathSync(root), 'new-project'))
  await assert.rejects(() => service.init({ root, destination: '../outside', template: 'idea-to-project', locale: 'zh' }), /strictly inside/)

  mkdirSync(path.join(root, 'occupied'))
  writeFileSync(path.join(root, 'occupied', 'note.txt'), 'user file')
  await assert.rejects(() => service.init({ root, destination: 'occupied', template: 'idea-to-project', locale: 'zh' }), /not empty/)
})

test('status reads only the manifest and recognized current-work documents', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-'))
  const destination = path.join(root, 'project')
  mkdirSync(path.join(destination, 'workspace'), { recursive: true })
  writeFileSync(path.join(destination, 'rw-manifest.json'), JSON.stringify({ schema_version: 2, template: 'idea-to-project', target: 'local-agent-project', locale: 'en', template_version: '1.0.0', target_version: '1.0.0' }))
  writeFileSync(path.join(destination, 'workspace', 'project-brief.md'), '# Brief\nCurrent objective')
  writeFileSync(path.join(destination, 'private.md'), 'must not be read')

  const service = createRecoWorkService({ allowedRoots: [root] })
  const result = service.status({ root, destination: 'project' })
  assert.equal(result.operation, 'read-only-status')
  assert.deepEqual(result.documents.map((document) => document.path), ['workspace/project-brief.md'])
  assert.deepEqual(service.allowedRoots(), [realpathSync(root)])
})

test('workspace choices expose only direct children with a valid manifest', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-'))
  mkdirSync(path.join(root, 'workflow'))
  mkdirSync(path.join(root, 'ordinary-directory'))
  writeFileSync(path.join(root, 'workflow', 'rw-manifest.json'), JSON.stringify({ template: 'idea-to-project', locale: 'zh' }))
  const service = createRecoWorkService({ allowedRoots: [root] })

  assert.deepEqual(service.workspaces(root), [{ destination: 'workflow', template: 'idea-to-project', locale: 'zh' }])
})

test('status includes stage, actionable open questions, and workspace health', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-'))
  const destination = path.join(root, 'project')
  mkdirSync(path.join(destination, '工作空间'), { recursive: true })
  writeFileSync(path.join(destination, 'rw-manifest.json'), JSON.stringify({
    schema_version: 2, template: 'idea-to-project', target: 'local-agent-project', locale: 'zh',
    recowork_version: '3.2.2', generated_at: '2026-08-25T00:00:00.000Z', files: {
      'AGENTS.md': { ownership: 'target', user_modified: true },
    },
  }))
  writeFileSync(path.join(destination, '工作空间', 'index.md'), '> 当前阶段：探索与验证')
  writeFileSync(path.join(destination, '工作空间', '待确认问题.md'), '# 待确认问题\n\n- 确认目标用户\n- 确认发布方式')
  const result = createRecoWorkService({ allowedRoots: [root] }).status({ root, destination: 'project' })

  assert.equal(result.workflow.stage, '探索与验证')
  assert.deepEqual(result.workflow.nextActions, ['确认目标用户', '确认发布方式'])
  assert.deepEqual(result.health, { manifest: true, schemaVersion: 2, recognizedDocuments: 1, expectedDocuments: 3, missingDocuments: ['工作空间/项目简报.md', '工作空间/搁置想法.md'], modifiedManagedFiles: 1 })
})

test('status rejects a destination symlink that resolves outside its approved root', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-root-'))
  const outside = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-outside-'))
  symlinkSync(outside, path.join(root, 'outside-link'))
  const service = createRecoWorkService({ allowedRoots: [root] })

  assert.throws(() => service.status({ root, destination: 'outside-link' }), /not a directory/)
})

test('status recognizes the single-file web design standard', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-'))
  const destination = path.join(root, 'standard')
  mkdirSync(destination)
  writeFileSync(path.join(destination, 'rw-manifest.json'), JSON.stringify({ schema_version: 2, template: 'web-design-standard', target: 'local-agent-project', locale: 'zh' }))
  writeFileSync(path.join(destination, '网页设计规范.md'), '# 网页设计规范')

  const service = createRecoWorkService({ allowedRoots: [root] })
  assert.deepEqual(service.status({ root, destination: 'standard' }).documents.map((document) => document.path), ['网页设计规范.md'])
})

test('setup writes an owned profile block, canonicalizes roots, and preserves a backup', () => {
  const home = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-home-'))
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-root-'))
  const patchPath = path.join(home, 'profiles', 'web', 'cordis.patch.yml')
  mkdirSync(path.dirname(patchPath), { recursive: true })
  writeFileSync(patchPath, '# user patch\n- id: another-plugin\n  config: {}\n')

  const result = configureProfile(parseSetupArgs(['setup', '--root', root, '--dsh-home', home]))
  const next = readFileSync(patchPath, 'utf8')
  assert.equal(result.changed, true)
  assert.equal(result.roots[0], realpathSync(root))
  assert.equal(existsSync(result.backupPath), true)
  assert.match(next, /# >>> RecoWork DSH setup >>>/)
  assert.match(next, /- id: another-plugin/)
  assert.match(next, new RegExp(JSON.stringify(realpathSync(root))))
  assert.equal(configureProfile({ roots: [root], dshHome: home, profile: 'web', adoptExisting: false }).changed, false)
})

test('setup requires explicit adoption of an existing un-managed RecoWork entry', () => {
  const home = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-home-'))
  const root = mkdtempSync(path.join(tmpdir(), 'recowork-dsh-root-'))
  const patchPath = path.join(home, 'profiles', 'web', 'cordis.patch.yml')
  mkdirSync(path.dirname(patchPath), { recursive: true })
  writeFileSync(patchPath, '- id: recowork-dsh\n  config:\n    allowedRoots: []\n')

  assert.throws(() => configureProfile({ roots: [root], dshHome: home, profile: 'web' }), /--adopt-existing/)
  const adopted = configureProfile({ roots: [root], dshHome: home, profile: 'web', adoptExisting: true })
  assert.equal(adopted.changed, true)
  assert.match(readFileSync(patchPath, 'utf8'), /# >>> RecoWork DSH setup >>>/)
})

test('plugin registers two tools, a workflow protocol section, and guarded web routes', async () => {
  const tools = []
  const sections = []
  const routes = []
  apply({
    tools: { register: (tool) => tools.push(tool) },
    systemPrompt: { section: (section) => sections.push(section) },
    webServer: { register: (route) => routes.push(route) },
  })

  assert.deepEqual(tools.map((tool) => tool.name), ['recowork_init', 'recowork_status'])
  assert.equal(sections[0].name, 'recowork-dsh:workflow-protocol')
  assert.match(sections[0].text, /read the workspace root AGENTS\.md/)
  assert.deepEqual(routes.map((route) => route.path), ['/api/recowork/roots', '/api/recowork/workspaces', '/api/recowork/status', '/api/recowork/init'])

  const initRoute = routes.find((route) => route.path === '/api/recowork/init')
  const response = {
    writeHead: (statusCode) => { response.statusCode = statusCode },
    end: (body) => { response.body = body },
  }
  const request = Object.assign((async function* () { yield JSON.stringify({ confirmed: false }) })(), {
    method: 'POST', headers: { 'content-type': 'application/json' },
  })
  await initRoute.handler(request, response)
  assert.equal(response.statusCode, 400)
  assert.match(response.body, /Explicit confirmation is required/)
})

test('web dashboard registers with the required list-slot id', () => {
  const client = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  assert.match(client, /name: 'shell\.overlay',[\s\S]*id: 'recowork-dashboard'/)
  assert.doesNotMatch(client, /key: 'recowork-dashboard'/)
  assert.match(client, /const \[open, setOpen\] = useState\(false\)/)
  assert.match(client, /documentRows\.map/)
  assert.match(client, /确认并初始化/)
  assert.match(client, /confirmed: true/)
  assert.match(client, /已有工作区/)
  assert.match(client, /mode === 'status' && manifest/)
  assert.match(client, /onClick: \(\) => refresh\(\)/)
  assert.match(client, /当前阶段/)
  assert.match(client, /需要关注/)
  assert.match(client, /工作区健康度/)
  assert.match(client, /const \{ createElement, useEffect, useState, useSyncExternalStore \} = React/)
  assert.match(client, /inject: \['slots', 'locale'\]/)
  assert.match(client, /localeService\.subscribe\(listener\)/)
  assert.match(client, /Status/)
  assert.match(client, /Current stage/)
  assert.match(client, /height: 'min\(600px, calc\(100vh - 40px\)\)'/)
  assert.match(client, /display: 'flex', flexDirection: 'column', overflow: 'hidden'/)
  assert.match(client, /minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain'/)
})
