#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "../../..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const TARGETS_DIR = path.join(ROOT, "targets");

const legacyPlatformTargets = {
  "chatgpt-mobile": "chatgpt-chat",
  "claude-mobile": "claude-chat",
  "kimi-doubao": "kimi-doubao-chat",
  codex: "codex-project",
  cursor: "cursor-project",
  "notion-feishu": "notion-workspace",
};

const aliasTargets = {
  chatgpt: "chatgpt-chat",
  mobile: "chatgpt-chat",
  claude: "claude-chat",
  "claude-code": "claude-code-project",
  "claude-project": "claude-code-project",
  kimi: "kimi-doubao-chat",
  doubao: "kimi-doubao-chat",
  codex: "codex-project",
  cursor: "cursor-project",
  notion: "notion-workspace",
  feishu: "feishu-doc",
};

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "list" || command === "templates") {
    listTemplates();
    return;
  }

  if (command === "targets") {
    listTargets();
    return;
  }

  if (command === "platforms") {
    listLegacyPlatforms();
    return;
  }

  if (command === "show") {
    showTemplate(args[1]);
    return;
  }

  if (command === "show-target") {
    showTarget(args[1]);
    return;
  }

  if (command === "status") {
    upgradeWorkflow(["--check", ...args.slice(1)]);
    return;
  }

  if (command === "upgrade") {
    upgradeWorkflow(args.slice(1));
    return;
  }

  if (command === "init" || command === "add") {
    initTemplate(args.slice(1));
    return;
  }

  fail(`Unknown command: ${command}`);
}

function printHelp() {
  console.log(`RecoWork CLI

Usage:
  rw list
  rw targets
  rw show <template>
  rw show-target <target>
  rw add <template> --target <target> [--locale <locale>] <destination>
  rw init <template> --target <target> [--locale <locale>] <destination>
  rw status <destination>
  rw upgrade [--check|--plan|--apply] [--scope <methods,target,workspace>] [--add-missing] <destination>
  rw upgrade --adopt <destination>

Compatibility:
  rw platforms
  rw add <template> --platform <legacy-platform> <destination>

Examples:
  rw add general --target chatgpt-chat ./my-ai-workflow
  rw add project --target codex-project --locale zh .
  rw add project --target claude-code-project --locale en .
  rw add learning -t notion-workspace ./langchain-study
  rw upgrade --check .
  rw upgrade --plan .
`);
}

function listTemplates() {
  for (const template of getTemplates()) {
    console.log(`${template.id}\n  ${template.name}\n  ${template.description}\n`);
  }
}

function listTargets() {
  for (const target of getTargets()) {
    console.log(`${target.id}\n  ${target.name}\n  type: ${target.type}\n  ${target.description}\n`);
  }
}

function listLegacyPlatforms() {
  console.log(Object.keys(legacyPlatformTargets).sort().join("\n"));
}

function showTemplate(templateRef) {
  const template = resolveTemplate(templateRef);
  console.log(`${template.name}

id: ${template.id}
description: ${template.description}
default_target: ${getDefaultTarget(template)}
default_locale: ${getDefaultLocale(template)}
supported_targets:
${getSupportedTargets(template).map((target) => `  - ${target}`).join("\n")}
supported_locales:
${getSupportedLocales(template).map((locale) => `  - ${locale}`).join("\n")}
aliases:
${(template.aliases || []).map((alias) => `  - ${alias}`).join("\n")}
outputs:
${(template.outputs || []).map((output) => `  - ${output}`).join("\n")}
`);
}

function showTarget(targetRef) {
  const target = resolveTarget(targetRef);
  console.log(`${target.name}

id: ${target.id}
type: ${target.type}
description: ${target.description}
aliases:
${(target.aliases || []).map((alias) => `  - ${alias}`).join("\n")}
`);
}

