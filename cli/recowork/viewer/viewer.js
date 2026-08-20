const state = { workspace: null, selected: null, showingArchive: false, expanded: new Set(), collapsed: new Set(), searchResults: null, searchSequence: 0 };
const navigation = document.querySelector("#navigation");
const content = document.querySelector("#main-content");
const search = document.querySelector("#search");
const archiveToggle = document.querySelector("#archive-toggle");
let searchTimer;

const copy = {
  en: { viewerName: "RecoWork Viewer", searchPlaceholder: "Search current workspace", navigationLabel: "Workspace navigation", viewArchive: "View archive", currentWorkspace: "Current workspace", workspaceName: "Current workspace", openDocument: "Open this document", viewerEyebrow: "WORKSPACE VIEWER", headline: "Continue from the current facts.", intro: "Current work is shown by default. Open questions, parked directions, and next steps stay visible without mixing in historical archives.", emptyOverview: "No overview documents were recognized. Open a Markdown file from the navigation.", readError: "Unable to read document.", expand: "Expand section", collapse: "Collapse section", searchLoading: "Searching...", noResults: "No matching documents.", previous: "Previous", next: "Next", currentPath: "Current path" },
  zh: { viewerName: "RecoWork 工作空间", searchPlaceholder: "搜索当前工作空间", navigationLabel: "工作空间导航", viewArchive: "查看归档", currentWorkspace: "返回当前工作", workspaceName: "当前工作空间", openDocument: "打开此文档", viewerEyebrow: "工作空间查看器", headline: "从当前事实继续工作。", intro: "默认展示当前工作内容。待确认问题、搁置方向和下一步不再埋在历史文档里；归档内容只在需要追溯时打开。", emptyOverview: "未识别到概览文档。请从左侧导航打开 Markdown 文件。", readError: "无法读取该文档。", expand: "展开目录", collapse: "收起目录", searchLoading: "正在搜索...", noResults: "没有匹配的文档。", previous: "上一篇", next: "下一篇", currentPath: "当前位置" },
};

configureMarkdown();
boot();

async function boot() {
  const response = await fetch("/api/workspace");
  state.workspace = await response.json();
  applyLocale();
  document.querySelector("#workspace-name").textContent = state.workspace.workspace === "." ? labels().workspaceName : state.workspace.workspace;
  renderNavigation();
  await syncRoute();
}

function configureMarkdown() {
  const renderer = new window.marked.Renderer();
  renderer.html = () => "";
  renderer.link = (href, title, text) => renderLink(text, href, state.selected || "");
  renderer.image = (href, title, text) => renderImage(href, title, text);
  window.marked.setOptions({ gfm: true, breaks: false, renderer });
}

function applyLocale() {
  const locale = state.workspace.locale === "zh" ? "zh" : "en";
  const ui = copy[locale];
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.title = ui.viewerName;
  document.querySelector("#viewer-name").textContent = ui.viewerName;
  search.placeholder = ui.searchPlaceholder;
  navigation.setAttribute("aria-label", ui.navigationLabel);
  archiveToggle.textContent = ui.viewArchive;
}

function labels() { return copy[state.workspace.locale === "zh" ? "zh" : "en"]; }
function currentDocuments() { return state.showingArchive ? state.workspace.archiveDocuments : state.workspace.documents; }

function renderNavigation() {
  navigation.replaceChildren();
  const query = search.value.trim();
  if (query) {
    if (state.searchResults === null) {
      navigation.append(navigationMessage(labels().searchLoading));
      return;
    }
    if (!state.searchResults.length) {
      navigation.append(navigationMessage(labels().noResults));
      return;
    }
    state.searchResults.forEach((document) => navigation.append(navButton(document)));
    return;
  }
  if (state.showingArchive) {
    currentDocuments().forEach((document) => navigation.append(navButton(document)));
    return;
  }
  if (state.workspace.navigation) {
    navigation.append(navTree(state.workspace.navigation));
  } else {
    currentDocuments().forEach((document) => navigation.append(navButton(document)));
  }
}

function navigationMessage(message) {
  const element = document.createElement("p");
  element.className = "nav-empty";
  element.textContent = message;
  return element;
}

