#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

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

Compatibility:
  rw platforms
  rw add <template> --platform <legacy-platform> <destination>

Examples:
  rw add general --target chatgpt-chat ./my-ai-workflow
  rw add project --target codex-project --locale zh .
  rw add project --target claude-code-project --locale en .
  rw add learning -t notion-workspace ./langchain-study
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
  copyIfExists(path.join(localizedTemplateDir, "README.md"), path.join(targetDir, "README.md"));
  copyDir(path.join(localizedTemplateDir, "工作方法"), path.join(targetDir, "工作方法"));
  copyDir(path.join(localizedTemplateDir, "methods"), path.join(targetDir, "methods"));
  copyDir(path.join(localizedTemplateDir, "core"), path.join(targetDir, "工作方法"));
  copyDir(path.join(templateDir, "examples"), path.join(targetDir, "examples"));
  copyTemplateAssets(localizedTemplateDir, targetDir);
  renderTargetFiles(path.join(selectedTargetDir, "files"), targetDir, template, selectedTarget, selectedLocale);
  writeManifest(targetDir, template, selectedTarget, selectedLocale);

  console.log(`Initialized ${template.id} for ${selectedTarget.id} (${selectedLocale})`);
  console.log(`Target: ${targetDir}`);
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
    if (["--platform", "-p", "--target", "-t", "--locale", "-l"].includes(args[index])) {
      skipped.add(index);
      skipped.add(index + 1);
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

function cleanupLegacyTemplatePaths(templateId, targetDir) {
  const legacyFilesByTemplate = {
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

function renderTemplate(source, template, target, locale) {
  const localePaths = getLocalePaths(locale);
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
    rule_use_claude_skills: localeStrings.ruleUseClaudeSkills,
    rule_keep_knowledge: localeStrings.ruleKeepKnowledge,
    rule_keep_scoped: localeStrings.ruleKeepScoped,
    rule_explain_verification: localeStrings.ruleExplainVerification,
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
  if (locale === "en") {
    return {
      targetIntro: `This project uses RecoWork template \`${template.id}\` for target \`${target.id}\` and locale \`${locale}\`.`,
      headingPurpose: "Purpose",
      headingAudience: "Audience",
      headingExpectedOutputs: "Expected Outputs",
      headingWorkingProtocol: "Working Protocol",
      headingRules: "Rules",
      ruleReadProjectContext: `Read \`README.md\`, \`${localePaths.roleFile}\`, \`${localePaths.methodsDir}/\`, \`${localePaths.workspaceDir}/\`, and \`rw-manifest.json\` before making changes.`,
      ruleCaptureKnowledge: "Capture durable project knowledge in `knowledge/`.",
      ruleReviewOutput: "Before returning work, review the result against the template purpose and expected outputs.",
      ruleConfirmLargeChanges: "Ask for confirmation before large scope changes or irreversible operations.",
      ruleUseClaudeSkills: "Use project-scoped skills from `.claude/skills/` when they match the task.",
      ruleKeepKnowledge: "Keep durable project knowledge in the template-defined knowledge location.",
      ruleKeepScoped: "Keep changes scoped to the current task.",
      ruleExplainVerification: "Explain verification steps after implementation.",
    };
  }

  return {
    targetIntro: `本项目使用 RecoWork 模板 \`${template.id}\`，target 为 \`${target.id}\`，locale 为 \`${locale}\`。`,
    headingPurpose: "用途",
    headingAudience: "适用对象",
    headingExpectedOutputs: "预期产物",
    headingWorkingProtocol: "工作协议",
    headingRules: "规则",
    ruleReadProjectContext: `改动前先读取 \`README.md\`、\`${localePaths.roleFile}\`、\`${localePaths.methodsDir}/\`、\`${localePaths.workspaceDir}/\` 和 \`rw-manifest.json\`。`,
    ruleCaptureKnowledge: "把长期有效的项目知识沉淀到 `knowledge/`。",
    ruleReviewOutput: "返回结果前，对照模板用途和预期产物自审。",
    ruleConfirmLargeChanges: "大范围变更或不可逆操作前，先向用户确认。",
    ruleUseClaudeSkills: "当任务匹配时，使用 `.claude/skills/` 下的项目级 skills。",
    ruleKeepKnowledge: "把长期项目知识放在模板定义的知识位置。",
    ruleKeepScoped: "保持改动聚焦在当前任务范围内。",
    ruleExplainVerification: "实现后说明验证步骤。",
  };
}

function getLocalePaths(locale) {
  if (locale === "en") {
    return {
      methodsDir: "methods",
      workspaceDir: "workspace",
      briefFile: "project-brief.md",
      questionsFile: "open-questions.md",
      roleFile: "methods/role-contract.md",
    };
  }

  return {
    methodsDir: "工作方法",
    workspaceDir: "工作空间",
    briefFile: "项目简报.md",
    questionsFile: "待确认问题.md",
    roleFile: "工作方法/角色设定.md",
  };
}

function formatList(items) {
  if (!items.length) {
    return "- Not specified";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function writeManifest(targetDir, template, target, locale) {
  const manifest = {
    tool: "RecoWork",
    template: template.id,
    target: target.id,
    locale,
    generated_at: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(targetDir, "rw-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function fail(message) {
  console.error(`rw: ${message}`);
  process.exit(1);
}

main();