function initTemplate(args) {
  const templateRef = args[0];
  if (!templateRef) {
    fail("Missing template name.");
  }

  const requestedTarget = readOption(args, "target", "t");
  const requestedPlatform = readOption(args, "platform", "p");
  const requestedLocale = readOption(args, "locale", "l");
  const targetArg = readDestination(args);
  const targetDir = path.resolve(process.cwd(), targetArg || ".");
  const template = resolveTemplate(templateRef);
  const templateDir = path.join(TEMPLATES_DIR, template.id);
  const selectedLocale = resolveRequestedLocale(requestedLocale, template);
  const selectedTarget = resolveRequestedTarget(requestedTarget, requestedPlatform, template);
  const supportedTargets = getSupportedTargets(template);

  if (!supportedTargets.includes(selectedTarget.id)) {
    fail(`${template.id} does not support target: ${selectedTarget.id}`);
  }

  const localizedTemplateDir = resolveTemplateContentDir(templateDir, selectedLocale);
  const selectedTargetDir = path.join(TARGETS_DIR, selectedTarget.id);
  if (!fs.existsSync(selectedTargetDir)) {
    fail(`Target not found: ${selectedTarget.id}`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  cleanupLegacyTemplatePaths(template.id, targetDir);
  cleanupLocalizedExampleOutputs(templateDir, template, selectedLocale, targetDir);
  copyIfExists(path.join(localizedTemplateDir, "README.md"), path.join(targetDir, "README.md"));
  copyDir(path.join(localizedTemplateDir, "工作方法"), path.join(targetDir, "工作方法"));
  copyDir(path.join(localizedTemplateDir, "methods"), path.join(targetDir, "methods"));
  copyDir(path.join(localizedTemplateDir, "core"), path.join(targetDir, "工作方法"));
  const exampleDirName = selectedLocale === "zh" ? "示例" : "examples";
  copyDir(path.join(templateDir, "examples"), path.join(targetDir, exampleDirName));
  copyDir(
    path.join(localizedTemplateDir, "examples"),
    path.join(targetDir, exampleDirName),
  );
  copyTemplateAssets(localizedTemplateDir, targetDir);
  cleanupTargetLocaleOutputs(selectedTargetDir, selectedTarget, selectedLocale, targetDir);
  renderTargetFiles(path.join(selectedTargetDir, "files"), targetDir, template, selectedTarget, selectedLocale);
  renderTargetFiles(
    path.join(selectedTargetDir, "locales", selectedLocale, "files"),
    targetDir,
    template,
    selectedTarget,
    selectedLocale,
  );
  writeManifest(targetDir, template, selectedTarget, selectedLocale);

  console.log(`Initialized ${template.id} for ${selectedTarget.id} (${selectedLocale})`);
  console.log(`Target: ${targetDir}`);
}

function upgradeWorkflow(args) {
  const targetArg = readDestination(args);
  const targetDir = path.resolve(process.cwd(), targetArg || ".");
  const manifestPath = path.join(targetDir, "rw-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    fail(`No rw-manifest.json found in: ${targetDir}`);
  }

  const manifest = readManifest(manifestPath);
  if (args.includes("--adopt")) {
    adoptWorkflow(targetDir, manifest);
    return;
  }

  if (manifest.schema_version !== 2 || !manifest.files) {
    console.log("This workflow uses a legacy RecoWork manifest and has no upgrade baseline.");
    console.log("Run `rw upgrade --adopt <destination>` to record the current files without overwriting them.");
    return;
  }

  const template = resolveTemplate(manifest.template);
  const target = resolveTarget(manifest.target);
  const locale = resolveRequestedLocale(manifest.locale, template);
  const mode = args.includes("--apply") ? "apply" : args.includes("--plan") ? "plan" : "check";
  const scopes = parseUpgradeScopes(readOption(args, "scope", "s"));
  const plan = buildUpgradePlan(targetDir, manifest, template, target, locale);

  printUpgradePlan(plan, manifest, mode, scopes);

  if (mode !== "apply") {
    return;
  }

  const addMissing = args.includes("--add-missing");
  const applied = applyUpgradePlan(targetDir, manifest, plan, scopes, addMissing);
  const hasWorkspaceScope = scopes.has("workspace");
  const hasWorkspaceItems = plan.items.some((item) => item.ownership === "workspace");
  const reportPath = hasWorkspaceScope && hasWorkspaceItems
    ? writeUpgradeReport(targetDir, template, locale, plan, applied)
    : null;
  refreshAppliedVersions(targetDir, manifest, template, target, locale);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nApplied ${applied.updated} update(s) and added ${applied.added} missing file(s).`);
  if (reportPath) {
    console.log(`Upgrade report: ${reportPath}`);
  }
}

function readManifest(manifestPath) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    fail(`Cannot read manifest: ${manifestPath}`);
  }
}

function parseUpgradeScopes(value) {
  const supported = new Set(["methods", "target", "workspace"]);
  if (!value) {
    return new Set(["methods", "target"]);
  }
  const scopes = new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
  for (const scope of scopes) {
    if (!supported.has(scope)) {
      fail(`Unknown upgrade scope: ${scope}. Supported scopes: methods, target, workspace`);
    }
  }
  return scopes;
}

function adoptWorkflow(targetDir, previousManifest) {
  const template = resolveTemplate(previousManifest.template);
  const target = resolveTarget(previousManifest.target);
  const locale = resolveRequestedLocale(previousManifest.locale, template);
  const desiredFiles = collectDesiredFiles(template, target, locale);
  const files = {};

  for (const [relativePath, desired] of Object.entries(desiredFiles)) {
    const outputPath = path.join(targetDir, relativePath);
    if (!fs.existsSync(outputPath) || !fs.statSync(outputPath).isFile()) {
      continue;
    }
    const currentHash = hashFile(outputPath);
    files[relativePath] = {
      ownership: desired.ownership,
      source_hash: desired.hash,
      baseline_hash: currentHash,
      user_modified: desired.ownership === "workspace" || currentHash !== desired.hash,
    };
  }

  const manifest = createManifest(template, target, locale, files, previousManifest.generated_at);
  fs.writeFileSync(
    path.join(targetDir, "rw-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`Adopted ${Object.keys(files).length} existing RecoWork file(s) without changing project files.`);
}

function buildUpgradePlan(targetDir, manifest, template, target, locale) {
  const desiredFiles = collectDesiredFiles(template, target, locale);
  const items = [];
  const trackedPaths = new Set(Object.keys(manifest.files));

  for (const [relativePath, desired] of Object.entries(desiredFiles)) {
    const tracked = manifest.files[relativePath];
    const outputPath = path.join(targetDir, relativePath);
    const exists = fs.existsSync(outputPath) && fs.statSync(outputPath).isFile();
    const currentHash = exists ? hashFile(outputPath) : null;

    if (!tracked) {
      items.push({
        relativePath,
        ownership: desired.ownership,
        state: exists ? "untracked" : desired.ownership === "workspace" ? "workspace-missing" : "missing",
        action: exists ? "preserve" : desired.ownership === "workspace" ? "suggest-add" : "add",
        upstreamChanged: true,
        desired,
      });
      continue;
    }

    const upstreamChanged = tracked.source_hash !== desired.hash;
    const userChanged = currentHash !== tracked.baseline_hash
      || (tracked.user_modified && desired.ownership !== "workspace");
    if (!upstreamChanged && !userChanged) {
      continue;
    }

    if (desired.ownership === "workspace") {
      items.push({
        relativePath,
        ownership: desired.ownership,
        state: userChanged ? "workspace-user-changed" : "workspace-template-changed",
        action: "suggest-review",
        upstreamChanged,
        desired,
      });
      continue;
    }

    if (upstreamChanged && !userChanged) {
      items.push({
        relativePath,
        ownership: desired.ownership,
        state: "safe-update",
        action: "update",
        upstreamChanged,
        desired,
      });
      continue;
    }

    items.push({
      relativePath,
      ownership: desired.ownership,
      state: userChanged && upstreamChanged ? "conflict" : "user-changed",
      action: "preserve",
      upstreamChanged,
      desired,
    });
  }

  for (const [relativePath, tracked] of Object.entries(manifest.files)) {
    if (!desiredFiles[relativePath]) {
      items.push({
        relativePath,
        ownership: tracked.ownership,
        state: "retired-upstream-file",
        action: "preserve",
        upstreamChanged: true,
      });
    }
  }

  return { desiredFiles, items };
}

function applyUpgradePlan(targetDir, manifest, plan, scopes, addMissing) {
  const applied = { updated: 0, added: 0 };
  for (const item of plan.items) {
    const scope = item.ownership === "template" ? "methods" : item.ownership;
    if (!scopes.has(scope)) {
      continue;
    }
    const canUpdate = item.action === "update";
    const canAdd = item.action === "add" || (item.action === "suggest-add" && addMissing);
    if (!canUpdate && !canAdd) {
      continue;
    }

    const outputPath = path.join(targetDir, item.relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, item.desired.content);
    manifest.files[item.relativePath] = {
      ownership: item.ownership,
      source_hash: item.desired.hash,
      baseline_hash: item.desired.hash,
      user_modified: item.ownership === "workspace",
    };
    if (canUpdate) {
      applied.updated += 1;
    } else {
      applied.added += 1;
    }
  }
  manifest.last_upgraded_at = new Date().toISOString();
  return applied;
}

function refreshAppliedVersions(targetDir, manifest, template, target, locale) {
  const remainingPlan = buildUpgradePlan(targetDir, manifest, template, target, locale);
  const hasPendingChanges = (ownerships) => remainingPlan.items.some((item) => {
    return ownerships.has(item.ownership) && item.upstreamChanged;
  });

  manifest.recowork_version = getCliVersion();
  manifest.detected_template_version = getTemplateVersion(template);
  manifest.detected_target_version = getTargetVersion(target);
  if (!hasPendingChanges(new Set(["methods", "template", "workspace"]))) {
    manifest.template_version = getTemplateVersion(template);
  }
  if (!hasPendingChanges(new Set(["target"]))) {
    manifest.target_version = getTargetVersion(target);
  }
}

function printUpgradePlan(plan, manifest, mode, scopes) {
  const scopedItems = plan.items.filter((item) => {
    const scope = item.ownership === "template" ? "methods" : item.ownership;
    return scopes.has(scope);
  });
  const grouped = new Map();
  for (const item of scopedItems) {
    const key = item.state;
    grouped.set(key, [...(grouped.get(key) || []), item]);
  }
  console.log(`RecoWork upgrade ${mode}`);
  console.log(`Current: template ${manifest.template_version || "unknown"}, target ${manifest.target_version || "unknown"}`);
  console.log(`Available: template ${getTemplateVersion(resolveTemplate(manifest.template))}, target ${getTargetVersion(resolveTarget(manifest.target))}`);
  console.log(`Scopes: ${[...scopes].join(", ")}`);

  if (!scopedItems.length) {
    console.log("\nNo generated-file changes detected.");
    return;
  }

  for (const [state, items] of grouped) {
    console.log(`\n${formatUpgradeState(state)} (${items.length})`);
    for (const item of items) {
      console.log(`  - ${item.relativePath}`);
    }
  }

  if (mode !== "apply") {
    console.log("\nNo files were changed. Use `rw upgrade --apply` for safe methods/target updates.");
    console.log("Use `--scope workspace --add-missing` only to create missing workspace additions; existing workspace files are never overwritten.");
  }
}

function formatUpgradeState(state) {
  return {
    "safe-update": "Safe updates",
    missing: "Missing generated files",
    "workspace-missing": "New missing workspace templates",
    untracked: "Existing untracked files",
    "workspace-template-changed": "Workspace template changes requiring review",
    "workspace-user-changed": "User-owned workspace files requiring review",
    conflict: "Files changed by both you and RecoWork",
    "user-changed": "User-modified files preserved",
    "retired-upstream-file": "Files no longer emitted by the current template",
  }[state] || state;
}

function writeUpgradeReport(targetDir, template, locale, plan, applied) {
  const reportDir = path.join(targetDir, ".recowork", "upgrade-reports");
  const reportFile = locale === "zh"
    ? `${new Date().toISOString().slice(0, 10)}-工作空间升级建议.md`
    : `${new Date().toISOString().slice(0, 10)}-workspace-upgrade-report.md`;
  const workspaceItems = plan.items.filter((item) => item.ownership === "workspace");
  const title = locale === "zh" ? "工作空间升级建议" : "Workspace Upgrade Report";
  const conclusion = locale === "zh"
    ? "本报告只列出新版工作空间模板与当前项目之间的差异。RecoWork 未覆盖、移动或删除任何已有工作空间文件。"
    : "This report lists differences between the current project and newer workspace templates. RecoWork did not overwrite, move, or delete existing workspace files.";
  const body = workspaceItems.length
    ? workspaceItems.map((item) => `- \`${item.relativePath}\`：${describeWorkspaceAction(item, locale)}`).join("\n")
    : locale === "zh" ? "- 未检测到需要人工处理的工作空间变化。" : "- No workspace changes need manual review.";
  const nextSteps = locale === "zh"
    ? [
      "1. 对照每项建议确认当前项目是否已有等价内容。",
      "2. 新增文件可使用 `rw upgrade --apply --scope workspace --add-missing .` 补齐；该命令不会修改已有工作空间文件。",
      "3. 涉及已有文档时，先人工或让 AI 按本报告合并，并更新相关 `index.md`。",
    ]
    : [
      "1. Check whether the current project already has equivalent content for each suggestion.",
      "2. Use `rw upgrade --apply --scope workspace --add-missing .` only to add missing files; it never changes existing workspace files.",
      "3. Merge changes to existing documents manually or with an AI, then update the affected `index.md` files.",
    ];
  const manifestReference = path.relative(reportDir, path.join(targetDir, "rw-manifest.json")).split(path.sep).join("/");
  const content = `# ${title}\n\n${locale === "zh" ? `- 版本：${getCliVersion()}\n- 日期：${new Date().toISOString().slice(0, 10)}\n- 状态：待评审` : `- Version: ${getCliVersion()}\n- Date: ${new Date().toISOString().slice(0, 10)}\n- Status: Review required`}\n\n## ${locale === "zh" ? "结论" : "Conclusion"}\n\n${conclusion}\n\n## ${locale === "zh" ? "需要处理的变化" : "Changes To Review"}\n\n${body}\n\n## ${locale === "zh" ? "建议操作" : "Suggested Actions"}\n\n${nextSteps.join("\n")}\n\n## ${locale === "zh" ? "关联引用" : "Related References"}\n\n- [rw-manifest.json](${manifestReference})\n\n## ${locale === "zh" ? "本次自动操作" : "Automatic Actions"}\n\n- ${locale === "zh" ? `更新 ${applied.updated} 个文件，新增 ${applied.added} 个缺失文件。` : `Updated ${applied.updated} file(s) and added ${applied.added} missing file(s).`}\n\n## ${locale === "zh" ? "变更记录" : "Change Log"}\n\n| ${locale === "zh" ? "日期" : "Date"} | ${locale === "zh" ? "变更" : "Change"} |\n| --- | --- |\n| ${new Date().toISOString().slice(0, 10)} | ${locale === "zh" ? "由 RecoWork 升级顾问生成" : "Generated by the RecoWork upgrade advisor"} |\n`;
  fs.mkdirSync(reportDir, { recursive: true });
  const outputPath = path.join(reportDir, reportFile);
  fs.writeFileSync(outputPath, content);
  return path.relative(targetDir, outputPath);
}

function describeWorkspaceAction(item, locale) {
  const messages = locale === "zh"
    ? {
      "suggest-add": "新版新增的模板；可选择补齐，现有文件不会被修改。",
      "suggest-review": "已有工作空间内容需要人工比对和合并；不会自动覆盖。",
    }
    : {
      "suggest-add": "A newly added template file; you may add it without changing existing files.",
      "suggest-review": "Existing workspace content needs manual comparison and merge; it will not be overwritten automatically.",
    };
  return messages[item.action] || item.action;
}

function getTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fail(`Templates directory not found: ${TEMPLATES_DIR}`);
  }

  return fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readTemplate(path.join(TEMPLATES_DIR, entry.name)))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getTargets() {
  if (!fs.existsSync(TARGETS_DIR)) {
    fail(`Targets directory not found: ${TARGETS_DIR}`);
  }

  return fs
    .readdirSync(TARGETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readTargetManifest(path.join(TARGETS_DIR, entry.name)))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getSupportedTargets(template) {
  const available = new Set(getTargets().map((target) => target.id));
  const declared = template.supported_targets && template.supported_targets.length
    ? template.supported_targets
    : mapLegacyPlatforms(template.supported_platforms || []);
  const supported = declared.length ? declared : [...available];
  return supported.filter((target) => available.has(target));
}

function getDefaultTarget(template) {
  if (template.default_target) {
    return template.default_target;
  }
  if (template.default_platform && legacyPlatformTargets[template.default_platform]) {
    return legacyPlatformTargets[template.default_platform];
  }
  return getSupportedTargets(template)[0];
}

function getDefaultLocale(template) {
  if (template.default_locale) {
    return template.default_locale;
  }
  const locales = getSupportedLocales(template);
  return locales[0] || "zh";
}

function getSupportedLocales(template) {
  if (template.locales && template.locales.length) {
    return template.locales;
  }

  const localesDir = path.join(TEMPLATES_DIR, template.id, "locales");
  if (fs.existsSync(localesDir)) {
    const locales = fs
      .readdirSync(localesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    if (locales.length) {
      return locales;
    }
  }

  return ["zh"];
}

function resolveTemplate(templateRef) {
  if (!templateRef) {
    fail("Missing template name.");
  }

  const templates = getTemplates();
  const template = templates.find((item) => {
    return item.id === templateRef || (item.aliases || []).includes(templateRef);
  });

  if (!template) {
    fail(`Unknown template: ${templateRef}`);
  }

  return template;
}

function resolveTarget(targetRef) {
  if (!targetRef) {
    fail("Missing target name.");
  }

  const normalized = normalizeTarget(targetRef);
  const targets = getTargets();
  const target = targets.find((item) => {
    return item.id === normalized || (item.aliases || []).includes(normalized);
  });

  if (!target) {
    fail(`Unknown target: ${targetRef}`);
  }

  return target;
}

function resolveRequestedTarget(requestedTarget, requestedPlatform, template) {
  if (requestedTarget && requestedPlatform) {
    fail("Use either --target or --platform, not both.");
  }

  if (requestedTarget) {
    return resolveTarget(requestedTarget);
  }

  if (requestedPlatform) {
    const legacyTarget = legacyPlatformTargets[requestedPlatform] || aliasTargets[requestedPlatform];
    if (!legacyTarget) {
      fail(`Legacy platform cannot be mapped to a target: ${requestedPlatform}`);
    }
    return resolveTarget(legacyTarget);
  }

  return resolveTarget(getDefaultTarget(template));
}

function resolveRequestedLocale(requestedLocale, template) {
  const locale = requestedLocale || getDefaultLocale(template);
  const supportedLocales = getSupportedLocales(template);
  if (!supportedLocales.includes(locale)) {
    fail(`${template.id} does not support locale: ${locale}. Supported locales: ${supportedLocales.join(", ")}`);
  }
  return locale;
}

function resolveTemplateContentDir(templateDir, locale) {
  const localizedTemplateDir = path.join(templateDir, "locales", locale);
  if (fs.existsSync(localizedTemplateDir)) {
    return localizedTemplateDir;
  }
  return templateDir;
}

function readTemplate(templateDir) {
  const yamlPath = path.join(templateDir, "pack.yaml");
  const source = fs.readFileSync(yamlPath, "utf8");
  return parseSimpleYaml(source);
}

function readTargetManifest(targetDir) {
  const yamlPath = path.join(targetDir, "target.yaml");
  const source = fs.readFileSync(yamlPath, "utf8");
  return parseSimpleYaml(source);
}

function parseSimpleYaml(source) {
  const result = {};
  let currentList = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      result[currentList].push(listItem[1].trim());
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) {
      continue;
    }

    const key = pair[1];
    const value = pair[2].trim();
    if (value) {
      result[key] = value;
      currentList = null;
    } else {
      result[key] = [];
      currentList = key;
    }
  }

  return result;
}