function navTree(document, depth = 0) {
  const wrapper = document.createElement("div");
  wrapper.className = "nav-branch";
  const hasChildren = document.children?.length;
  const row = document.createElement("div");
  row.className = `nav-row${hasChildren ? " has-disclosure" : ""}`;
  row.append(navButton(document));
  if (hasChildren) {
    const expanded = isBranchExpanded(document.relativePath, depth);
    const toggle = document.createElement("button");
    toggle.className = "nav-disclosure";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? labels().collapse : labels().expand);
    toggle.title = expanded ? labels().collapse : labels().expand;
    toggle.innerHTML = expanded ? "&#9662;" : "&#9656;";
    toggle.addEventListener("click", () => toggleBranch(document.relativePath, depth));
    row.append(toggle);
  }
  wrapper.append(row);
  if (hasChildren && isBranchExpanded(document.relativePath, depth)) {
    const children = document.createElement("div");
    children.className = "nav-children";
    document.children.forEach((child) => children.append(navTree(child, depth + 1)));
    wrapper.append(children);
  }
  return wrapper;
}

function isBranchExpanded(relativePath, depth) {
  if (state.expanded.has(relativePath)) return true;
  if (state.collapsed.has(relativePath)) return false;
  return depth < 2;
}

function toggleBranch(relativePath, depth) {
  if (isBranchExpanded(relativePath, depth)) {
    state.expanded.delete(relativePath);
    state.collapsed.add(relativePath);
  } else {
    state.collapsed.delete(relativePath);
    state.expanded.add(relativePath);
  }
  renderNavigation();
}

function navButton(document) {
  const button = document.createElement("button");
  const detail = document.searchSnippet || document.status || document.updated;
  button.className = `nav-item${state.selected === document.relativePath ? " active" : ""}`;
  button.type = "button";
  button.innerHTML = `<span>${escapeHtml(document.title)}</span>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}`;
  button.addEventListener("click", () => openDocument(document.relativePath));
  return button;
}

function renderDashboard() {
  state.selected = null;
  renderNavigation();
  const ui = labels();
  const overview = state.workspace.overview.map(({ label, document }) => {
    const meta = [document.status, document.updated].filter(Boolean).join(" · ");
    return `<button class="overview-card" data-path="${escapeAttribute(document.relativePath)}"><span>${escapeHtml(label)}</span><h2>${escapeHtml(document.title)}</h2><p>${escapeHtml(document.summary || ui.openDocument)}</p>${meta ? `<small class="overview-meta">${escapeHtml(meta)}</small>` : ""}</button>`;
  }).join("");
  content.innerHTML = `<section class="dashboard"><p class="eyebrow">${ui.viewerEyebrow}</p><h1>${ui.headline}</h1><p class="intro">${ui.intro}</p><div class="overview-grid">${overview || `<div class="empty">${ui.emptyOverview}</div>`}</div></section>`;
  content.querySelectorAll("[data-path]").forEach((button) => button.addEventListener("click", () => openDocument(button.dataset.path)));
}

async function openDocument(relativePath, options = {}) {
  const response = await fetch(`/api/document?path=${encodeURIComponent(relativePath)}`);
  const documentData = await response.json();
  if (!response.ok) {
    content.innerHTML = `<div class="empty">${escapeHtml(documentData.error || labels().readError)}</div>`;
    return;
  }
  state.selected = relativePath;
  if (options.updateRoute !== false) updateDocumentRoute(relativePath);
  renderNavigation();
  const parsed = parseFrontmatter(documentData.source);
  const title = parsed.metadata.title || findTitle(parsed.body) || relativePath;
  const body = parsed.body.replace(/^#\s+.+\r?\n+/, "");
  const order = navigationOrder();
  const index = order.indexOf(relativePath);
  const previous = index > 0 ? order[index - 1] : null;
  const next = index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  content.innerHTML = `<article class="document"><nav class="breadcrumb" aria-label="${escapeAttribute(labels().currentPath)}">${renderBreadcrumb(relativePath)}</nav><h1>${escapeHtml(title)}</h1><div class="document-meta">${parsed.metadata.status ? `<span class="badge">${escapeHtml(parsed.metadata.status)}</span>` : ""}${parsed.metadata.date ? `<span>${escapeHtml(parsed.metadata.date)}</span>` : ""}</div><div class="document-body">${renderMarkdown(body)}</div><nav class="document-navigation" aria-label="${escapeAttribute(labels().currentPath)}"><button type="button" data-document-path="${escapeAttribute(previous || "")}" ${previous ? "" : "disabled"}>${labels().previous}</button><button type="button" data-document-path="${escapeAttribute(next || "")}" ${next ? "" : "disabled"}>${labels().next}</button></nav></article>`;
  content.querySelectorAll("[data-document-path]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    if (link.dataset.documentPath) openDocument(link.dataset.documentPath);
  }));
  content.scrollTop = 0;
  content.focus();
}

