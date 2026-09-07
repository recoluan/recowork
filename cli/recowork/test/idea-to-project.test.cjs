const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const cli = path.resolve(__dirname, '../bin/rw.js');
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function run(...args) { return execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); }
function temp(t) {
  const dir = fs.mkdtempSync(path.join(fs.existsSync('/private/tmp') ? '/private/tmp' : os.tmpdir(), 'rw-idea-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
for (const locale of ['zh', 'en']) {
  test(`${locale}: local generation has usable links and a reachable minimal workspace`, t => {
    const dir = temp(t);
    run('add', 'idea-to-project', '--target', 'local-agent-project', '--locale', locale, dir);
    const ws = path.join(dir, locale === 'zh' ? '工作空间' : 'workspace');
    const markdown = files(dir).filter(f => f.endsWith('.md'));
    const graph = new Map();
    for (const file of markdown) {
      const links = [...fs.readFileSync(file, 'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
        .map(m => m[1]).filter(p => !/^(https?:|#)/.test(p));
      const resolved = links.map(p => path.resolve(path.dirname(file), decodeURIComponent(p.split('#')[0])));
      for (const target of resolved) assert.ok(fs.existsSync(target), `${file} -> ${target}`);
      graph.set(file, resolved);
    }
    const seen = new Set();
    function visit(file) { if (seen.has(file)) return; seen.add(file); for (const p of graph.get(file) || []) visit(p); }
    visit(path.join(ws, 'index.md'));
    assert.equal(files(ws).length, 6, 'only essential workspace records are initialized');
    for (const file of files(ws)) assert.ok(seen.has(file), `unreachable workspace record: ${file}`);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'rw-manifest.json')));
    assert.equal(manifest.template_version, '1.4.0');
    for (const [name, entry] of Object.entries(manifest.files)) {
      assert.equal(hash(fs.readFileSync(path.join(dir, name))), entry.baseline_hash);
    }
    assert.throws(() => run('add', 'idea-to-project', '--target', 'local-agent-project', dir));
  });
  test(`${locale}: upgrades preserve old workspace, removed placeholders and edited methods/block`, t => {
    const dir = temp(t);
    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# External instructions\nPreserve this content.\n');
    run('add', 'idea-to-project', '--target', 'local-agent-project', '--locale', locale, dir);
    const ws = locale === 'zh' ? '工作空间' : 'workspace';
    const method = locale === 'zh' ? '工作方法/文档规范.md' : 'methods/document-standard.md';
    const manifestPath = path.join(dir, 'rw-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    manifest.template_version = '1.3.0';
    // Model an old, unmodified workspace record and a retired tracked placeholder.
    for (const name of [`${ws}/index.md`, `${ws}/legacy-topic/index.md`]) {
      const body = '# Old user-owned record\nDo not migrate automatically.\n';
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), body);
      manifest.files[name] = { ownership: 'workspace', source_hash: hash(body), baseline_hash: hash(body), user_modified: false };
    }
    const before = new Map(files(path.join(dir, ws)).map(f => [f, fs.readFileSync(f)]));
    fs.appendFileSync(path.join(dir, method), '\nUser customization\n');
    manifest.files[method].source_hash = hash('older upstream');
    const agentPath = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(agentPath, fs.readFileSync(agentPath, 'utf8').replace('<!-- recowork:end -->', 'User block customization\n<!-- recowork:end -->'));
    const agents = fs.readFileSync(agentPath);
    const methods = fs.readFileSync(path.join(dir, method));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    run('upgrade', '--apply', '--scope', 'methods,target,workspace', dir);
    for (const [file, content] of before) assert.deepEqual(fs.readFileSync(file), content);
    assert.deepEqual(fs.readFileSync(agentPath), agents);
    assert.deepEqual(fs.readFileSync(path.join(dir, method)), methods);
  });
  test(`${locale}: missing workspace records require explicit add-missing`, t => {
    const dir = temp(t);
    run('add', 'idea-to-project', '--target', 'local-agent-project', '--locale', locale, dir);
    const name = locale === 'zh' ? '工作空间/待确认问题.md' : 'workspace/open-questions.md';
    const manifestPath = path.join(dir, 'rw-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    delete manifest.files[name]; // A newly introduced record absent from an older baseline.
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    fs.unlinkSync(path.join(dir, name));
    run('upgrade', '--apply', '--scope', 'workspace', dir);
    assert.ok(!fs.existsSync(path.join(dir, name)));
    run('upgrade', '--apply', '--scope', 'workspace', '--add-missing', dir);
    assert.ok(fs.existsSync(path.join(dir, name)));
  });
  test(`${locale}: chat stays a three-material conversation kit`, t => {
    const dir = temp(t);
    run('add', 'idea-to-project', '--target', 'chat-mobile', '--locale', locale, dir);
    assert.equal(files(dir).length, 3);
    assert.ok(files(dir).every(f => f.endsWith('.md')));
    assert.ok(!fs.existsSync(path.join(dir, 'rw-manifest.json')));
  });
}