function normalizeTarget(target) {
  if (!target) {
    return null;
  }
  return aliasTargets[target] || target;
}

function mapLegacyPlatforms(platforms) {
  return platforms
    .map((platform) => legacyPlatformTargets[platform] || aliasTargets[platform])
    .filter(Boolean);
}

function readOption(args, longName, shortName) {
  const longIndex = args.indexOf(`--${longName}`);
  if (longIndex >= 0) {
    return args[longIndex + 1];
  }

  const shortIndex = args.indexOf(`-${shortName}`);
  if (shortIndex >= 0) {
    return args[shortIndex + 1];
  }

  return null;
}

function readDestination(args) {
  const skipped = new Set([0]);
  for (let index = 0; index < args.length; index += 1) {
    if (["--platform", "-p", "--target", "-t", "--locale", "-l", "--scope", "-s"].includes(args[index])) {
      skipped.add(index);
      skipped.add(index + 1);
    }
    if (["--check", "--plan", "--apply", "--add-missing", "--adopt"].includes(args[index])) {
      skipped.add(index);
    }
  }

  return args.find((arg, index) => !skipped.has(index));
}

function copyIfExists(from, to) {
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    return;
  }

  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, destination);
    } else {
      fs.copyFileSync(source, destination);
    }
  }
}

