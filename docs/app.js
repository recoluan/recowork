const copy = {
  zh: {
    copied: "已复制",
    templates: {
      "idea-to-project": "从想法到落地",
      "learning-engineering": "系统性学习",
      "web-design-standard": "网页设计规范",
    },
    local: "本地可执行 Agent",
    chat: "Chat / Mobile",
  },
  en: {
    copied: "Copied",
    templates: {
      "idea-to-project": "Idea to project",
      "learning-engineering": "Structured learning",
      "web-design-standard": "Web design standard",
    },
    local: "Local executable agent",
    chat: "Chat / Mobile",
  },
};

const templateCategories = {
  workflow: ["idea-to-project", "learning-engineering"],
  standard: ["web-design-standard"],
};

const commandNames = {
  "idea-to-project": "idea-to-project",
  "learning-engineering": "learning",
  "web-design-standard": "web-design-standard",
};

const languageKey = "recowork-language";
let language = (() => {
  try { return localStorage.getItem(languageKey) === "en" ? "en" : "zh"; } catch { return "zh"; }
})();
const config = { template: "idea-to-project", target: "local-agent-project", locale: language };

function isChat() { return config.target === "chat-mobile"; }

function localPrompt() {
  const command = `npx --yes recowork@latest add ${commandNames[config.template]} --target local-agent-project --locale ${config.locale} .`;
  if (config.locale === "en") {
    return `You are helping me start a RecoWork workflow.\n\nWork type: ${copy.en.templates[config.template]}\nEnvironment: local executable agent\nDestination: current project\n\nWork this way:\n1. Confirm that this environment can run commands. Check Node.js and npm.\n2. If either is unavailable or outdated, explain the blocker and ask for my confirmation before installing a current stable Node.js.\n3. Once the environment is ready, run the following command. It downloads the latest RecoWork package for this run, so a global rw command is not required:\n   ${command}\n4. Preserve any existing root AGENTS.md outside RecoWork's managed block.\n5. Show the generated file tree, explain what was created, and ask for the first work input.\n\nDo not replace the command with rw unless RecoWork is already installed globally. Do not pretend files were created if command execution is unavailable.`;
  }
  return `你正在帮助我开始一项 RecoWork 工作。\n\n工作类型：${copy.zh.templates[config.template]}\n使用环境：本地可执行 Agent\n目标位置：当前项目\n\n请按以下方式工作：\n1. 先确认当前环境可以执行命令，并检查 Node.js 与 npm。\n2. 如果其中任一项缺失、不可用或版本过旧，说明阻塞原因，并在安装稳定版 Node.js 前征求我的确认。\n3. 环境满足要求后运行下面的命令。该命令会临时获取最新版 RecoWork，无需预先全局安装 rw：\n   ${command}\n4. 保留已有根目录 AGENTS.md 中 RecoWork 受管区块之外的内容。\n5. 展示生成后的文件树，说明创建了什么，并询问我的第一项工作输入。\n\n除非已经全局安装 RecoWork，否则不要把上述命令替换成 rw。如果无法执行命令，不要模拟已经创建了本地文件。`;
}

function chatPrompt() {
  const label = copy[config.locale].templates[config.template];
  if (config.locale === "en") {
    return `Act as my ${label} partner.\n\nFirst, help me define one real task that should continue beyond this chat. Before doing the work, confirm:\n- the goal and boundary\n- the expected deliverable and completion criteria\n- relevant facts, constraints, and decisions\n- what needs human review\n\nThen work in small verifiable steps. At the end of each meaningful step, provide a continuation summary with current facts, decisions, open questions, and the next action. Do not claim to create local files or retain memory outside this conversation.`;
  }
  return `作为我的${label}协作伙伴工作。\n\n先帮助我定义一项需要跨多次对话持续推进的真实工作。在开始前，请确认：\n- 目标与边界\n- 交付物与完成标准\n- 已知事实、约束与决策\n- 需要人工审查的位置\n\n随后按可验证的小步骤推进。每完成一个重要步骤，都给出续接摘要：当前事实、已确认决策、待确认问题与下一步。不要声称会创建本地文件，也不要声称能在对话之外自动保留记忆。`;
}

function getPrompt() { return isChat() ? chatPrompt() : localPrompt(); }

