#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const http = require("http");
const { URL } = require("url");
const { execFile } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const TARGETS_DIR = path.join(ROOT, "targets");
const VIEWER_DIR = path.join(ROOT, "cli", "recowork", "viewer");
const MARKED_BROWSER_FILE = path.join(path.dirname(require.resolve("marked")), "marked.umd.js");

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

const retiredTemplates = {
  "general-ai-workflow": {
    aliases: ["general", "task", "daily"],
  },
  "idea-engineering": {
    aliases: [],
  },
  "project-engineering": {
    aliases: ["engineering"],
  },
};

function findRetiredTemplate(templateRef) {
  return Object.entries(retiredTemplates).find(([id, details]) => {
    return id === templateRef || details.aliases.includes(templateRef);
  });
}

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

  if (command === "view") {
    startViewer(args.slice(1)).catch((error) => fail(`Cannot start RecoWork viewer: ${error.message}`));
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
  rw view [directory] [--port <port>] [--no-open]

Compatibility:
  rw platforms
  rw add <template> --platform <legacy-platform> <destination>

Examples:
  rw add idea-to-project --target chat-mobile ./my-idea-workflow
  rw add project --target local-agent-project --locale zh .
  rw add learning -t local-agent-project ./langchain-study
  rw upgrade --check .
  rw upgrade --plan .
  rw view .
`);
}

async function startViewer(args) {
  const requestedPort = readOption(args, "port");
  const noOpen = args.includes("--no-open");
  const targetArg = readViewerDestination(args);
  const requestedDir = path.resolve(process.cwd(), targetArg || ".");

  if (!fs.existsSync(requestedDir) || !fs.statSync(requestedDir).isDirectory()) {
    fail(`Viewer directory does not exist: ${requestedDir}`);
  }
  const rootDir = fs.realpathSync(requestedDir);
  if (!fs.existsSync(path.join(VIEWER_DIR, "index.html"))) {
    fail("RecoWork viewer assets are not available in this installation.");
  }

  const initialPort = requestedPort ? Number(requestedPort) : 4310;
  if (!Number.isInteger(initialPort) || initialPort < 1 || initialPort > 65535) {
    fail("--port must be an integer between 1 and 65535.");
  }

  const existing = await findExistingViewer(rootDir, initialPort, Boolean(requestedPort));
  if (existing) {
    const viewerUrl = `http://127.0.0.1:${existing}`;
    console.log(`RecoWork Viewer is already reading: ${rootDir}`);
    console.log(`Open: ${viewerUrl}`);
    if (!noOpen) {
      openBrowser(viewerUrl);
    }
    return;
  }

  const server = http.createServer((request, response) => {
    handleViewerRequest(request, response, rootDir);
  });
  let attemptedPort = initialPort;

  const listen = () => {
    server.once("error", (error) => {
      if (!requestedPort && error.code === "EADDRINUSE" && attemptedPort < initialPort + 20) {
        attemptedPort += 1;
        listen();
        return;
      }
      fail(error.code === "EADDRINUSE"
        ? `Port ${attemptedPort} is already in use. Choose another with --port.`
        : `Cannot start RecoWork viewer: ${error.message}`);
    });
    server.listen(attemptedPort, "127.0.0.1", () => {
      const viewerUrl = `http://127.0.0.1:${attemptedPort}`;
      console.log(`RecoWork Viewer is reading: ${rootDir}`);
      console.log(`Open: ${viewerUrl}`);
      console.log("Press Ctrl+C to stop the viewer.");
      if (!noOpen) {
        openBrowser(viewerUrl);
      }
    });
  };

  listen();
}

async function findExistingViewer(rootDir, initialPort, hasRequestedPort) {
  const ports = hasRequestedPort
    ? [initialPort]
    : Array.from({ length: 21 }, (_, index) => initialPort + index).filter((port) => port <= 65535);
  const probes = await Promise.all(ports.map((port) => probeViewerPort(rootDir, port)));
  return probes.find(Boolean) || null;
}

function probeViewerPort(rootDir, port) {
  return new Promise((resolve) => {
    const request = http.get({ hostname: "127.0.0.1", port, path: "/api/workspace", timeout: 180 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        try {
          resolve(response.statusCode === 200 && JSON.parse(body).rootDir === rootDir ? port : null);
        } catch {
          resolve(null);
        }
      });
    });
    request.on("timeout", () => request.destroy());
    request.on("error", () => resolve(null));
  });
}

function readViewerDestination(args) {
  const skipped = new Set();
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--port") {
      skipped.add(index);
      skipped.add(index + 1);
    }
    if (args[index] === "--no-open") {
      skipped.add(index);
    }
  }
  return args.find((arg, index) => !skipped.has(index));
}

function openBrowser(viewerUrl) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const commandArgs = process.platform === "win32" ? ["/c", "start", "", viewerUrl] : [viewerUrl];
  execFile(command, commandArgs, () => {});
}

function handleViewerRequest(request, response, rootDir) {
  const requestUrl = new URL(request.url, "http://127.0.0.1");
  if (requestUrl.pathname === "/api/workspace") {
    return respondJson(response, buildViewerWorkspace(rootDir));
  }
  if (requestUrl.pathname === "/api/document") {
    const relativePath = requestUrl.searchParams.get("path") || "";
    const workspace = findViewerWorkspace(rootDir);
    const filePath = resolveViewerPath(workspace.path, relativePath);
    if (!relativePath.toLowerCase().endsWith(".md") || !isViewerRegularFile(filePath)) {
      return respondJson(response, { error: "Document not found." }, 404);
    }
    return respondJson(response, {
      path: relativePath.split(path.sep).join("/"),
      source: fs.readFileSync(filePath, "utf8"),
    });
  }
  if (requestUrl.pathname === "/api/search") {
    return respondJson(response, searchViewerDocuments(rootDir, requestUrl.searchParams.get("q") || "", requestUrl.searchParams.get("scope") || "current"));
  }
  if (requestUrl.pathname === "/api/asset") {
    const relativePath = requestUrl.searchParams.get("path") || "";
    const workspace = findViewerWorkspace(rootDir);
    const filePath = resolveViewerPath(workspace.path, relativePath);
    const contentType = getViewerAssetContentType(filePath);
    if (!contentType || !isViewerRegularFile(filePath)) {
      return respondJson(response, { error: "Asset not found." }, 404);
    }
    return respondFile(response, filePath, contentType);
  }
  if (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html") {
    return respondViewerIndex(response, rootDir);
  }
  if (requestUrl.pathname === "/viewer.js") {
    return respondFile(response, path.join(VIEWER_DIR, "viewer.js"), "application/javascript; charset=utf-8");
  }
  if (requestUrl.pathname === "/viewer.css") {
    return respondFile(response, path.join(VIEWER_DIR, "viewer.css"), "text/css; charset=utf-8");
  }
  if (requestUrl.pathname === "/vendor/marked.js") {
    return respondFile(response, MARKED_BROWSER_FILE, "application/javascript; charset=utf-8");
  }
  if (requestUrl.pathname === "/recowork-logo.svg") {
    return respondFile(response, path.join(VIEWER_DIR, "recowork-logo.svg"), "image/svg+xml");
  }
  return respondJson(response, { error: "Not found." }, 404);
}

