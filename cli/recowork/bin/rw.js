#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "../../..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const TARGETS_DIR = path.join(ROOT, "targets");

const legacyPlatformTargets = {
  "chatgpt-mobile": "chat-mobile",
  "claude-mobile": "chat-mobile",
  "kimi-doubao": "chat-mobile",
  codex: "local-agent-project",
  cursor: "local-agent-project",
  "notion-feishu": "local-agent-project",
};

const aliasTargets = {
  chatgpt: "chat-mobile",
  mobile: "chat-mobile",
  claude: "chat-mobile",
  "claude-code": "local-agent-project",
  "claude-project": "local-agent-project",
  kimi: "chat-mobile",
  doubao: "chat-mobile",
  "chatgpt-chat": "chat-mobile",
  "claude-chat": "chat-mobile",
  "kimi-doubao-chat": "chat-mobile",
  codex: "local-agent-project",
  cursor: "local-agent-project",
  notion: "local-agent-project",
  feishu: "local-agent-project",
  "claude-code-project": "local-agent-project",
  "codex-project": "local-agent-project",
  "cursor-project": "local-agent-project",
  "notion-workspace": "local-agent-project",
  "feishu-doc": "local-agent-project",
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
  rw add general --target chat-mobile ./my-ai-workflow
  rw add project --target local-agent-project --locale zh .
  rw add learning -t local-agent-project ./langchain-study
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

  const manifestPath = path.join(targetDir, "rw-manifest.json");
  if (fs.existsSync(manifestPath)) {
    fail(`RecoWork is already initialized in: ${targetDir}. Use \`rw status\` or \`rw upgrade\`; initialization never overwrites an existing workflow.`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  if (selectedTarget.type === "chat") {
    renderTargetFiles(
      path.join(selectedTargetDir, "locales", selectedLocale, "files"),
      targetDir,
      template,
      selectedTarget,
      selectedLocale,
    );
    console.log(`Exported lightweight chat materials for ${template.id} (${selectedLocale})`);
    console.log(`Target: ${targetDir}`);
    return;
  }

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
  const manifestTarget = resolveTarget(manifest.target);
  if (manifestTarget.type === "chat") {
    printLegacyChatMigration(targetDir, manifest);
    return;
  }
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

function printLegacyChatMigration(targetDir, manifest) {
  const template = resolveTemplate(manifest.template);
  const locale = resolveRequestedLocale(manifest.locale, template);
  const destination = `${targetDir}-local`;

  console.log("This is a legacy chat workflow. Chat targets no longer support status or in-place upgrades.");
  console.log("Your existing files remain untouched.");
  console.log("\nTo migrate safely, initialize a new local workflow:");
  console.log(`  rw add ${template.id} --target local-agent-project --locale ${locale} ${destination}`);
  console.log("\nThen transfer this continuation package into the new workspace:");
  console.log("- Project or task brief");
  console.log("- Confirmed decisions");
  console.log("- Open questions");
  console.log("- Next step");
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

  if (target.type === "chat") {
    addDirectory(path.join(TARGETS_DIR, target.id, "locales", locale, "files"), "", "target", true);
    return files;
  }

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
    chat_delivery_boundary: localeStrings.chatDeliveryBoundary,
    chat_continuity_notice: localeStrings.chatContinuityNotice,
    chat_migration_title: localeStrings.chatMigrationTitle,
    chat_migration_instruction: localeStrings.chatMigrationInstruction,
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
  const isProjectWorkflow = template.id === "project-engineering";
  const isIdeaWorkflow = template.id === "idea-engineering";
  const isChatTarget = target.type === "chat";
  if (locale === "en") {
    return {
      targetIntro: `This workflow uses RecoWork template \`${template.id}\` for target \`${target.id}\` and locale \`${locale}\`.`,
      headingPurpose: "Purpose",
      headingAudience: "Audience",
      headingExpectedOutputs: "Expected Outputs",
      headingWorkingProtocol: "Working Protocol",
      headingRules: "Rules",
      ruleReadProjectContext: `Read \`README.md\`, \`${localePaths.roleFile}\`, \`${localePaths.methodsDir}/\`, \`${localePaths.workspaceDir}/\`, and \`rw-manifest.json\` before ${isLearningWorkflow ? "starting or continuing a learning unit" : isIdeaWorkflow ? "starting or continuing an idea exploration" : isGeneralWorkflow ? "starting or continuing meaningful work" : "making changes"}.`,
      ruleCaptureKnowledge: `Capture verified conclusions in \`${localePaths.knowledgeCaptureDir}/\` and update the affected index.`,
      ruleReviewOutput: "Before returning work, review the result against the template purpose and expected outputs.",
      ruleConfirmLargeChanges: isIdeaWorkflow
        ? "Before selecting a priority direction, validation plan, or project execution, present an idea agreement and wait for the user's explicit confirmation."
        : isLearningWorkflow
        ? "Before creating or changing a roadmap, lesson content, practice plan, or project plan, present a learning agreement and wait for the learner's explicit confirmation. Also ask before large scope changes or irreversible operations."
        : isProjectWorkflow
          ? "Before generating a complete solution, plan, or implementation change, present a project agreement and wait for the user's explicit confirmation. Also ask before large scope changes or irreversible operations."
        : "Ask for confirmation before large scope changes or irreversible operations.",
      ruleKeepKnowledge: isIdeaWorkflow
        ? `Keep idea briefs, directions, hypotheses, and decisions in \`${localePaths.workspaceDir}/\`. Explore broadly first, then separate facts, assumptions, and evidence; wait for confirmation before converging on a priority direction.`
        : isLearningWorkflow
        ? `Keep the learner brief, roadmap, progress, and retrospectives in \`${localePaths.workspaceDir}/\`. Before creating or changing a roadmap, lesson, practice plan, or project plan, present a learning agreement and wait for the learner's explicit confirmation; then teach one validated unit at a time.`
        : isGeneralWorkflow
          ? `Keep useful task context in \`${localePaths.workspaceDir}/\` and leave a continuation memory after important work.`
          : `Keep durable project context in \`${localePaths.workspaceDir}/\`. Consolidate verified conclusions into the appropriate canonical document and update affected indexes. Before creating a complete solution, plan, or implementation change, present a project agreement and wait for explicit user confirmation.`,
      ruleKeepScoped: "Keep changes scoped to the current task.",
      ruleExplainVerification: "Explain verification steps after implementation.",
      chatInitTitle: "RecoWork Initialization Prompt",
      chatInitIntro: `You are helping me use the RecoWork template \`${template.id}\`.`,
      chatInitInstruction: isIdeaWorkflow
        ? "Start with focused idea discovery. Clarify the question, target user, constraints, success signals, known facts, assumptions, and open questions. Explore multiple directions first, then present an idea agreement and wait for my explicit confirmation before selecting a priority direction, validation plan, or project execution."
        : isLearningWorkflow
        ? "Start with a focused learning diagnosis. Restate the goal, background, constraints, preferences, completion criteria, assumptions, and open questions as a short learning agreement, then wait for my explicit confirmation. Until I confirm, do not generate a roadmap, lesson content, practice plan, or project plan. After confirmation, teach one validated unit at a time and leave a short continuation memory after meaningful work."
        : isProjectWorkflow
          ? "Start with focused project discovery. Restate the goal, scope, constraints, risks, success criteria, assumptions, and open questions as a short project agreement, then wait for my explicit confirmation. Until I confirm, only maintain a draft project brief and open questions; do not generate a complete solution, plan, or implementation change. After confirmation, work in small, verified steps and capture durable decisions."
        : "Ask one concise question if the task is unclear. Otherwise, help me start the workflow, keep assumptions explicit, and leave a short continuation memory after meaningful work.",
      chatTaskTitle: "Task Prompt",
      chatTaskIntro: isChatTarget
        ? `Use this lightweight \`${template.id}\` chat protocol.`
        : `Use the \`${template.id}\` workflow and its role contract.`,
      chatTaskFieldTask: "Task",
      chatTaskFieldContext: "Context",
      chatTaskFieldConstraints: "Constraints",
      chatTaskInstruction: isIdeaWorkflow
        ? "First determine whether this idea scope has been explicitly confirmed. If not, clarify the exploration frame, separate facts, assumptions, and open questions, and explore alternatives without prematurely converging. Wait for my confirmation before selecting a priority direction or validation plan."
        : isLearningWorkflow
        ? "First determine whether this learning scope has been explicitly confirmed. If it has not, run the focused diagnosis and wait for my confirmation before generating learning content. If it has, restate the unit goal briefly, separate facts, assumptions, and open questions, and advance only that validated unit. After meaningful work, include a short memory card I can paste into the next chat."
        : isProjectWorkflow
          ? "First determine whether this project scope has been explicitly confirmed. If it has not, form a short project agreement and wait for my confirmation before generating a complete solution, plan, or implementation change. If it has, restate the local task goal briefly, separate facts, assumptions, and open questions, then work only within that confirmed scope. After meaningful work, include a short memory card I can paste into the next chat."
        : "Before answering, restate the goal briefly. Separate facts, assumptions, and open questions. After answering, include a short memory card I can paste into the next chat.",
      chatMemoryTitle: "Continuation And Migration Summary",
      chatMemoryTemplate: "Template",
      chatMemoryTarget: "Target",
      chatMemoryGoal: "Current goal:",
      chatMemoryDecisions: "Confirmed decisions:",
      chatMemoryNext: "Next step:",
      chatDeliveryBoundary: isChatTarget
        ? "This is a lightweight chat workflow. It does not create a local workspace, automatically save intermediate work, or provide version checks and upgrades."
        : "",
      chatContinuityNotice: "Conversation continuity is manual: save this summary and paste it into the next chat. It is not persisted automatically.",
      chatMigrationTitle: "Move To A Local Project",
      chatMigrationInstruction: "When the work becomes complex, long-running, collaborative, knowledge-heavy, or auditable, complete the migration package below and paste it into a command-capable local agent to initialize a full local workflow.",
      claudeInstructionsTitle: "Claude Workflow Instructions",
      claudeInstructionsIntro: `Use RecoWork template \`${template.id}\` and its role contract.`,
      claudeInstructionsRule: isIdeaWorkflow
        ? "Explore multiple directions before converging. Separate facts, assumptions, risks, and evidence, then present an idea agreement and wait for explicit user confirmation before a priority direction, validation plan, or project execution."
        : isLearningWorkflow
        ? "Start with a focused diagnosis and present a learning agreement. Wait for explicit learner confirmation before generating a roadmap, lesson content, practice plan, or project plan. After confirmation, work in one validated unit at a time, keep assumptions explicit, and summarize durable context after each milestone."
        : isProjectWorkflow
          ? "Start with focused project discovery and present a project agreement. Wait for explicit user confirmation before generating a complete solution, plan, or implementation change. After confirmation, work in small, verified steps, keep assumptions explicit, and summarize durable context after each milestone."
        : "Work in small steps, keep assumptions explicit, ask before material direction changes, and summarize durable context after each milestone.",
    };
  }

  return {
    targetIntro: `当前工作流使用 RecoWork 模板 \`${template.id}\`，target 为 \`${target.id}\`，locale 为 \`${locale}\`。`,
    headingPurpose: "用途",
    headingAudience: "适用对象",
    headingExpectedOutputs: "预期产物",
    headingWorkingProtocol: "工作协议",
    headingRules: "规则",
    ruleReadProjectContext: `在${isLearningWorkflow ? "开始或续接一个学习单元" : isIdeaWorkflow ? "开始或续接一次想法探索" : isGeneralWorkflow ? "开始或续接重要任务" : "改动"}前先读取 \`README.md\`、\`${localePaths.roleFile}\`、\`${localePaths.methodsDir}/\`、\`${localePaths.workspaceDir}/\` 和 \`rw-manifest.json\`。`,
    ruleCaptureKnowledge: `把已验证的结论沉淀到 \`${localePaths.knowledgeCaptureDir}/\`，并更新受影响的索引。`,
    ruleReviewOutput: "返回结果前，对照模板用途和预期产物自审。",
    ruleConfirmLargeChanges: isIdeaWorkflow
      ? "选择优先方向、验证计划或进入项目执行前，先给出想法约定并等待用户明确确认。"
      : isLearningWorkflow
      ? "生成或变更课程路线、章节内容、练习计划或项目方案前，先给出学习约定并等待学习者明确确认；大范围变更或不可逆操作前也必须先确认。"
      : isProjectWorkflow
        ? "生成完整方案、计划或实施改动前，先给出项目约定并等待用户明确确认；大范围变更或不可逆操作前也必须先确认。"
      : "大范围变更或不可逆操作前，先向用户确认。",
    ruleKeepKnowledge: isIdeaWorkflow
      ? `把想法简报、方向、假设和决策放在 \`${localePaths.workspaceDir}/\`。先充分发散，再区分事实、假设和证据；收敛到优先方向前等待用户确认。`
      : isLearningWorkflow
      ? `把学习简报、课程路线、进度和复盘放在 \`${localePaths.workspaceDir}/\`。生成或变更课程路线、章节内容、练习计划或项目方案前，先给出学习约定并等待学习者明确确认；确认后一次只推进一个经过验证的学习单元。`
      : isGeneralWorkflow
      ? `把有效任务上下文放在 \`${localePaths.workspaceDir}/\`，重要任务结束后留下续聊记忆。`
      : `把长期项目上下文放在 \`${localePaths.workspaceDir}/\`。将已验证结论合并到对应的权威文档，并更新受影响的索引。生成完整方案、计划或实施改动前，先给出项目约定并等待用户明确确认。`,
    ruleKeepScoped: "保持改动聚焦在当前任务范围内。",
    ruleExplainVerification: "实现后说明验证步骤。",
    chatInitTitle: "RecoWork 初始化 Prompt",
    chatInitIntro: `你正在使用 RecoWork 模板 \`${template.id}\`。`,
    chatInitInstruction: isIdeaWorkflow
      ? "先进行聚焦的想法澄清：明确问题、目标用户、约束、成功信号、已知事实、假设和待确认问题。先探索多个方向，再给出想法约定；在我明确确认前，不要选择优先方向、制定验证计划或进入项目执行。"
      : isLearningWorkflow
      ? "先进行聚焦的学习诊断。将目标、基础、约束、偏好、完成标准、假设和待确认问题整理为简短的学习约定，并等待我明确确认。在确认前，不要生成课程路线、章节内容、练习计划或项目方案。确认后一次只推进一个经过验证的学习单元，并在重要工作结束后留下可复制的续聊记忆。"
      : isProjectWorkflow
        ? "先进行聚焦的项目澄清。将目标、范围、约束、风险、成功标准、假设和待确认问题整理为简短的项目约定，并等待我明确确认。在确认前，只维护项目简报草稿和待确认问题；不要生成完整方案、计划或实施改动。确认后分小步推进、验证结果并沉淀长期决策。"
      : "如果任务不清晰，先问一个最必要的问题。否则帮助我启动工作流，明确标注假设，并在重要任务结束后留下可复制的续聊记忆。",
    chatTaskTitle: "任务 Prompt",
    chatTaskIntro: isChatTarget
      ? `请按这个轻量 \`${template.id}\` 对话协议推进。`
      : `请按 \`${template.id}\` 工作流及其角色设定推进。`,
    chatTaskFieldTask: "任务",
    chatTaskFieldContext: "背景",
    chatTaskFieldConstraints: "约束",
    chatTaskInstruction: isIdeaWorkflow
      ? "先判断当前想法探索范围是否已经获得明确确认。未确认时，澄清探索框架，区分事实、假设和待确认问题，并充分发散备选方向；选择优先方向或验证计划前等待我确认。"
      : isLearningWorkflow
      ? "先判断当前学习范围是否已经获得明确确认。尚未确认时，先完成聚焦诊断并等待我确认，再生成学习内容；已确认时，简要复述单元目标，区分事实、假设和待确认问题，并且只推进这个经过验证的单元。重要工作结束后给出一张可复制到下一轮对话的简短记忆卡。"
      : isProjectWorkflow
        ? "先判断当前项目范围是否已经获得明确确认。尚未确认时，先形成简短的项目约定并等待我确认，再生成完整方案、计划或实施改动；已确认时，简要复述局部任务目标，区分事实、假设和待确认问题，并且只在这个确认范围内推进。重要工作结束后给出一张可复制到下一轮对话的简短记忆卡。"
      : "回答前先简要复述目标，区分事实、假设和待确认问题。回答后给出一张可复制到下一轮对话的简短记忆卡。",
    chatMemoryTitle: "续接与迁移摘要",
    chatMemoryTemplate: "模板",
    chatMemoryTarget: "目标环境",
    chatMemoryGoal: "当前目标：",
    chatMemoryDecisions: "已确认结论：",
    chatMemoryNext: "下一步：",
    chatDeliveryBoundary: isChatTarget
      ? "这是轻量对话工作流：不会创建本地工作空间、自动保存中间产物，也不提供版本检查或升级。"
      : "",
    chatContinuityNotice: "对话连续性需要手动维护：请保存这份摘要，并在下一轮对话中粘贴；系统不会自动持久化。",
    chatMigrationTitle: "迁移到本地项目",
    chatMigrationInstruction: "当任务变复杂、需要长期推进、多人协作、知识沉淀或可审计过程时，补全下面的迁移包，再粘贴到具备命令执行能力的本地 Agent 中初始化完整本地工作流。",
    claudeInstructionsTitle: "Claude 工作流说明",
    claudeInstructionsIntro: `请使用 RecoWork 模板 \`${template.id}\` 及其角色设定。`,
    claudeInstructionsRule: isIdeaWorkflow
      ? "先探索多个方向再收敛，区分事实、假设、风险和证据；选择优先方向、验证计划或进入项目执行前，给出想法约定并等待用户明确确认。"
      : isLearningWorkflow
      ? "先进行聚焦诊断并给出学习约定。在学习者明确确认前，不要生成课程路线、章节内容、练习计划或项目方案；确认后一次只推进一个经过验证的学习单元，明确标注假设，并在每个阶段结束后总结可持续使用的上下文。"
      : isProjectWorkflow
        ? "先进行聚焦的项目澄清并给出项目约定。在用户明确确认前，不要生成完整方案、计划或实施改动；确认后分小步推进、明确标注假设，并在每个阶段结束后总结可持续使用的上下文。"
      : "分小步推进，明确标注假设，重大方向变化前先确认，并在每个阶段结束后总结可持续使用的上下文。",
  };
}

function getLocalePaths(locale, template) {
  const isGeneralWorkflow = template && template.id === "general-ai-workflow";
  const isLearningWorkflow = template && template.id === "learning-engineering";
  const isIdeaWorkflow = template && template.id === "idea-engineering";
  if (locale === "en") {
    if (isLearningWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "learning-workspace",
        briefFile: "learner-brief.md",
        questionsFile: "learning-workspace/04-questions-and-retrospectives/",
        roleFile: "methods/role-contract.md",
        knowledgeCaptureDir: "learning-workspace/05-knowledge-capture",
      };
    }
    if (isIdeaWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "idea-space",
        briefFile: "idea-brief.md",
        questionsFile: "open-questions.md",
        roleFile: "methods/role-contract.md",
        ideaDecisionDir: "idea-space/05-decisions-and-next-steps",
        knowledgeCaptureDir: "idea-space/05-decisions-and-next-steps",
      };
    }
    if (isGeneralWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "workspace",
        briefFile: "task-brief.md",
        questionsFile: "open-questions.md",
        roleFile: "methods/role-contract.md",
        knowledgeCaptureDir: "workspace/04-review-and-reuse",
      };
    }
    return {
      methodsDir: "methods",
      workspaceDir: "workspace",
      briefFile: "project-brief.md",
      questionsFile: "open-questions.md",
      roleFile: "methods/role-contract.md",
      knowledgeCaptureDir: "workspace/03-plan-and-decisions",
    };
  }

  if (isGeneralWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "工作空间",
      briefFile: "任务简报.md",
      questionsFile: "待确认问题.md",
      roleFile: "工作方法/角色设定.md",
      knowledgeCaptureDir: "工作空间/04-复盘与沉淀",
    };
  }

  if (isLearningWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "学习空间",
      briefFile: "学习简报.md",
      questionsFile: "学习空间/04-问题与复盘/",
      roleFile: "工作方法/角色设定.md",
      knowledgeCaptureDir: "学习空间/05-知识沉淀",
    };
  }
  if (isIdeaWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "想法空间",
      briefFile: "想法简报.md",
      questionsFile: "待确认问题.md",
      roleFile: "工作方法/角色设定.md",
      ideaDecisionDir: "想法空间/05-决策与下一步",
      knowledgeCaptureDir: "想法空间/05-决策与下一步",
    };
  }

  return {
    methodsDir: "工作方法",
    workspaceDir: "工作空间",
    briefFile: "项目简报.md",
    questionsFile: "待确认问题.md",
    roleFile: "工作方法/角色设定.md",
    knowledgeCaptureDir: "工作空间/03-计划与决策",
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