function copyTemplateAssets(templateDir, targetDir) {
  const reserved = new Set(["pack.yaml", "README.md", "工作方法", "methods", "core", "examples", "locales"]);
  for (const entry of fs.readdirSync(templateDir, { withFileTypes: true })) {
    if (reserved.has(entry.name)) {
      continue;
    }

    const source = path.join(templateDir, entry.name);
    const destination = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, destination);
    } else {
      fs.copyFileSync(source, destination);
    }
  }
}

function collectDesiredFiles(template, target, locale) {
  const templateDir = path.join(TEMPLATES_DIR, template.id);
  const localizedTemplateDir = resolveTemplateContentDir(templateDir, locale);
  const localePaths = getLocalePaths(locale, template);
  const files = {};
  const addFile = (relativePath, content, ownership) => {
    const normalizedPath = relativePath.split(path.sep).join("/");
    files[normalizedPath] = { content, hash: hashContent(content), ownership };
  };
  const addDirectory = (sourceDir, outputPrefix, ownership, render = false) => {
    if (!fs.existsSync(sourceDir)) {
      return;
    }
    for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
      const sourcePath = path.join(sourceDir, entry.name);
      const outputName = render && entry.name.endsWith(".tpl") ? entry.name.slice(0, -4) : entry.name;
      const outputPath = path.join(outputPrefix, outputName);
      if (entry.isDirectory()) {
        addDirectory(sourcePath, outputPath, ownership, render);
      } else {
        const source = fs.readFileSync(sourcePath, "utf8");
        addFile(outputPath, render ? renderTemplate(source, template, target, locale) : source, ownership);
      }
    }
  };

  if (fs.existsSync(path.join(localizedTemplateDir, "README.md"))) {
    addFile("README.md", fs.readFileSync(path.join(localizedTemplateDir, "README.md"), "utf8"), "template");
  }
  addDirectory(path.join(localizedTemplateDir, "工作方法"), "工作方法", "methods");
  addDirectory(path.join(localizedTemplateDir, "methods"), "methods", "methods");
  addDirectory(path.join(localizedTemplateDir, "core"), "工作方法", "methods");

  const exampleDirName = locale === "zh" ? "示例" : "examples";
  addDirectory(path.join(templateDir, "examples"), exampleDirName, "template");
  addDirectory(path.join(localizedTemplateDir, "examples"), exampleDirName, "template");

  const reserved = new Set(["pack.yaml", "README.md", "工作方法", "methods", "core", "examples", "locales"]);
  for (const entry of fs.readdirSync(localizedTemplateDir, { withFileTypes: true })) {
    if (!reserved.has(entry.name)) {
      const ownership = entry.name === localePaths.workspaceDir ? "workspace" : "template";
      const sourcePath = path.join(localizedTemplateDir, entry.name);
      if (entry.isDirectory()) {
        addDirectory(sourcePath, entry.name, ownership);
      } else {
        addFile(entry.name, fs.readFileSync(sourcePath, "utf8"), ownership);
      }
    }
  }

  const targetDir = path.join(TARGETS_DIR, target.id);
  addDirectory(path.join(targetDir, "files"), "", "target", true);
  addDirectory(path.join(targetDir, "locales", locale, "files"), "", "target", true);
  return files;
}