function searchViewerDocuments(rootDir, query, scope) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [];
  }
  const workspace = findViewerWorkspace(rootDir);
  const archiveSegment = workspace.locale === "zh" ? "归档" : "archive";
  return collectViewerDocuments(workspace.path)
    .filter((document) => (scope === "archive") === document.relativePath.split("/").includes(archiveSegment))
    .map((document) => {
      const source = fs.readFileSync(path.join(workspace.path, document.relativePath), "utf8");
      return { ...document, searchSnippet: extractViewerSearchSnippet(source, normalizedQuery) };
    })
    .filter((document) => `${document.title} ${document.summary} ${document.searchSnippet}`.toLocaleLowerCase().includes(normalizedQuery))
    .slice(0, 30);
}

function extractViewerSearchSnippet(source, query) {
  const normalizedSource = source.replace(/\s+/g, " ").trim();
  const position = normalizedSource.toLocaleLowerCase().indexOf(query);
  if (position < 0) {
    return "";
  }
  const start = Math.max(0, position - 56);
  const end = Math.min(normalizedSource.length, position + query.length + 96);
  return `${start ? "..." : ""}${normalizedSource.slice(start, end)}${end < normalizedSource.length ? "..." : ""}`;
}

function respondJson(response, value, statusCode = 200) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(`${JSON.stringify(value)}\n`);
}

function respondFile(response, filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    return respondJson(response, { error: "Viewer asset not found." }, 404);
  }
  response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
  response.end(fs.readFileSync(filePath));
}

function getViewerAssetContentType(filePath) {
  const types = {
    ".avif": "image/avif",
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };
  return filePath ? types[path.extname(filePath).toLowerCase()] || null : null;
}

function isViewerRegularFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }
  return fs.lstatSync(filePath).isFile();
}

function respondViewerIndex(response, rootDir) {
  const locale = findViewerWorkspace(rootDir).locale === "zh" ? "zh" : "en";
  const labels = locale === "zh"
    ? {
      html_lang: "zh-CN",
      viewer_title: "RecoWork 工作空间",
      viewer_name: "RecoWork 工作空间",
      search_label: "搜索",
      search_placeholder: "搜索当前工作空间",
      view_archive: "查看归档",
      navigation_label: "工作空间导航",
    }
    : {
      html_lang: "en",
      viewer_title: "RecoWork Viewer",
      viewer_name: "RecoWork Viewer",
      search_label: "Search",
      search_placeholder: "Search current workspace",
      view_archive: "View archive",
      navigation_label: "Workspace navigation",
    };
  const source = fs.readFileSync(path.join(VIEWER_DIR, "index.html"), "utf8");
  const content = source.replace(/\{\{([a-z_]+)\}\}/g, (match, key) => labels[key] || match);
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(content);
}

function resolveViewerPath(rootDir, relativePath) {
  if (!relativePath || path.isAbsolute(relativePath)) {
    return null;
  }
  const resolved = path.resolve(rootDir, relativePath);
  return resolved.startsWith(`${rootDir}${path.sep}`) ? resolved : null;
}

function buildViewerWorkspace(rootDir) {
  const workspace = findViewerWorkspace(rootDir);
  const allDocuments = collectViewerDocuments(workspace.path);
  const archiveSegment = workspace.locale === "zh" ? "归档" : "archive";
  const documents = allDocuments.filter((document) => !document.relativePath.split("/").includes(archiveSegment));
  const archiveDocuments = allDocuments.filter((document) => document.relativePath.split("/").includes(archiveSegment));
  const rootIndex = documents.find((document) => document.relativePath === "index.md");
  const navigation = buildViewerNavigation(rootIndex, documents, workspace.path);
  const overview = buildViewerOverview(documents, workspace.locale);

  return {
    rootDir,
    workspace: workspace.relativePath || ".",
    locale: workspace.locale,
    navigation,
    documents,
    archiveDocuments,
    overview,
  };
}

function findViewerWorkspace(rootDir) {
  if (fs.existsSync(path.join(rootDir, "index.md"))) {
    return { path: rootDir, relativePath: "", locale: inferViewerLocale(rootDir) };
  }
  const candidates = ["工作空间", "workspace", "学习空间", "learning-workspace", "想法空间", "idea-space"];
  for (const candidate of candidates) {
    const candidatePath = path.join(rootDir, candidate);
    if (fs.existsSync(path.join(candidatePath, "index.md"))) {
      return { path: candidatePath, relativePath: candidate, locale: inferViewerLocale(candidatePath) };
    }
  }
  return {
    path: rootDir,
    relativePath: "",
    locale: inferViewerLocale(rootDir),
  };
}

function inferViewerLocale(directory) {
  if (/[㐀-鿿]/.test(path.basename(directory)) || fs.existsSync(path.join(directory, "网页设计规范.md"))) {
    return "zh";
  }
  const indexPath = path.join(directory, "index.md");
  if (fs.existsSync(indexPath) && /[㐀-鿿]/.test(fs.readFileSync(indexPath, "utf8"))) {
    return "zh";
  }
  return "en";
}