function navigationOrder() {
  const order = [];
  const append = (document) => {
    if (!document || order.includes(document.relativePath)) return;
    order.push(document.relativePath);
    document.children?.forEach(append);
  };
  if (!state.showingArchive) append(state.workspace.navigation);
  currentDocuments().forEach((document) => append(document));
  return order;
}

function renderBreadcrumb(relativePath) {
  const parts = relativePath.split("/");
  return parts.map((part, index) => `${index ? "<span aria-hidden=\"true\">/</span>" : ""}<span>${escapeHtml(part)}</span>`).join("");
}

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { metadata: {}, body: source };
  const metadata = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const pair = line.match(/^([\w-]+):\s*(.+)$/);
    if (pair) metadata[pair[1]] = pair[2].replace(/^['"]|['"]$/g, "");
  });
  return { metadata, body: source.slice(match[0].length) };
}

function findTitle(source) { return (source.match(/^#\s+(.+)$/m) || [])[1]; }
function renderMarkdown(source) { return window.marked.parse(source); }

function renderLink(text, href) {
  const target = String(href || "").trim();
  if (/^(https?:|mailto:)/i.test(target)) return `<a href="${escapeAttribute(target)}" target="_blank" rel="noreferrer">${text}</a>`;
  const withoutAnchor = target.split("#")[0];
  if (withoutAnchor.toLowerCase().endsWith(".md")) {
    const base = state.selected?.includes("/") ? state.selected.slice(0, state.selected.lastIndexOf("/")) : "";
    const normalized = normalizeDocumentPath(`${base}/${withoutAnchor}`);
    return normalized ? `<a href="#doc=${encodeURIComponent(normalized)}" data-document-path="${escapeAttribute(normalized)}">${text}</a>` : text;
  }
  return text;
}

function renderImage(href, title, text) {
  const target = String(href || "").trim();
  if (!target) return "";
  const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : "";
  if (/^https?:\/\//i.test(target)) {
    return `<img src="${escapeAttribute(target)}" alt="${escapeAttribute(text || "")}"${titleAttribute} />`;
  }
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) return "";
  const base = state.selected?.includes("/") ? state.selected.slice(0, state.selected.lastIndexOf("/")) : "";
  const normalized = normalizeDocumentPath(`${base}/${target.replace(/^\//, "")}`);
  if (!normalized) return "";
  return `<img src="/api/asset?path=${encodeURIComponent(normalized)}" alt="${escapeAttribute(text || "")}"${titleAttribute} />`;
}

function normalizeDocumentPath(value) {
  const parts = [];
  for (const part of value.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") { parts.pop(); continue; }
    parts.push(part);
  }
  return parts.length ? parts.join("/") : null;
}

function updateDocumentRoute(relativePath) {
  const hash = `#doc=${encodeURIComponent(relativePath)}`;
  if (window.location.hash !== hash) window.history.pushState(null, "", hash);
}

async function syncRoute() {
  const path = new URLSearchParams(window.location.hash.slice(1)).get("doc");
  if (path && path !== state.selected) {
    await openDocument(path, { updateRoute: false });
  } else if (!path && state.selected) {
    renderDashboard();
  } else if (!path) {
    renderDashboard();
  }
}

async function searchDocuments() {
  const query = search.value.trim();
  const sequence = ++state.searchSequence;
  if (!query) {
    state.searchResults = null;
    renderNavigation();
    return;
  }
  state.searchResults = null;
  renderNavigation();
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&scope=${state.showingArchive ? "archive" : "current"}`);
  if (sequence !== state.searchSequence) return;
  state.searchResults = response.ok ? await response.json() : [];
  renderNavigation();
}

function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]); }
function escapeAttribute(value) { return escapeHtml(value).replace(/'/g, "&#39;"); }

search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(searchDocuments, 140);
});
archiveToggle.addEventListener("click", () => {
  state.showingArchive = !state.showingArchive;
  state.searchResults = null;
  if (window.location.hash) window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  archiveToggle.setAttribute("aria-pressed", String(state.showingArchive));
  archiveToggle.textContent = state.showingArchive ? labels().currentWorkspace : labels().viewArchive;
  renderDashboard();
});
window.addEventListener("hashchange", syncRoute);
window.addEventListener("popstate", syncRoute);