function hashContent(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function getCliVersion() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
}

function getTemplateVersion(template) {
  return template.version || "0.0.0";
}

function getTargetVersion(target) {
  return target.version || "0.0.0";
}

function cleanupLegacyTemplatePaths(templateId, targetDir) {
  const legacyFilesByTemplate = {
    "learning-engineering": [
      path.join("工作方法", "工作流程.md"),
      path.join("工作方法", "章节模板.md"),
      path.join("工作方法", "进度追踪.md"),
      path.join("工作方法", "角色设定.md"),
      path.join("工作方法", "学习方法.md"),
      path.join("工作方法", "课程单元模板.md"),
      path.join("工作方法", "评估与复盘.md"),
      path.join("学习空间", "index.md"),
      path.join("学习空间", "学习简报.md"),
      path.join("学习空间", "课程路线.md"),
      path.join("学习空间", "学习进度.md"),
      path.join("学习空间", "01-课程设计", "index.md"),
      path.join("学习空间", "02-课程与练习", "index.md"),
      path.join("学习空间", "02-课程与练习", "课程单元模板.md"),
      path.join("学习空间", "03-项目实践", "index.md"),
      path.join("学习空间", "04-问题与复盘", "index.md"),
      path.join("学习空间", "05-知识沉淀", "index.md"),
      path.join("methods", "role-contract.md"),
      path.join("methods", "learning-method.md"),
      path.join("methods", "lesson-template.md"),
      path.join("methods", "assessment-and-retrospective.md"),
      path.join("learning-workspace", "index.md"),
      path.join("learning-workspace", "learner-brief.md"),
      path.join("learning-workspace", "course-roadmap.md"),
      path.join("learning-workspace", "learning-progress.md"),
      path.join("learning-workspace", "01-course-design", "index.md"),
      path.join("learning-workspace", "02-lessons-and-practice", "index.md"),
      path.join("learning-workspace", "02-lessons-and-practice", "lesson-unit-template.md"),
      path.join("learning-workspace", "03-project-practice", "index.md"),
      path.join("learning-workspace", "04-questions-and-retrospectives", "index.md"),
      path.join("learning-workspace", "05-knowledge-capture", "index.md"),
    ],
    "general-ai-workflow": [
      path.join("工作方法", "工作流程.md"),
      path.join("工作方法", "检查清单.md"),
      path.join("工作方法", "记忆卡.md"),
      path.join("工作方法", "角色设定.md"),
      path.join("工作方法", "记忆卡模板.md"),
      path.join("工作空间", "index.md"),
      path.join("工作空间", "任务简报.md"),
      path.join("工作空间", "待确认问题.md"),
      path.join("工作空间", "01-任务准备", "index.md"),
      path.join("工作空间", "02-任务产出", "index.md"),
      path.join("工作空间", "03-过程留痕", "index.md"),
      path.join("工作空间", "04-复盘与沉淀", "index.md"),
      path.join("methods", "workflow.md"),
      path.join("methods", "quality-checklist.md"),
      path.join("methods", "continuation-memory-template.md"),
      path.join("methods", "role-contract.md"),
      path.join("workspace", "index.md"),
      path.join("workspace", "task-brief.md"),
      path.join("workspace", "open-questions.md"),
      path.join("workspace", "01-task-setup", "index.md"),
      path.join("workspace", "02-task-output", "index.md"),
      path.join("workspace", "03-thinking-traces", "index.md"),
      path.join("workspace", "04-review-and-reuse", "index.md"),
    ],
    "project-engineering": [
      path.join("工作空间", "project-brief.md"),
      path.join("工作空间", "open-questions.md"),
      path.join("工作空间", "06-思考留痕", "待确认问题清单.md"),
      path.join("工作空间", "00-项目总览", "index.md"),
      path.join("工作空间", "00-项目总览", "项目简介.md"),
      path.join("工作空间", "00-项目总览", "目标与范围.md"),
      path.join("工作空间", "01-需求分析", "index.md"),
      path.join("工作空间", "02-分析评估", "index.md"),
      path.join("工作空间", "02-分析评估", "关键取舍分析.md"),
      path.join("工作空间", "03-技术设计", "index.md"),
      path.join("工作空间", "03-技术设计", "整体架构设计.md"),
      path.join("工作空间", "04-项目规划", "index.md"),
      path.join("工作空间", "04-项目规划", "阶段划分与推进路径.md"),
      path.join("工作空间", "05-决策记录", "index.md"),
      path.join("工作空间", "05-决策记录", "决策记录", "001-template.md"),
      path.join("工作空间", "06-思考留痕", "index.md"),
      path.join("工作空间", "06-思考留痕", "头脑风暴", "index.md"),
      path.join("工作空间", "07-评审验证", "index.md"),
      path.join("workspace", "project-brief.md"),
      path.join("workspace", "open-questions.md"),
      path.join("工作方法", "使用场景.md"),
      path.join("工作方法", "工作流程.md"),
      path.join("工作方法", "知识结构.md"),
      path.join("工作方法", "质量门禁.md"),
      path.join("工作方法", "角色设定.md"),
      path.join("工作空间", "index.md"),
      path.join("工作空间", "项目简报.md"),
      path.join("工作空间", "待确认问题.md"),
      path.join("工作空间", "01-需求与约束", "index.md"),
      path.join("工作空间", "02-方案设计", "index.md"),
      path.join("工作空间", "02-方案设计", "关键取舍分析.md"),
      path.join("工作空间", "02-方案设计", "整体架构设计.md"),
      path.join("工作空间", "03-计划与决策", "index.md"),
      path.join("工作空间", "03-计划与决策", "阶段划分与推进路径.md"),
      path.join("工作空间", "03-计划与决策", "决策记录", "001-template.md"),
      path.join("工作空间", "04-过程留痕", "index.md"),
      path.join("工作空间", "04-过程留痕", "头脑风暴", "index.md"),
      path.join("工作空间", "05-评审验证", "index.md"),
      path.join("methods", "scenarios.md"),
      path.join("methods", "workflow.md"),
      path.join("methods", "knowledge-structure.md"),
      path.join("methods", "quality-gates.md"),
      path.join("methods", "role-contract.md"),
      path.join("workspace", "index.md"),
      path.join("workspace", "project-brief.md"),
      path.join("workspace", "open-questions.md"),
      path.join("workspace", "01-requirements-and-constraints", "index.md"),
      path.join("workspace", "02-solution-design", "index.md"),
      path.join("workspace", "02-solution-design", "tradeoff-analysis.md"),
      path.join("workspace", "02-solution-design", "architecture-design.md"),
      path.join("workspace", "03-plan-and-decisions", "index.md"),
      path.join("workspace", "03-plan-and-decisions", "delivery-plan.md"),
      path.join("workspace", "03-plan-and-decisions", "decision-records", "001-template.md"),
      path.join("workspace", "04-thinking-traces", "index.md"),
      path.join("workspace", "04-thinking-traces", "brainstorming", "index.md"),
      path.join("workspace", "05-review-and-validation", "index.md"),
    ],
  };
  const legacyDirsByTemplate = {
    "learning-engineering": [
      path.join("工作方法"),
      path.join("学习空间", "01-课程设计"),
      path.join("学习空间", "02-课程与练习"),
      path.join("学习空间", "03-项目实践"),
      path.join("学习空间", "04-问题与复盘"),
      path.join("学习空间", "05-知识沉淀"),
      path.join("学习空间"),
      path.join("methods"),
      path.join("learning-workspace", "01-course-design"),
      path.join("learning-workspace", "02-lessons-and-practice"),
      path.join("learning-workspace", "03-project-practice"),
      path.join("learning-workspace", "04-questions-and-retrospectives"),
      path.join("learning-workspace", "05-knowledge-capture"),
      path.join("learning-workspace"),
    ],
    "general-ai-workflow": [
      path.join("工作方法"),
      path.join("工作空间", "01-任务准备"),
      path.join("工作空间", "02-任务产出"),
      path.join("工作空间", "03-过程留痕"),
      path.join("工作空间", "04-复盘与沉淀"),
      path.join("工作空间"),
      path.join("methods"),
      path.join("workspace", "01-task-setup"),
      path.join("workspace", "02-task-output"),
      path.join("workspace", "03-thinking-traces"),
      path.join("workspace", "04-review-and-reuse"),
      path.join("workspace"),
    ],
    "project-engineering": [
      path.join("工作方法"),
      path.join("工作空间", "01-需求与约束"),
      path.join("工作空间", "02-方案设计"),
      path.join("工作空间", "03-计划与决策", "决策记录"),
      path.join("工作空间", "03-计划与决策"),
      path.join("工作空间", "04-过程留痕", "头脑风暴"),
      path.join("工作空间", "04-过程留痕"),
      path.join("工作空间", "05-评审验证"),
      path.join("工作空间"),
      path.join("methods"),
      path.join("workspace", "01-requirements-and-constraints"),
      path.join("workspace", "02-solution-design"),
      path.join("workspace", "03-plan-and-decisions", "decision-records"),
      path.join("workspace", "03-plan-and-decisions"),
      path.join("workspace", "04-thinking-traces", "brainstorming"),
      path.join("workspace", "04-thinking-traces"),
      path.join("workspace", "05-review-and-validation"),
      path.join("工作空间", "00-项目总览"),
      path.join("工作空间", "01-需求分析"),
      path.join("工作空间", "02-分析评估"),
      path.join("工作空间", "03-技术设计"),
      path.join("工作空间", "04-项目规划"),
      path.join("工作空间", "05-决策记录", "决策记录"),
      path.join("工作空间", "05-决策记录"),
      path.join("工作空间", "06-思考留痕", "头脑风暴"),
      path.join("工作空间", "06-思考留痕"),
      path.join("工作空间", "07-评审验证"),
      path.join("工作空间"),
      path.join("工作方法"),
      "workspace",
      "methods",
    ],
  };

  for (const relativePath of legacyFilesByTemplate[templateId] || []) {
    const absolutePath = path.join(targetDir, relativePath);
    if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
      fs.rmSync(absolutePath);
    }
  }

  for (const relativePath of legacyDirsByTemplate[templateId] || []) {
    const absolutePath = path.join(targetDir, relativePath);
    if (
      fs.existsSync(absolutePath)
      && fs.statSync(absolutePath).isDirectory()
      && fs.readdirSync(absolutePath).length === 0
    ) {
      fs.rmdirSync(absolutePath);
    }
  }
}