function collectViewerDocuments(workspaceDir) {
  const documents = [];
  const ignored = new Set([".git", "node_modules", ".recowork"]);
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        const source = fs.readFileSync(entryPath, "utf8");
        const relativePath = path.relative(workspaceDir, entryPath).split(path.sep).join("/");
        documents.push(describeViewerDocument(relativePath, source));
      }
    }
  };
  walk(workspaceDir);
  return documents.sort((left, right) => left.relativePath.localeCompare(right.relativePath, "zh-Hans-CN"));
}

function describeViewerDocument(relativePath, source) {
  const metadata = parseViewerFrontmatter(source);
  const title = metadata.title || (source.match(/^#\s+(.+)$/m) || [])[1] || path.basename(relativePath, ".md");
  return {
    relativePath,
    title: title.trim(),
    status: metadata.status || "",
    updated: metadata.date || metadata.last_updated || "",
    summary: extractViewerSummary(source),
  };
}

function parseViewerFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) {
    return {};
  }
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (pair) {
      metadata[pair[1]] = pair[2].replace(/^['"]|['"]$/g, "");
    }
  }
  return metadata;
}

function extractViewerSummary(source) {
  const body = source.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  const conclusion = body.match(/##\s+(结论在前|Conclusion First)\s*\n+([\s\S]*?)(?=\n##\s|$)/i);
  const text = (conclusion ? conclusion[2] : body)
    .replace(/^#.+$/gm, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 220);
}

function buildViewerNavigation(rootIndex, documents, workspacePath) {
  const byPath = new Map(documents.map((document) => [document.relativePath, document]));
  const visited = new Set();
  const walkIndex = (document) => {
    if (!document || visited.has(document.relativePath)) {
      return null;
    }
    visited.add(document.relativePath);
    const source = fs.readFileSync(path.join(workspacePath, document.relativePath), "utf8");
    const links = extractViewerLinks(source, document.relativePath);
    return {
      ...document,
      children: links.map((link) => walkIndex(byPath.get(link))).filter(Boolean),
    };
  };
  return rootIndex ? walkIndex(rootIndex) : null;
}

function extractViewerLinks(source, relativePath) {
  const links = [];
  const directory = path.posix.dirname(relativePath);
  const pattern = /\[[^\]]+\]\(([^)]+\.md)(?:#[^)]+)?\)/g;
  for (const match of source.matchAll(pattern)) {
    const target = match[1].replace(/\\/g, "/");
    if (/^(https?:|#)/.test(target)) {
      continue;
    }
    const normalized = path.posix.normalize(path.posix.join(directory === "." ? "" : directory, target));
    if (!normalized.startsWith("..") && !links.includes(normalized)) {
      links.push(normalized);
    }
  }
  return links;
}

function buildViewerOverview(documents, locale) {
  const find = (...names) => documents.find((document) => names.includes(path.posix.basename(document.relativePath)));
  const brief = find("项目简报.md", "project-brief.md", "学习简报.md", "learner-brief.md", "想法简报.md", "idea-brief.md");
  const questions = find("待确认问题.md", "open-questions.md");
  const parked = find("搁置想法.md", "parked-ideas.md");
  const progress = find("学习进度.md", "learning-progress.md");
  const labels = locale === "zh"
    ? { brief: "当前简报", questions: "待确认问题", parked: "搁置想法", progress: "当前进度" }
    : { brief: "Current brief", questions: "Open questions", parked: "Parked ideas", progress: "Current progress" };
  return [
    ["brief", brief],
    ["questions", questions],
    ["parked", parked],
    ["progress", progress],
  ].filter(([, document]) => document).map(([kind, document]) => ({
    kind,
    label: labels[kind],
    document,
  }));
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
  const agentPath = path.join(targetDir, "AGENTS.md");
  const hasExternalAgent = fs.existsSync(agentPath);
  if (hasExternalAgent && !fs.statSync(agentPath).isFile()) {
    fail(`Expected AGENTS.md to be a file: ${agentPath}`);
  }

  renderTargetFiles(
    path.join(selectedTargetDir, "files"),
    targetDir,
    template,
    selectedTarget,
    selectedLocale,
    { skipOutputPaths: hasExternalAgent ? new Set(["AGENTS.md"]) : new Set() },
  );
  renderTargetFiles(
    path.join(selectedTargetDir, "locales", selectedLocale, "files"),
    targetDir,
    template,
    selectedTarget,
    selectedLocale,
  );
  const agentBlock = hasExternalAgent
    ? integrateAgentBlock(agentPath, template, selectedTarget, selectedLocale)
    : null;
  writeManifest(targetDir, template, selectedTarget, selectedLocale, agentBlock);

  console.log(`Initialized ${template.id} for ${selectedTarget.id} (${selectedLocale})`);
  if (agentBlock) {
    console.log("Integrated a RecoWork-managed block into the existing root AGENTS.md.");
  }
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
  if (findRetiredTemplate(manifest.template)) {
    printRetiredTemplateMigration(targetDir, manifest);
    return;
  }
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

function printRetiredTemplateMigration(targetDir, manifest) {
  const locale = manifest.locale === "en" ? "en" : "zh";
  const suffix = locale === "zh" ? "-新工作流" : "-new-workflow";

  const retiredTemplate = manifest.template;
  console.log(`The ${retiredTemplate} template has been retired and no longer supports in-place status or upgrades.`);
  console.log("Your existing files remain untouched.");
  console.log("\nInitialize the staged Idea To Project workflow in a separate destination:");
  console.log(`  rw add idea-to-project --target local-agent-project --locale ${locale} ${targetDir}${suffix}`);
  console.log("\nTransfer only the current brief, confirmed decisions, open questions, and next step into the new workflow.");
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
  if (manifest.agent_block) {
    delete desiredFiles[manifest.agent_block.path || "AGENTS.md"];
  }
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

  const agentBlockItem = getAgentBlockUpgradeItem(targetDir, manifest, template, target, locale);
  if (agentBlockItem) {
    items.push(agentBlockItem);
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

    if (item.managedKind === "agent-block") {
      if (canUpdate && applyAgentBlockUpgrade(targetDir, manifest, item)) {
        applied.updated += 1;
      }
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
    "agent-block-conflict": "RecoWork AGENTS.md blocks changed by both you and RecoWork",
    "agent-block-user-changed": "User-modified RecoWork AGENTS.md blocks preserved",
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
    const retired = findRetiredTemplate(templateRef);
    if (retired) {
      fail(`Template retired: ${templateRef}. Use \`idea-to-project\`, \`learning\`, or \`web-design-standard\` for a supported workflow. Existing generated files remain untouched.`);
    }
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

function renderTargetFiles(from, to, template, target, locale, options = {}) {
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
      renderTargetFiles(source, destination, template, target, locale, options);
    } else if (options.skipOutputPaths && options.skipOutputPaths.has(outputName)) {
      continue;
    } else {
      const content = fs.readFileSync(source, "utf8");
      fs.writeFileSync(destination, renderTemplate(content, template, target, locale));
    }
  }
}

function getAgentBlockMarkers(template, target, locale) {
  return {
    start: `<!-- recowork:start template=${template.id} target=${target.id} locale=${locale} -->`,
    end: "<!-- recowork:end -->",
  };
}

function renderAgentIntegrationBlock(template, target, locale) {
  const sourcePath = path.join(TARGETS_DIR, target.id, "locales", locale, "AGENTS.integration.md.tpl");
  if (!fs.existsSync(sourcePath)) {
    fail(`Agent integration template not found: ${sourcePath}`);
  }
  return renderTemplate(fs.readFileSync(sourcePath, "utf8"), template, target, locale).trimEnd();
}

function extractAgentBlock(source, markers) {
  const startIndex = source.indexOf(markers.start);
  if (startIndex < 0) {
    return null;
  }
  const endIndex = source.indexOf(markers.end, startIndex);
  if (endIndex < 0) {
    return null;
  }
  return source.slice(startIndex, endIndex + markers.end.length);
}

function upsertAgentBlock(source, markers, block) {
  const existing = extractAgentBlock(source, markers);
  if (existing) {
    return source.replace(existing, block);
  }
  const suffix = source.length && !source.endsWith("\n") ? "\n" : "";
  return `${source}${suffix}${source.length ? "\n" : ""}${block}\n`;
}

function integrateAgentBlock(agentPath, template, target, locale) {
  const markers = getAgentBlockMarkers(template, target, locale);
  const block = renderAgentIntegrationBlock(template, target, locale);
  const existing = fs.readFileSync(agentPath, "utf8");
  fs.writeFileSync(agentPath, upsertAgentBlock(existing, markers, block));
  return {
    path: "AGENTS.md",
    markers,
    source_hash: hashContent(block),
    baseline_hash: hashContent(block),
    template: template.id,
    target: target.id,
    locale,
  };
}

function getAgentBlockUpgradeItem(targetDir, manifest, template, target, locale) {
  if (!manifest.agent_block) {
    return null;
  }

  const metadata = manifest.agent_block;
  const markers = metadata.markers || getAgentBlockMarkers(template, target, locale);
  const desiredContent = renderAgentIntegrationBlock(template, target, locale);
  const agentPath = path.join(targetDir, metadata.path || "AGENTS.md");
  const source = fs.existsSync(agentPath) && fs.statSync(agentPath).isFile()
    ? fs.readFileSync(agentPath, "utf8")
    : null;
  const currentBlock = source ? extractAgentBlock(source, markers) : null;
  const upstreamChanged = metadata.source_hash !== hashContent(desiredContent);
  const userChanged = !currentBlock || hashContent(currentBlock) !== metadata.baseline_hash;

  if (!upstreamChanged && !userChanged) {
    return null;
  }

  return {
    relativePath: metadata.path || "AGENTS.md",
    ownership: "target",
    managedKind: "agent-block",
    state: userChanged && upstreamChanged ? "agent-block-conflict" : userChanged ? "agent-block-user-changed" : "safe-update",
    action: userChanged ? "preserve" : "update",
    upstreamChanged,
    desired: { content: desiredContent, hash: hashContent(desiredContent), markers },
  };
}

function applyAgentBlockUpgrade(targetDir, manifest, item) {
  const metadata = manifest.agent_block;
  const agentPath = path.join(targetDir, item.relativePath);
  if (!fs.existsSync(agentPath) || !fs.statSync(agentPath).isFile()) {
    return false;
  }
  const source = fs.readFileSync(agentPath, "utf8");
  const currentBlock = extractAgentBlock(source, metadata.markers);
  if (!currentBlock || hashContent(currentBlock) !== metadata.baseline_hash) {
    return false;
  }
  fs.writeFileSync(agentPath, upsertAgentBlock(source, metadata.markers, item.desired.content));
  manifest.agent_block = {
    ...metadata,
    source_hash: item.desired.hash,
    baseline_hash: item.desired.hash,
  };
  return true;
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
    rule_open_workspace_viewer: localeStrings.ruleOpenWorkspaceViewer,
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
  const isLearningWorkflow = template.id === "learning-engineering";
  const isProjectWorkflow = template.id === "project-engineering";
  const isIdeaWorkflow = template.id === "idea-engineering";
  const isIdeaToProjectWorkflow = template.id === "idea-to-project";
  const isWebDesignStandard = template.id === "web-design-standard";
  const isChatTarget = target.type === "chat";
  if (locale === "en") {
    return {
      targetIntro: `This workflow uses RecoWork template \`${template.id}\` for target \`${target.id}\` and locale \`${locale}\`.`,
      headingPurpose: "Purpose",
      headingAudience: "Audience",
      headingExpectedOutputs: "Expected Outputs",
      headingWorkingProtocol: "Working Protocol",
      headingRules: "Rules",
      ruleReadProjectContext: isWebDesignStandard
        ? `Before designing, generating, or changing a web page, read \`${localePaths.designStandardFile}\`. If the project has a brand or design system, read that source as well and treat it as higher priority.`
        : `Read \`README.md\`, \`${localePaths.roleFile}\`, \`${localePaths.methodsDir}/\`, \`${localePaths.workspaceDir}/\`, and \`rw-manifest.json\` before ${isLearningWorkflow ? "starting or continuing a learning unit" : isIdeaWorkflow ? "starting or continuing an idea exploration" : isIdeaToProjectWorkflow ? "determining or continuing the current workflow stage" : "making changes"}.`,
      ruleCaptureKnowledge: isWebDesignStandard
        ? "Keep project-specific visual decisions in the project's own documents. Do not rewrite this reusable standard unless the user explicitly requests it."
        : `Capture verified conclusions in \`${localePaths.knowledgeCaptureDir}/\` and update the affected index.`,
      ruleReviewOutput: isWebDesignStandard
        ? `Before delivery, complete the checklist in \`${localePaths.designStandardFile}\` and report responsive, interaction-state, accessibility, and verification results.`
        : "Before returning work, review the result against the template purpose and expected outputs.",
      ruleConfirmLargeChanges: isIdeaToProjectWorkflow
        ? "Before choosing a priority direction, validation plan, or project entry, present the direction decision package and wait for explicit confirmation. After project entry, confirm material scope changes and irreversible operations."
        : isIdeaWorkflow
        ? "Before selecting a priority direction, validation plan, or project execution, present an idea agreement and wait for the user's explicit confirmation."
        : isLearningWorkflow
        ? "Before creating or changing a roadmap, lesson content, practice plan, or project plan, present a learning agreement and wait for the learner's explicit confirmation. Also ask before large scope changes or irreversible operations."
        : isProjectWorkflow
          ? "Before generating a complete solution, plan, or implementation change, present a project agreement and wait for the user's explicit confirmation. Also ask before large scope changes or irreversible operations."
        : isWebDesignStandard
          ? "Ask for confirmation before a material visual-direction change, a large page rewrite, or an irreversible operation when user requirements or the existing brand are unclear."
          : "Ask for confirmation before large scope changes or irreversible operations.",
      ruleKeepKnowledge: isIdeaToProjectWorkflow
        ? `Keep Current facts concise in \`${localePaths.workspaceDir}/\` and formal indexes. Keep restartable but not actively advanced directions in \`${localePaths.workspaceDir}/parked-ideas.md\` with a reason and restart condition; they are neither open questions nor archive material. Update one Current document per topic in place; after user confirmation, organize superseded versions and completed process material under \`${localePaths.workspaceDir}/archive/\` by category, topic, and version. Do not begin complete project design, planning, or implementation until the user explicitly confirms project entry; then transfer the confirmed direction into the project brief and use the numbered project sections.`
        : isIdeaWorkflow
        ? `Keep idea briefs, directions, hypotheses, and decisions in \`${localePaths.workspaceDir}/\`. Explore broadly first, then separate facts, assumptions, and evidence; wait for confirmation before converging on a priority direction.`
      : isLearningWorkflow
        ? `Keep Current learner brief, roadmap, progress, and validated learning records concise in \`${localePaths.workspaceDir}/\` and formal indexes. Update one Current document per topic in place; after learner confirmation, organize superseded versions and completed process material under \`${localePaths.workspaceDir}/archive/\` by category, topic, and version. Before creating or changing a roadmap, lesson, practice plan, or project plan, present a learning agreement and wait for explicit confirmation; then teach one validated unit at a time.`
        : isWebDesignStandard
            ? "Use this file as the reusable default. Existing user brand requirements, design systems, and explicit visual requests override it; state material conflicts rather than silently blending incompatible directions."
            : `Keep durable project context in \`${localePaths.workspaceDir}/\`. Consolidate verified conclusions into the appropriate canonical document and update affected indexes. Before creating a complete solution, plan, or implementation change, present a project agreement and wait for explicit user confirmation.`,
      ruleOpenWorkspaceViewer: "After initialization, and whenever the user asks to browse, review, or inspect the current workspace, run `npx --yes recowork@latest view .` from the project root yourself. It detects the workspace automatically, reuses an already-running viewer for the same workspace, and otherwise opens a local read-only viewer. Do not ask the user to install RecoWork, locate the workspace directory, or type the command.",
      ruleKeepScoped: "Keep changes scoped to the current task.",
      ruleExplainVerification: "Explain verification steps after implementation.",
      chatInitTitle: "RecoWork Initialization Prompt",
      chatInitIntro: `You are helping me use the RecoWork template \`${template.id}\`.`,
      chatInitInstruction: isWebDesignStandard
        ? `You are a senior product web designer and front-end implementation reviewer. Design or improve a web page from the input below.\n\n## Input\n- Product or page: [describe]\n- Audience and primary task: [describe]\n- Required content and actions: [describe]\n- Existing brand, design system, or reference: [describe or write none]\n- Technical constraints: [describe]\n\n## Priority\nExisting brand guidance, component libraries, and explicit user visual requirements override this default. If they conflict or information is missing, state the conflict and ask the smallest material clarifying questions. Do not present assumptions as facts.\n\n## Default visual direction\nUse a restrained, modern, trustworthy product-web style suited to SaaS, tools, small product sites, and lightweight operational dashboards: content first, clear hierarchy, purposeful whitespace, low decoration, limited accent color, real component states, and accessibility first. Do not apply this default to expressive brand sites, games, complex commerce, or strict existing brand systems without clarification.\n\n## Tokens\n- Page/surface/text/border: #FFFFFF, #F8FAFC, #0F172A, #E2E8F0; muted text #475569.\n- Accent: #2563EB, hover #1D4ED8. Success #15803D, warning #B45309, danger #B91C1C.\n- Font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif. Body 16px/1.5; supporting text 14px/1.5; use a limited 12/14/16/20/24/32/40px scale.\n- Spacing: 4/8/12/16/24/32/48/64px. Container max 1200px, desktop horizontal padding 24px, mobile 16px.\n- Radius: 6px for controls, 8px for cards/dialogs. Use 1px #E2E8F0 borders. Shadows are reserved for floating layers.\n\n## Page and component rules\n- Establish one primary task and normally one primary action. Use semantic HTML and clear section hierarchy.\n- Navigation, buttons, forms, cards, lists/tables, empty states, loading, success, warning, error, disabled, hover, and focus states must be real where relevant.\n- Buttons and inputs need visible focus and usable touch targets. Forms need visible labels, field-level recovery guidance, and submission feedback. Tables need headers and responsive handling.\n- Desktop and mobile are both required. Below 768px prefer one column; collapse side-by-side layouts when needed; make mobile navigation closable; do not rely on hover-only information.\n\n## Do not\nDo not use broad or stacked gradients, purposeless glassmorphism, floating decorative effects, excessive rounding, nested cards, buzzword-heavy marketing copy, fake charts or metrics, desktop-only layouts, or static screenshot-only UI.\n\n## Output\nFirst provide a concise plan covering hierarchy, responsive behavior, component states, and validation. Then implement or propose the requested page. Keep changes scoped and reuse existing project components when available.\n\n## Delivery self-check\nBefore claiming completion, check and report: brand-priority handling; hierarchy and text fit; desktop/mobile layout; navigation and form behavior; relevant interactive, empty, loading, and error states; keyboard/focus/semantic HTML/contrast/alt text; and available build, test, or visual verification.\n\n## Continuation summary\nAt the end of meaningful work, output:\n- Current page goal\n- Confirmed visual decisions\n- Implemented work and verification\n- Open questions or risks\n- Next step\nThis summary must be saved and pasted into the next chat; it is not persisted automatically.`
        : isIdeaToProjectWorkflow
        ? "Start by determining the current stage: (1) a fuzzy idea, (2) several directions to compare, or (3) a direction ready to become a project. In exploration, clarify the problem, users, constraints, success signals, known facts, assumptions, and open questions; explore alternatives and create a direction decision package. For a direction I want to revisit later, record it as Parked with its reason and restart condition; do not treat it as an open question or archived decision. Then stop and ask me to choose: continue exploring, validate a key assumption, explicitly confirm project entry for a named direction, or park a direction. Only after I confirm entry, turn the package into a project brief, confirm scope and success criteria, and advance through requirements, solution design, planning, decisions, review, and validation. At each meaningful step, separate facts from assumptions and provide a continuation summary with the current stage, decisions, parked directions and restart conditions, open questions, and next step."
        : isIdeaWorkflow
        ? "Start with focused idea discovery. Clarify the question, target user, constraints, success signals, known facts, assumptions, and open questions. Explore multiple directions first, then present an idea agreement and wait for my explicit confirmation before selecting a priority direction, validation plan, or project execution."
        : isLearningWorkflow
        ? "Start with a focused learning diagnosis. Restate the goal, background, constraints, preferences, completion criteria, assumptions, and open questions as a short learning agreement, then wait for my explicit confirmation. Until I confirm, do not generate a roadmap, lesson content, practice plan, or project plan. After confirmation, teach one validated unit at a time and leave a short continuation memory after meaningful work."
        : isProjectWorkflow
          ? "Start with focused project discovery. Restate the goal, scope, constraints, risks, success criteria, assumptions, and open questions as a short project agreement, then wait for my explicit confirmation. Until I confirm, only maintain a draft project brief and open questions; do not generate a complete solution, plan, or implementation change. After confirmation, work in small, verified steps and capture durable decisions."
        : "Ask one concise question if the task is unclear. Otherwise, help me start the workflow, keep assumptions explicit, and leave a short continuation memory after meaningful work.",
      chatTaskTitle: "Task Prompt",
      chatTaskIntro: isWebDesignStandard
        ? "Use this lightweight web-design chat protocol."
        : isChatTarget
        ? `Use this lightweight \`${template.id}\` chat protocol.`
        : `Use the \`${template.id}\` workflow and its role contract.`,
      chatTaskFieldTask: "Task",
      chatTaskFieldContext: "Context",
      chatTaskFieldConstraints: "Constraints",
      chatTaskInstruction: isWebDesignStandard
        ? "Restate the page goal and existing brand constraints first. Use the start instruction's default design system only when no higher-priority system exists. Before delivery, include responsive, interaction-state, accessibility, and verification results plus a continuation summary."
        : isIdeaToProjectWorkflow
        ? "First identify the current stage. If the direction is not confirmed, clarify and compare directions, keep assumptions distinct from evidence, update a direction decision package, and wait for my explicit choice to continue, validate, enter a project, or park a direction with a restart condition. If project entry is confirmed, use that package as the project brief input and work only within confirmed scope. After meaningful work, include a memory card with stage, current facts, decisions, parked directions and restart conditions, open questions, and next step."
        : isIdeaWorkflow
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
      claudeInstructionsRule: isIdeaToProjectWorkflow
        ? "Determine the current stage first. Explore and validate multiple directions before convergence; present a direction decision package and wait for explicit confirmation before project entry. After entry, transfer confirmed facts into the project brief and work in small, verified project steps."
        : isIdeaWorkflow
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
    ruleReadProjectContext: isWebDesignStandard
      ? `设计、生成或改动网页前，先读取 \`${localePaths.designStandardFile}\`。项目已有品牌规范或设计系统时，也必须先读取，并以其为更高优先级。`
      : `在${isLearningWorkflow ? "开始或续接一个学习单元" : isIdeaWorkflow ? "开始或续接一次想法探索" : isIdeaToProjectWorkflow ? "判断或续接当前工作阶段" : "改动"}前先读取 \`README.md\`、\`${localePaths.roleFile}\`、\`${localePaths.methodsDir}/\`、\`${localePaths.workspaceDir}/\` 和 \`rw-manifest.json\`。`,
    ruleCaptureKnowledge: isWebDesignStandard
      ? "将项目专属的视觉决策记录在项目已有文档中；除非用户明确要求，不要改写这份可复用规范。"
      : `把已验证的结论沉淀到 \`${localePaths.knowledgeCaptureDir}/\`，并更新受影响的索引。`,
    ruleReviewOutput: isWebDesignStandard
      ? `交付前完成 \`${localePaths.designStandardFile}\` 中的自检清单，并报告响应式、交互状态、可访问性和验证结果。`
      : "返回结果前，对照模板用途和预期产物自审。",
    ruleConfirmLargeChanges: isIdeaToProjectWorkflow
      ? "选择优先方向、验证计划或进入项目之前，先给出方向决策包并等待用户明确确认；进入项目后，重大范围变化或不可逆操作前也必须确认。"
      : isIdeaWorkflow
      ? "选择优先方向、验证计划或进入项目执行前，先给出想法约定并等待用户明确确认。"
      : isLearningWorkflow
      ? "生成或变更课程路线、章节内容、练习计划或项目方案前，先给出学习约定并等待学习者明确确认；大范围变更或不可逆操作前也必须先确认。"
      : isProjectWorkflow
        ? "生成完整方案、计划或实施改动前，先给出项目约定并等待用户明确确认；大范围变更或不可逆操作前也必须先确认。"
      : isWebDesignStandard
        ? "视觉方向发生重大变化、需要大范围重写页面，或既有品牌要求不明确时，先向用户确认；不可逆操作前也必须确认。"
        : "大范围变更或不可逆操作前，先向用户确认。",
      ruleKeepKnowledge: isIdeaToProjectWorkflow
      ? `将当前事实精简地保留在 \`${localePaths.workspaceDir}/\` 和正式索引中；把暂不推进但可重启的方向记录在 \`${localePaths.workspaceDir}/搁置想法.md\`，写明搁置原因和重启条件，它既不是待确认问题也不是归档材料。同一主题原地更新一份当前文档。用户确认后，才将已替代版本和已结束过程材料按分类、主题和版本放入 \`${localePaths.workspaceDir}/归档/\`。用户明确确认进入项目之前，不得开始完整项目设计、计划或实施；确认后将方向结论同步到项目简报，并使用后续编号目录推进。`
      : isIdeaWorkflow
      ? `把想法简报、方向、假设和决策放在 \`${localePaths.workspaceDir}/\`。先充分发散，再区分事实、假设和证据；收敛到优先方向前等待用户确认。`
    : isLearningWorkflow
      ? `将当前学习简报、课程路线、进度和已验证学习记录精简地保留在 \`${localePaths.workspaceDir}/\` 和正式索引中；同一主题原地更新一份当前文档。学习者确认后，才将已替代版本和已结束过程材料按分类、主题和版本放入 \`${localePaths.workspaceDir}/归档/\`。生成或变更课程路线、章节内容、练习计划或项目方案前，先给出学习约定并等待学习者明确确认；确认后一次只推进一个经过验证的学习单元。`
      : isWebDesignStandard
        ? "将本文件作为可复用默认规范。用户已有品牌、设计系统和明确视觉要求优先；存在实质冲突时应清楚说明，不要默默混合不兼容的方向。"
        : `把长期项目上下文放在 \`${localePaths.workspaceDir}/\`。将已验证结论合并到对应的权威文档，并更新受影响的索引。生成完整方案、计划或实施改动前，先给出项目约定并等待用户明确确认。`,
    ruleOpenWorkspaceViewer: "初始化完成后，以及用户要求浏览、复盘或查看当前工作空间时，由你在项目根目录直接运行 `npx --yes recowork@latest view .`。该命令会自动识别工作空间；同一工作空间的查看器已运行时会自动复用，否则打开本地只读查看器。不要让用户自行安装 RecoWork、查找工作空间目录或输入命令。",
    ruleKeepScoped: "保持改动聚焦在当前任务范围内。",
    ruleExplainVerification: "实现后说明验证步骤。",
    chatInitTitle: "RecoWork 初始化 Prompt",
    chatInitIntro: `你正在使用 RecoWork 模板 \`${template.id}\`。`,
    chatInitInstruction: isWebDesignStandard
      ? `你是一名资深产品网页设计师和前端实现评审者。请根据下面输入设计或改造网页。\n\n## 任务输入\n- 产品或页面：［填写］\n- 目标用户与主任务：［填写］\n- 必要内容与操作：［填写］\n- 既有品牌、设计系统或参考：［填写；没有则写无］\n- 技术约束：［填写］\n\n## 优先级\n用户已有品牌规范、组件库和明确视觉要求优先于本默认规范。出现冲突或信息不足时，说明冲突并只提出最关键的澄清问题；不要把假设当作事实。\n\n## 默认视觉方向\n采用克制、现代、可信赖的产品型网页风格，适用于 SaaS、工具型产品、个人或小团队官网与轻量运营后台：内容优先、层级清晰、留白克制、低装饰、有限强调色、真实组件状态、可访问性优先。强品牌艺术站、游戏、复杂电商或严格既有品牌系统需要先澄清，不能直接套用。\n\n## 视觉 Token\n- 页面/次级背景/主文字/边框：#FFFFFF、#F8FAFC、#0F172A、#E2E8F0；次级文字 #475569。\n- 主强调色 #2563EB，悬停 #1D4ED8；成功 #15803D，警告 #B45309，错误 #B91C1C。\n- 字体：Inter、ui-sans-serif、system-ui、-apple-system、BlinkMacSystemFont、"Segoe UI"、sans-serif。正文 16px/1.5，辅助文字 14px/1.5；字号仅用有限的 12/14/16/20/24/32/40px 层级。\n- 间距：4/8/12/16/24/32/48/64px。容器最大 1200px，桌面水平内边距 24px，移动端 16px。\n- 圆角：控件 6px，卡片和弹层 8px；使用 1px #E2E8F0 边框，阴影只用于浮层。\n\n## 页面与组件规则\n- 每页明确一个主任务，通常只保留一个视觉主操作；使用语义化 HTML 与清晰标题层级。\n- 导航、按钮、表单、卡片、列表/表格、空状态、加载、成功、警告、错误、禁用、悬停和焦点等相关状态必须真实可用。\n- 按钮和输入框要有可见焦点和足够触摸区域；表单必须有可见标签、字段级修复提示和提交反馈；表格必须有表头和响应式处理。\n- 桌面与移动网页都必须覆盖。768px 以下优先单列，空间不足时收起并列布局；移动导航必须可关闭；不要依赖仅悬停可见的信息。\n\n## 禁止项\n不要使用大面积或叠层渐变、无意义玻璃拟态、漂浮装饰效果、过度圆角、卡片嵌卡片、营销词堆砌、虚假图表或指标、仅桌面可用的布局，或只适合截图的静态界面。\n\n## 输出要求\n先给出简短计划，说明信息层级、响应式处理、组件状态和验证方式；再实现或提出页面方案。改动保持聚焦，优先复用项目已有组件。\n\n## 交付前自检\n完成前检查并报告：品牌优先级处理、信息层级与文字适配、桌面/移动布局、导航与表单行为、必要的交互/空/加载/错误状态、键盘/焦点/语义 HTML/对比度/替代文本，以及可执行的构建、测试或视觉验证。\n\n## 续接摘要\n每次重要工作结束时输出：\n- 当前页面目标\n- 已确认的视觉决策\n- 已实现内容与验证结果\n- 待确认问题或风险\n- 下一步\n这份摘要需要由我保存并粘贴到下一轮对话，系统不会自动持久化。`
      : isIdeaToProjectWorkflow
      ? "先判断当前处于哪一阶段：（1）只有模糊想法，（2）有多个方向需要比较，或（3）已有方向准备启动项目。探索阶段先澄清问题、用户、约束、成功信号、已知事实、假设和待确认问题，发散备选方向并形成方向决策包；对我希望以后再看的方向，标记为“搁置”，写明搁置原因和重启条件，不要把它当成待确认问题或归档决定。随后停下，请我明确选择继续探索、验证关键假设、确认以指定方向进入项目，或搁置一个方向。只有在我确认进入项目后，才将决策包转化为项目简报，确认范围和成功标准，并进入需求、方案、计划、决策、评审和验证。每次重要工作结束后，给出包含当前阶段、当前事实、已确认结论、搁置方向及重启条件、待确认问题和下一步的续接摘要。"
      : isIdeaWorkflow
      ? "先进行聚焦的想法澄清：明确问题、目标用户、约束、成功信号、已知事实、假设和待确认问题。先探索多个方向，再给出想法约定；在我明确确认前，不要选择优先方向、制定验证计划或进入项目执行。"
      : isLearningWorkflow
      ? "先进行聚焦的学习诊断。将目标、基础、约束、偏好、完成标准、假设和待确认问题整理为简短的学习约定，并等待我明确确认。在确认前，不要生成课程路线、章节内容、练习计划或项目方案。确认后一次只推进一个经过验证的学习单元，并在重要工作结束后留下可复制的续聊记忆。"
      : isProjectWorkflow
        ? "先进行聚焦的项目澄清。将目标、范围、约束、风险、成功标准、假设和待确认问题整理为简短的项目约定，并等待我明确确认。在确认前，只维护项目简报草稿和待确认问题；不要生成完整方案、计划或实施改动。确认后分小步推进、验证结果并沉淀长期决策。"
      : "如果任务不清晰，先问一个最必要的问题。否则帮助我启动工作流，明确标注假设，并在重要任务结束后留下可复制的续聊记忆。",
    chatTaskTitle: "任务 Prompt",
    chatTaskIntro: isWebDesignStandard
      ? "请按这个轻量网页设计对话协议推进。"
      : isChatTarget
      ? `请按这个轻量 \`${template.id}\` 对话协议推进。`
      : `请按 \`${template.id}\` 工作流及其角色设定推进。`,
    chatTaskFieldTask: "任务",
    chatTaskFieldContext: "背景",
    chatTaskFieldConstraints: "约束",
    chatTaskInstruction: isWebDesignStandard
      ? "先复述页面目标和已有品牌约束。只有没有更高优先级规范时才使用启动指令中的默认设计规范。交付前报告响应式、交互状态、可访问性与验证结果，并附上续接摘要。"
      : isIdeaToProjectWorkflow
      ? "先识别当前阶段。方向尚未确认时，澄清并比较方向，区分假设与证据，更新方向决策包，并等待我明确选择继续探索、验证、进入项目，或以重启条件搁置一个方向。项目进入已确认时，以决策包作为项目简报输入，只在确认范围内推进。重要工作结束后附上包含阶段、当前事实、决策、搁置方向及重启条件、待确认问题和下一步的记忆卡。"
      : isIdeaWorkflow
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
    claudeInstructionsRule: isIdeaToProjectWorkflow
      ? "先判断当前阶段。探索和验证多个方向后形成方向决策包，并在进入项目之前等待用户明确确认；确认后将方向结论同步到项目简报，再以小步、可验证方式推进项目。"
      : isIdeaWorkflow
      ? "先探索多个方向再收敛，区分事实、假设、风险和证据；选择优先方向、验证计划或进入项目执行前，给出想法约定并等待用户明确确认。"
      : isLearningWorkflow
      ? "先进行聚焦诊断并给出学习约定。在学习者明确确认前，不要生成课程路线、章节内容、练习计划或项目方案；确认后一次只推进一个经过验证的学习单元，明确标注假设，并在每个阶段结束后总结可持续使用的上下文。"
      : isProjectWorkflow
        ? "先进行聚焦的项目澄清并给出项目约定。在用户明确确认前，不要生成完整方案、计划或实施改动；确认后分小步推进、明确标注假设，并在每个阶段结束后总结可持续使用的上下文。"
      : "分小步推进，明确标注假设，重大方向变化前先确认，并在每个阶段结束后总结可持续使用的上下文。",
  };
}

function getLocalePaths(locale, template) {
  const isLearningWorkflow = template && template.id === "learning-engineering";
  const isIdeaWorkflow = template && template.id === "idea-engineering";
  const isIdeaToProjectWorkflow = template && template.id === "idea-to-project";
  const isWebDesignStandard = template && template.id === "web-design-standard";
  if (locale === "en") {
    if (isWebDesignStandard) {
      return { designStandardFile: "web-design-standard.md" };
    }
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
    if (isIdeaToProjectWorkflow) {
      return {
        methodsDir: "methods",
        workspaceDir: "workspace",
        briefFile: "project-brief.md",
        questionsFile: "open-questions.md",
        roleFile: "methods/role-contract.md",
        knowledgeCaptureDir: "workspace/04-plan-and-decisions",
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

  if (isWebDesignStandard) {
    return { designStandardFile: "网页设计规范.md" };
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
  if (isIdeaToProjectWorkflow) {
    return {
      methodsDir: "工作方法",
      workspaceDir: "工作空间",
      briefFile: "项目简报.md",
      questionsFile: "待确认问题.md",
      roleFile: "工作方法/角色设定.md",
      knowledgeCaptureDir: "工作空间/04-计划与决策",
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

function writeManifest(targetDir, template, target, locale, agentBlock = null) {
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
  if (agentBlock) {
    delete manifest.files[agentBlock.path];
    manifest.agent_block = agentBlock;
  }

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