function updateLocaleOptions() {
  document.querySelectorAll(".config-locale").forEach((button) => {
    const active = button.dataset.locale === config.locale;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderPrompt() {
  const prompt = document.querySelector("#promptPaths");
  if (!prompt) return;

  document.querySelectorAll("[data-template]").forEach((button) => {
    const active = button.dataset.template === config.template;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-target]").forEach((button) => {
    const active = button.dataset.target === config.target;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateLocaleOptions();
  const designDemo = document.querySelector("#designDemoLink");
  if (designDemo) designDemo.hidden = config.template !== "web-design-standard";
  prompt.textContent = getPrompt();
  prompt.setAttribute("aria-busy", "false");
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  config.locale = nextLanguage;
  try { localStorage.setItem(languageKey, language); } catch { /* Storage is optional. */ }
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.body.dataset.lang = language;
  document.querySelectorAll("[data-zh][data-en]").forEach((node) => { node.textContent = node.dataset[language]; });
  document.querySelectorAll(".language-toggle").forEach((button) => button.classList.toggle("active", button.dataset.lang === language));
  if (document.body.dataset.titleZh) {
    document.title = language === "zh" ? document.body.dataset.titleZh : document.body.dataset.titleEn;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === "zh" ? document.body.dataset.descriptionZh : document.body.dataset.descriptionEn;
  }
  updateMobileNavigationLabel();
  renderPrompt();
  renderWorkbenchCase();
}

function updateMobileNavigationLabel() {
  const toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;
  const open = toggle.getAttribute("aria-expanded") === "true";
  const labelKey = `${open ? "close" : "open"}${language === "zh" ? "Zh" : "En"}`;
  toggle.setAttribute("aria-label", toggle.dataset[labelKey]);
}

function initializeMobileNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!header || !toggle || !nav) return;

  const setOpen = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    updateMobileNavigationLabel();
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", (event) => {
    if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
    setOpen(false);
    toggle.focus();
  });
  window.matchMedia("(max-width: 820px)").addEventListener("change", (event) => {
    if (!event.matches) setOpen(false);
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

const workbenchCases = {
  zh: [
    { template: "从想法到落地", project: "星港防线", chat: "确认首个可玩方向", chats: ["确认首个可玩方向", "评估引擎与平台取舍", "拆分两周开发计划"], user: "我想在 8 周内完成一个单人可玩的俯视角生存游戏。首个版本要验证核心循环，不做剧情、联机和付费系统。", response: "我会先记录问题、目标与候选方向，确认首个可玩版本后再进入需求、方案和推进计划。引擎选择和美术投入仍需你确认。", bullets: ["更新 项目简报.md：目标、范围与非目标", "记录 方向决策包.md：首个可玩方向与依据", "确认后再进入需求与方案设计"], files: [["星港防线/", true], ["AGENTS.md"], ["工作空间/", true], ["项目简报.md", false, true], ["待确认问题.md"], ["01-探索与验证/", true], ["02-需求与约束/", true], ["03-方案设计/", true], ["06-评审验证/", true]], change: "方向决策包.md 已更新", status: "待确认：引擎与美术方案" },
    { template: "系统性学习", project: "LangChain 学习计划", chat: "设计四周学习路线", chats: ["设计四周学习路线", "拆解检索应用练习", "复盘第一周诊断"], user: "我有 Python 基础，想用 4 周完成一个能检索个人笔记的 LangChain 小项目。每天最多投入 45 分钟。", response: "我会先建立学习简报和当前能力基线，再按概念、练习、项目验证组织路线。第一个周期只验证本地检索链路，不提前扩展多模型和部署。", bullets: ["更新 学习简报.md：目标、基础与时间约束", "生成 课程路线.md：四周里程碑与练习", "在 学习进度.md 保留每次验证结果"], files: [["langchain-learning/", true], ["AGENTS.md"], ["学习空间/", true], ["学习简报.md", false, true], ["课程路线.md"], ["学习进度.md"], ["01-课程设计/", true], ["02-课程与练习/", true], ["03-项目实践/", true]], change: "课程路线.md 已更新", status: "下一步：确认每周可用时间" },
    { template: "网页设计规范", project: "咖啡订阅页", chat: "建立响应式设计规范", chats: ["建立响应式设计规范", "确定商品信息层级", "检查移动端状态"], user: "我要做一个独立咖啡品牌订阅页。请先确定视觉方向、移动端信息层级和组件状态，再开始写页面。", response: "我会先生成一份单文件设计规范，明确字体、色彩、栅格、商品卡片和响应式行为。规范会把可用性检查写进交付标准，避免只留下视觉描述。", bullets: ["生成 网页设计规范.md：方向、组件与状态", "在 AGENTS.md 固定页面实现与检查约束", "先确认参考方向，再进入页面开发"], files: [["coffee-subscription/", true], ["AGENTS.md"], ["网页设计规范.md", false, true], ["assets/", true], ["product-images/", true], ["src/", true]], change: "网页设计规范.md 已生成", status: "待确认：视觉参考与品牌语气" },
  ],
  en: [
    { template: "Idea to project", project: "Starport Defense", chat: "Confirm the first playable direction", chats: ["Confirm the first playable direction", "Evaluate engine and platform", "Split the two-week plan"], user: "I want a solo-playable top-down survival game in eight weeks. The first version must validate the core loop, without story, multiplayer, or monetization.", response: "I will record the problem, goal, and candidate direction first. Once you confirm the first playable, we will move into requirements, solution design, and delivery planning. Engine and art investment still need your confirmation.", bullets: ["Update project-brief.md: goal, scope, and non-goals", "Record direction-decision-package.md: chosen first playable and evidence", "Move to requirements and solution design after confirmation"], files: [["starport-defense/", true], ["AGENTS.md"], ["workspace/", true], ["project-brief.md", false, true], ["open-questions.md"], ["01-exploration-and-validation/", true], ["02-requirements-and-constraints/", true], ["03-solution-design/", true], ["06-review-and-validation/", true]], change: "direction-decision-package.md updated", status: "Open: engine and art direction" },
    { template: "Structured learning", project: "LangChain learning plan", chat: "Design a four-week route", chats: ["Design a four-week route", "Split the retrieval app practice", "Review the first-week diagnosis"], user: "I know Python basics and want to build a small LangChain project that searches my personal notes in four weeks. I can spend at most 45 minutes a day.", response: "I will establish the learning brief and current baseline first, then organize concepts, practice, and project validation. The first cycle only validates local retrieval, without adding multi-model work or deployment early.", bullets: ["Update learning-brief.md: goal, baseline, and time", "Generate learning-roadmap.md: milestones and practice", "Keep validation results in learning-progress.md"], files: [["langchain-learning/", true], ["AGENTS.md"], ["learning-space/", true], ["learning-brief.md", false, true], ["learning-roadmap.md"], ["learning-progress.md"], ["01-course-design/", true], ["02-lessons-and-practice/", true], ["03-project-practice/", true]], change: "learning-roadmap.md updated", status: "Next: confirm weekly availability" },
    { template: "Web design standard", project: "Coffee subscription page", chat: "Set the responsive design standard", chats: ["Set the responsive design standard", "Define product information hierarchy", "Review mobile states"], user: "I need a subscription page for an independent coffee brand. Set the visual direction, mobile hierarchy, and component states before we build the page.", response: "I will generate one design-standard file defining type, color, grid, product cards, and responsive behavior. It includes usability checks so the output is more than a visual description.", bullets: ["Generate web-design-standard.md: direction, components, and states", "Keep implementation and review constraints in AGENTS.md", "Confirm references before page development"], files: [["coffee-subscription/", true], ["AGENTS.md"], ["web-design-standard.md", false, true], ["assets/", true], ["product-images/", true], ["src/", true]], change: "web-design-standard.md generated", status: "Open: visual references and brand tone" },
  ],
};

let workbenchIndex = 0;
let workbenchTimer;

function renderWorkbenchCase() {
  const workbench = document.querySelector("[data-workbench-carousel]");
  if (!workbench) return;
  const cases = workbenchCases[language];
  const item = cases[workbenchIndex % cases.length];
  const label = language === "zh" ? "会话" : "Chats";
  const labels = language === "zh" ? { project: "项目", current: "当前会话", files: "项目目录", preview: "界面示意", you: "你", footer: "已记录当前事实，下一步等待人工确认。", cases: "模板案例" } : { project: "Project", current: "Current chat", files: "Project files", preview: "Interface preview", you: "You", footer: "Current facts recorded. Next, waiting for human confirmation.", cases: "Template cases" };
  const fileRows = item.files.map(([name, folder, active]) => `${folder ? "<strong>" : `<span class="${active ? "is-active" : ""}">`}${name}${folder ? "</strong>" : "</span>"}`).join("");
  const chats = item.chats.map((chat, index) => `<div class="workbench-chat ${index === 0 ? "active" : ""}"><span class="workbench-chat-dot"></span><strong>${chat}</strong><small>${index === 0 ? (language === "zh" ? "刚刚" : "now") : index === 1 ? (language === "zh" ? "今天" : "today") : (language === "zh" ? "昨天" : "yesterday")}</small></div>`).join("");
  const bullets = item.bullets.map((bullet) => `<li>${bullet}</li>`).join("");
  workbench.querySelector(".agent-preview-bar").innerHTML = `<div class="agent-preview-brand"><span class="agent-status-dot"></span><span>local-agent workspace</span></div><div class="agent-preview-meta"><span class="agent-preview-note">${labels.preview}</span><div class="demo-progress" role="group" aria-label="${labels.cases}">${cases.map((entry, index) => `<button type="button" data-workbench-index="${index}" aria-label="${entry.template}" aria-pressed="${index === workbenchIndex}"><i class="${index < workbenchIndex ? "is-complete" : index === workbenchIndex ? "is-active" : ""}"></i></button>`).join("")}</div></div>`;
  workbench.querySelector(".agent-preview-body").innerHTML = `<aside class="workbench-sidebar"><div class="workbench-project"><span>${labels.project}</span><strong>${item.project}</strong></div><div class="workbench-list-heading"><span>${label}</span><span>3</span></div><div class="workbench-chat-list">${chats}</div></aside><div class="workbench-conversation"><div class="workbench-conversation-heading"><div><span>${labels.current}</span><strong>${item.chat}</strong></div><span class="agent-progress">3 files</span></div><div class="workbench-mobile-context"><span>${item.project}</span><i></i><span>3 ${label.toLowerCase()}</span></div><div class="conversation-message user-message"><span>${labels.you}</span><p>${item.user}</p></div><div class="conversation-message agent-message"><span>Agent</span><p>${item.response}</p><ul>${bullets}</ul></div><div class="agent-stream"><span class="agent-live-dot"></span><span>${item.status}</span><i></i><i></i><i></i></div></div><aside class="workbench-files"><div class="workbench-files-heading"><span>${labels.files}</span><span class="file-count">12</span></div><div class="file-tree">${fileRows}</div><div class="file-change"><span class="agent-live-dot"></span><div><strong>${item.change}</strong><small>${item.status}</small></div></div></aside>`;
  workbench.querySelector(".agent-preview-footer").innerHTML = `<span class="agent-live-dot"></span><span>${labels.footer}</span>`;
  workbench.querySelectorAll("[data-workbench-index]").forEach((button) => button.addEventListener("click", () => {
    workbenchIndex = Number(button.dataset.workbenchIndex);
    renderWorkbenchCase();
    startWorkbenchCarousel();
  }));
}

function startWorkbenchCarousel() {
  window.clearTimeout(workbenchTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  workbenchTimer = window.setTimeout(() => {
    workbenchIndex = (workbenchIndex + 1) % workbenchCases[language].length;
    renderWorkbenchCase();
    startWorkbenchCarousel();
  }, 5200);
}

function initializeWorkbenchCarousel() {
  const workbench = document.querySelector("[data-workbench-carousel]");
  if (!workbench) return;
  workbench.addEventListener("mouseenter", () => window.clearTimeout(workbenchTimer));
  workbench.addEventListener("mouseleave", startWorkbenchCarousel);
  workbench.addEventListener("focusin", () => window.clearTimeout(workbenchTimer));
  workbench.addEventListener("focusout", startWorkbenchCarousel);
  renderWorkbenchCase();
  startWorkbenchCarousel();
}

function initializeSiteStats() {
  const stats = document.querySelector(".site-stats");
  const counters = [document.querySelector("#busuanzi_site_pv"), document.querySelector("#busuanzi_page_pv")];
  if (!stats || counters.some((counter) => !counter)) return;

  const hasValidCounts = () => counters.every((counter) => /^[\d,.]+(?:[KWE])?$/.test(counter.textContent.trim()));
  const reveal = () => {
    if (!hasValidCounts()) return false;
    stats.hidden = false;
    return true;
  };

  if (reveal()) return;
  const observer = new MutationObserver(() => {
    if (reveal()) observer.disconnect();
  });
  counters.forEach((counter) => observer.observe(counter, { childList: true, characterData: true, subtree: true }));
  window.setTimeout(() => observer.disconnect(), 10000);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToast(copy[language].copied);
}

document.querySelectorAll(".language-toggle").forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang)));
document.querySelectorAll("[data-template]").forEach((button) => button.addEventListener("click", () => { config.template = button.dataset.template; renderPrompt(); }));
document.querySelectorAll(".config-locale").forEach((button) => button.addEventListener("click", () => { config.locale = button.dataset.locale; renderPrompt(); }));
document.querySelectorAll("[data-target]").forEach((button) => button.addEventListener("click", () => {
  config.target = button.dataset.target;
  renderPrompt();
}));
document.querySelectorAll("[data-copy-target]").forEach((button) => button.addEventListener("click", () => copyText(document.querySelector(`#${button.dataset.copyTarget}`).textContent)));
document.querySelectorAll("[data-open-design-demo]").forEach((button) => button.addEventListener("click", () => document.querySelector("#designDemoModal")?.showModal()));
document.querySelectorAll("[data-close-design-demo]").forEach((button) => button.addEventListener("click", () => document.querySelector("#designDemoModal")?.close()));

initializeMobileNavigation();
applyLanguage(language);
initializeWorkbenchCarousel();
initializeSiteStats();