function cleanupLocalizedExampleOutputs(templateDir, template, locale, outputDir) {
  const manifestPath = path.join(outputDir, "rw-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.template !== template.id) {
      return;
    }
  } catch {
    return;
  }

  const previousExampleDir = locale === "zh" ? "examples" : "示例";
  const sourceDirs = [
    path.join(templateDir, "examples"),
    path.join(templateDir, "locales", "zh", "examples"),
  ];
  for (const sourceDir of sourceDirs) {
    for (const relativePath of getRenderedTargetPaths(sourceDir)) {
      const outputPath = path.join(outputDir, previousExampleDir, relativePath);
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isFile()) {
        fs.rmSync(outputPath);
        removeEmptyParentDirectories(path.dirname(outputPath), outputDir);
      }
    }
  }
}

function renderTargetFiles(from, to, template, target, locale) {
  if (!fs.existsSync(from)) {
    return;
  }

  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const outputName = entry.name.endsWith(".tpl")
      ? entry.name.slice(0, -4)
      : entry.name;
    const destination = path.join(to, outputName);

    if (entry.isDirectory()) {
      renderTargetFiles(source, destination, template, target, locale);
    } else {
      const content = fs.readFileSync(source, "utf8");
      fs.writeFileSync(destination, renderTemplate(content, template, target, locale));
    }
  }
}

function cleanupTargetLocaleOutputs(targetDir, target, locale, outputDir) {
  const manifestPath = path.join(outputDir, "rw-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.target !== target.id) {
      return;
    }
  } catch {
    return;
  }

  const localesDir = path.join(targetDir, "locales");
  if (!fs.existsSync(localesDir)) {
    return;
  }

  const selectedFiles = new Set(
    getRenderedTargetPaths(path.join(localesDir, locale, "files")),
  );
  for (const entry of fs.readdirSync(localesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === locale) {
      continue;
    }

    for (const relativePath of getRenderedTargetPaths(path.join(localesDir, entry.name, "files"))) {
      if (selectedFiles.has(relativePath)) {
        continue;
      }
      const outputPath = path.join(outputDir, relativePath);
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isFile()) {
        fs.rmSync(outputPath);
        removeEmptyParentDirectories(path.dirname(outputPath), outputDir);
      }
    }
  }
}

function getRenderedTargetPaths(directory, prefix = "") {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const paths = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const outputName = entry.name.endsWith(".tpl")
      ? entry.name.slice(0, -4)
      : entry.name;
    const relativePath = path.join(prefix, outputName);
    if (entry.isDirectory()) {
      paths.push(...getRenderedTargetPaths(path.join(directory, entry.name), relativePath));
    } else {
      paths.push(relativePath);
    }
  }
  return paths;
}

