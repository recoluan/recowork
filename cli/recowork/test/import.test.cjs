const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const cli = path.resolve(__dirname, '../bin/rw.js');
const run = (...args) => execFileSync(process.execPath, [cli, ...args], { stdio: 'pipe' });
function fixture(t) {
 const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-import-test-'));
 t.after(() => fs.rmSync(root, { recursive: true, force: true }));
 return root;
}
for (const locale of ['zh', 'en']) for (const template of ['idea-to-project', 'learning-engineering', 'web-design-standard']) {
 test(`import ${template}/${locale} preserves content and safe upgrade ownership`, t => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'README.md'), '# Existing README\n');
  fs.writeFileSync(path.join(root, 'AGENTS.md'), '# Existing instructions\n');
  run('import', template, '--target', 'local-agent-project', '--locale', locale, root);
  assert.equal(fs.readFileSync(path.join(root, 'README.md'), 'utf8'), '# Existing README\n');
  const agent = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
  assert.ok(agent.startsWith('# Existing instructions\n'));
  assert.match(agent, /<!-- recowork:start/);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'rw-manifest.json')));
  assert.equal(manifest.files['README.md'], undefined);
  assert.ok(manifest.agent_block || manifest.agentBlock || JSON.stringify(manifest).includes('recowork:start'));
  run('upgrade', '--apply', '--scope', 'methods,target,workspace', root);
  assert.equal(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), agent);
  assert.throws(() => run('import', template, '--target', 'local-agent-project', root));
 });
}
test('invalid imports reject before changing existing files', t => {
 const root = fixture(t);
 for (const kind of ['empty', 'manifest', 'agent-symlink', 'workspace-symlink', 'chat']) {
  const dest = path.join(root, kind); fs.mkdirSync(dest);
  const sentinel = path.join(dest, 'README.md');
  if (kind !== 'empty') fs.writeFileSync(sentinel, 'unchanged');
  if (kind === 'manifest') fs.symlinkSync(path.join(root, 'absent'), path.join(dest, 'rw-manifest.json'));
  if (kind === 'agent-symlink') fs.symlinkSync(sentinel, path.join(dest, 'AGENTS.md'));
  if (kind === 'workspace-symlink') fs.symlinkSync(root, path.join(dest, '工作空间'));
  const before = fs.readdirSync(dest);
  assert.throws(() => run('import', 'idea-to-project', '--target', kind === 'chat' ? 'chat-mobile' : 'local-agent-project', '--locale', 'zh', dest));
  assert.deepEqual(fs.readdirSync(dest), before);
  if (kind !== 'empty') assert.equal(fs.readFileSync(sentinel, 'utf8'), 'unchanged');
 }
});