function removeEmptyParentDirectories(directory, stopAt) {
  let current = directory;
  while (current.startsWith(stopAt) && current !== stopAt && fs.existsSync(current)) {
    if (fs.readdirSync(current).length) {
      return;
    }
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function renderTemplate(source, template, target, locale) {
  const localePaths = getLocalePaths(locale, template);
  const localeStrings = getLocaleStrings(locale, template, target, localePaths);
  const localizedTemplate = getLocalizedTemplateMetadata(template, locale);
  const values = {
    template_id: template.id,
    template_name: localizedTemplate.name,
    template_description: localizedTemplate.description,
    pack_id: template.id,
    pack_name: localizedTemplate.name,
    pack_description: localizedTemplate.description,
    target: target.id,
    platform: target.id,
    locale,
    methods_dir: localePaths.methodsDir,
    workspace_dir: localePaths.workspaceDir,
    brief_file: localePaths.briefFile,
    questions_file: localePaths.questionsFile,
    role_file: localePaths.roleFile,
    knowledge_dir: localePaths.knowledgeDir,
    target_intro: localeStrings.targetIntro,
    heading_purpose: localeStrings.headingPurpose,
    heading_audience: localeStrings.headingAudience,
    heading_expected_outputs: localeStrings.headingExpectedOutputs,
    heading_working_protocol: localeStrings.headingWorkingProtocol,
    heading_rules: localeStrings.headingRules,
    rule_read_project_context: localeStrings.ruleReadProjectContext,
    rule_capture_knowledge: localeStrings.ruleCaptureKnowledge,
    rule_review_output: localeStrings.ruleReviewOutput,
    rule_confirm_large_changes: localeStrings.ruleConfirmLargeChanges,
    rule_use_claude_skills: localeStrings.ruleUseClaudeSkills,
    rule_keep_knowledge: localeStrings.ruleKeepKnowledge,
    rule_keep_scoped: localeStrings.ruleKeepScoped,
    rule_explain_verification: localeStrings.ruleExplainVerification,
    chat_init_title: localeStrings.chatInitTitle,
    chat_init_intro: localeStrings.chatInitIntro,
    chat_init_instruction: localeStrings.chatInitInstruction,
    chat_task_title: localeStrings.chatTaskTitle,
    chat_task_intro: localeStrings.chatTaskIntro,
    chat_task_field_task: localeStrings.chatTaskFieldTask,
    chat_task_field_context: localeStrings.chatTaskFieldContext,
    chat_task_field_constraints: localeStrings.chatTaskFieldConstraints,
    chat_task_instruction: localeStrings.chatTaskInstruction,
    chat_memory_title: localeStrings.chatMemoryTitle,
    chat_memory_template: localeStrings.chatMemoryTemplate,
    chat_memory_target: localeStrings.chatMemoryTarget,
    chat_memory_goal: localeStrings.chatMemoryGoal,
    chat_memory_decisions: localeStrings.chatMemoryDecisions,
    chat_memory_next: localeStrings.chatMemoryNext,
    claude_instructions_title: localeStrings.claudeInstructionsTitle,
    claude_instructions_intro: localeStrings.claudeInstructionsIntro,
    claude_instructions_rule: localeStrings.claudeInstructionsRule,
    outputs: formatList(localizedTemplate.outputs),
    audience: formatList(localizedTemplate.audience),
  };

  return source.replace(/\{\{\s*([A-Za-z0-9_-]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

function getLocalizedTemplateMetadata(template, locale) {
  if (locale === "en") {
    return {
      name: template.name_en || template.name,
      description: template.description_en || template.description,
      audience: template.audience_en || template.audience || [],
      outputs: template.outputs_en || template.outputs || [],
    };
  }

  return {
    name: template.name,
    description: template.description,
    audience: template.audience_zh || template.audience || [],
    outputs: template.outputs_zh || template.outputs || [],
  };
}

function getLocaleStrings(locale, template, target, localePaths) {
  const isGeneralWorkflow = template.id === "general-ai-workflow";
  const isLearningWorkflow = template.id === "learning-engineering";
  if (locale === "en") {
    return {
      targetIntro: `This workflow uses RecoWork template \`${template.id}\` for target \`${target.id}\` and locale \`${locale}\`.`,
      headingPurpose: "Purpose",
      headingAudience: "Audience",
      headingExpectedOutputs: "Expected Outputs",
      headingWorkingProtocol: "Working Protocol",
      headingRules: "Rules",
      ruleReadProjectContext: `Read \`README.md\`, \`${localePaths.roleFile}\`, \`${localePaths.methodsDir}/\`, \`${localePaths.workspaceDir}/\`, and \`rw-manifest.json\` before ${isLearningWorkflow ? "starting or continuing a learning unit" : isGeneralWorkflow ? "starting or continuing meaningful work" : "making changes"}.`,
      ruleCaptureKnowledge: isLearningWorkflow
        ? `Capture reusable learning insights in \`${localePaths.workspaceDir}/05-knowledge-capture/\`.`
        : isGeneralWorkflow
          ? `Capture reusable task insights in \`${localePaths.workspaceDir}/04-review-and-reuse/\`.`
        : `Capture durable project knowledge in \`${localePaths.knowledgeDir}/\`.`,
      ruleReviewOutput: "Before returning work, review the result against the template purpose and expected outputs.",
      ruleConfirmLargeChanges: "Ask for confirmation before large scope changes or irreversible operations.",
      ruleUseClaudeSkills: "Use project-scoped skills from `.claude/skills/` when they match the task.",
      ruleKeepKnowledge: isLearningWorkflow
        ? `Keep the learner brief, roadmap, progress, and retrospectives in \`${localePaths.workspaceDir}/\`; teach one validated unit at a time.`
        : isGeneralWorkflow
        ? `Keep useful task context in \`${localePaths.workspaceDir}/\` and leave a continuation memory after important work.`
        : "Keep durable project knowledge in the template-defined knowledge location.",
      ruleKeepScoped: "Keep changes scoped to the current task.",
      ruleExplainVerification: "Explain verification steps after implementation.",
      chatInitTitle: "RecoWork Initialization Prompt",
      chatInitIntro: `You are helping me use the RecoWork template \`${template.id}\`.`,
      chatInitInstruction: "Ask one concise question if the task is unclear. Otherwise, help me start the workflow, keep assumptions explicit, and leave a short continuation memory after meaningful work.",
      chatTaskTitle: "Task Prompt",
      chatTaskIntro: `Use the \`${template.id}\` workflow and its role contract.`,
      chatTaskFieldTask: "Task",
      chatTaskFieldContext: "Context",
      chatTaskFieldConstraints: "Constraints",
      chatTaskInstruction: "Before answering, restate the goal briefly. Separate facts, assumptions, and open questions. After answering, include a short memory card I can paste into the next chat.",
      chatMemoryTitle: "Continuation Memory Card",
      chatMemoryTemplate: "Template",
      chatMemoryTarget: "Target",
      chatMemoryGoal: "Current goal:",
      chatMemoryDecisions: "Confirmed decisions:",
      chatMemoryNext: "Next step:",
      claudeInstructionsTitle: "Claude Workflow Instructions",
      claudeInstructionsIntro: `Use RecoWork template \`${template.id}\` and its role contract.`,
      claudeInstructionsRule: "Work in small steps, keep assumptions explicit, ask before material direction changes, and summarize durable context after each milestone.",
    };
  }

  return {
    targetIntro: `当前工作流使用 RecoWork 模板 \`${template.id}\`，target 为 \`${target.id}\`，locale 为 \`${locale}\`。`,
    headingPurpose: "用途",
    headingAudience: "适用对象",
    headingExpectedOutputs: "预期产物",
    headingWorkingProtocol: "工作协议",
    headingRules: "规则",
    ruleReadProjectContext: `在${isLearningWorkflow ? "开始或续接一个学习单元" : isGeneralWorkflow ? "开始或续接重要任务" : "改动"}前先读取 \`README.md\`、\`${localePaths.roleFile}\`、\`${localePaths.methodsDir}/\`、\`${localePaths.workspaceDir}/\` 和 \`rw-manifest.json\`。`,
    ruleCaptureKnowledge: isLearningWorkflow
      ? `把可复用的学习结论沉淀到 \`${localePaths.workspaceDir}/05-知识沉淀/\`。`
      : isGeneralWorkflow
        ? `把可复用的任务经验沉淀到 \`${localePaths.workspaceDir}/04-复盘与沉淀/\`。`
        : `把长期有效的项目知识沉淀到 \`${localePaths.knowledgeDir}/\`。`,
    ruleReviewOutput: "返回结果前，对照模板用途和预期产物自审。",
    ruleConfirmLargeChanges: "大范围变更或不可逆操作前，先向用户确认。",
    ruleUseClaudeSkills: "当任务匹配时，使用 `.claude/skills/` 下的项目级 skills。",
    ruleKeepKnowledge: isLearningWorkflow
      ? `把学习简报、课程路线、进度和复盘放在 \`${localePaths.workspaceDir}/\`，一次只推进一个经过验证的学习单元。`
      : isGeneralWorkflow
      ? `把有效任务上下文放在 \`${localePaths.workspaceDir}/\`，重要任务结束后留下续聊记忆。`
      : "把长期项目知识放在模板定义的知识位置。",
    ruleKeepScoped: "保持改动聚焦在当前任务范围内。",
    ruleExplainVerification: "实现后说明验证步骤。",
    chatInitTitle: "RecoWork 初始化 Prompt",
    chatInitIntro: `你正在使用 RecoWork 模板 \`${template.id}\`。`,
    chatInitInstruction: "如果任务不清晰，先问一个最必要的问题。否则帮助我启动工作流，明确标注假设，并在重要任务结束后留下可复制的续聊记忆。",
    chatTaskTitle: "任务 Prompt",
    chatTaskIntro: `请按 \`${template.id}\` 工作流及其角色设定推进。`,
    chatTaskFieldTask: "任务",
    chatTaskFieldContext: "背景",
    chatTaskFieldConstraints: "约束",
    chatTaskInstruction: "回答前先简要复述目标，区分事实、假设和待确认问题。回答后给出一张可复制到下一轮对话的简短记忆卡。",
    chatMemoryTitle: "续聊记忆卡",
    chatMemoryTemplate: "模板",
    chatMemoryTarget: "目标环境",
    chatMemoryGoal: "当前目标：",
    chatMemoryDecisions: "已确认结论：",
    chatMemoryNext: "下一步：",
    claudeInstructionsTitle: "Claude 工作流说明",
    claudeInstructionsIntro: `请使用 RecoWork 模板 \`${template.id}\` 及其角色设定。`,
    claudeInstructionsRule: "分小步推进，明确标注假设，重大方向变化前先确认，并在每个阶段结束后总结可持续使用的上下文。",
  };
}

function getLocalePaths(locale, template) {
  const isGeneralWorkflow = template && template.id === "general-ai-workflow";
  const isLearningWorkflow = template && template.id === "learning-engineering";
  if (locale === "en") {
    if (isLearningWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "learning-workspace",
        briefFile: "learner-brief.md",
        questionsFile: "learning-workspace/04-questions-and-retrospectives/",
        roleFile: "methods/role-contract.md",
        knowledgeDir: "knowledge",
      };
    }
    if (isGeneralWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "workspace",
        briefFile: "task-brief.md",
        questionsFile: "open-questions.md",
        roleFile: "methods/role-contract.md",
        knowledgeDir: "knowledge",
      };
    }
    return {
      methodsDir: "methods",
      workspaceDir: "workspace",
      briefFile: "project-brief.md",
      questionsFile: "open-questions.md",
      roleFile: "methods/role-contract.md",
      knowledgeDir: "knowledge",
    };
  }

  if (isGeneralWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "工作空间",
      briefFile: "任务简报.md",
      questionsFile: "待确认问题.md",
      roleFile: "工作方法/角色设定.md",
      knowledgeDir: "知识库",
    };
  }

  if (isLearningWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "学习空间",
      briefFile: "学习简报.md",
      questionsFile: "学习空间/04-问题与复盘/",
      roleFile: "工作方法/角色设定.md",
      knowledgeDir: "知识库",
    };
  }

  return {
    methodsDir: "工作方法",
    workspaceDir: "工作空间",
    briefFile: "项目简报.md",
    questionsFile: "待确认问题.md",
    roleFile: "工作方法/角色设定.md",
    knowledgeDir: "知识库",
  };
}

function formatList(items) {
  if (!items.length) {
    return "- Not specified";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function writeManifest(targetDir, template, target, locale) {
  const desiredFiles = collectDesiredFiles(template, target, locale);
  const files = {};
  for (const [relativePath, desired] of Object.entries(desiredFiles)) {
    const outputPath = path.join(targetDir, relativePath);
    if (!fs.existsSync(outputPath) || !fs.statSync(outputPath).isFile()) {
      continue;
    }
    files[relativePath] = {
      ownership: desired.ownership,
      source_hash: desired.hash,
      baseline_hash: hashFile(outputPath),
      user_modified: desired.ownership === "workspace",
    };
  }
  const manifest = createManifest(template, target, locale, files);

  fs.writeFileSync(
    path.join(targetDir, "rw-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function createManifest(template, target, locale, files, generatedAt = new Date().toISOString()) {
  return {
    tool: "RecoWork",
    schema_version: 2,
    recowork_version: getCliVersion(),
    template: template.id,
    template_version: getTemplateVersion(template),
    target: target.id,
    target_version: getTargetVersion(target),
    locale,
    generated_at: generatedAt,
    files,
  };
}

function fail(message) {
  console.error(`rw: ${message}`);
  process.exit(1);
}

main();
