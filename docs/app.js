const copy = {
  zh: {
    copied: "已复制",
    templates: {
      "project-engineering": "项目工程化",
      "learning-engineering": "系统学习",
      "idea-engineering": "想法探索与验证",
      "web-design-standard": "网页设计规范",
    },
    local: "本地可执行 Agent",
    chat: "Chat / Mobile",
  },
  en: {
    copied: "Copied",
    templates: {
      "project-engineering": "Project engineering",
      "learning-engineering": "Structured learning",
      "idea-engineering": "Idea exploration and validation",
      "web-design-standard": "Web design standard",
    },
    local: "Local executable agent",
    chat: "Chat / Mobile",
  },
};

const templateCategories = {
  workflow: ["project-engineering", "learning-engineering", "idea-engineering"],
  standard: ["web-design-standard"],
};

const commandNames = {
  "project-engineering": "project",
  "learning-engineering": "learning",
  "idea-engineering": "idea",
  "web-design-standard": "web-design-standard",
};

const languageKey = "recowork-language";
let language = (() => {
  try { return localStorage.getItem(languageKey) === "en" ? "en" : "zh"; } catch { return "zh"; }
})();
const config = { template: "project-engineering", target: "local-agent-project", locale: language };

function isChat() { return config.target === "chat-mobile"; }

function localPrompt() {
  const command = `rw add ${commandNames[config.template]} --target local-agent-project --locale ${config.locale} .`;
  if (config.locale === "en") {
    return `You are helping me start a RecoWork workflow.\n\nRepository: https://github.com/recoluan/recowork\nWork type: ${copy.en.templates[config.template]}\nEnvironment: local executable agent\nDestination: current project\n\nWork this way:\n1. Confirm that this environment can run commands. Check Node.js and npm.\n2. If either is unavailable or outdated, explain the blocker and ask for my confirmation before installing a current stable Node.js.\n3. After confirmation, run:\n   ${command}\n4. Preserve any existing root AGENTS.md outside RecoWork's managed block.\n5. Show the generated file tree, explain what was created, and ask for the first work input.\n\nDo not pretend files were created if command execution is unavailable.`;
  }
  return `你正在帮助我开始一项 RecoWork 工作。\n\n仓库地址：https://github.com/recoluan/recowork\n工作类型：${copy.zh.templates[config.template]}\n使用环境：本地可执行 Agent\n目标位置：当前项目\n\n请按以下方式工作：\n1. 先确认当前环境可以执行命令，并检查 Node.js 与 npm。\n2. 如果其中任一项缺失、不可用或版本过旧，说明阻塞原因，并在安装稳定版 Node.js 前征求我的确认。\n3. 获得确认后运行：\n   ${command}\n4. 保留已有根目录 AGENTS.md 中 RecoWork 受管区块之外的内容。\n5. 展示生成后的文件树，说明创建了什么，并询问我的第一项工作输入。\n\n如果无法执行命令，不要模拟已经创建了本地文件。`;
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
    { template: "项目工程化", project: "星港防线", chat: "明确首个可玩版本", chats: ["明确首个可玩版本", "评估引擎与平台取舍", "拆分两周开发计划"], user: "我想在 8 周内完成一个单人可玩的俯视角生存游戏。首个版本要验证核心循环，不做剧情、联机和付费系统。", response: "我会先把目标、范围和约束写入项目简报；首个可玩版本聚焦移动、战斗、敌人刷新和一轮 10 分钟的生存反馈。引擎选择和美术投入仍会影响计划，需要你确认。", bullets: ["更新 项目简报.md：目标、范围与非目标", "新建 待确认问题.md：引擎与美术方案", "确认后再进入需求与方案设计"], files: [["星港防线/", true], ["AGENTS.md"], ["工作空间/", true], ["项目简报.md", false, true], ["待确认问题.md"], ["01-需求与约束/", true], ["02-方案设计/", true], ["03-计划与决策/", true], ["05-评审验证/", true]], change: "项目简报.md 已更新", status: "待确认：引擎与美术方案" },
    { template: "系统学习", project: "LangChain 学习计划", chat: "设计四周学习路线", chats: ["设计四周学习路线", "拆解检索应用练习", "复盘第一周诊断"], user: "我有 Python 基础，想用 4 周完成一个能检索个人笔记的 LangChain 小项目。每天最多投入 45 分钟。", response: "我会先建立学习简报和当前能力基线，再按概念、练习、项目验证组织路线。第一个周期只验证本地检索链路，不提前扩展多模型和部署。", bullets: ["更新 学习简报.md：目标、基础与时间约束", "生成 课程路线.md：四周里程碑与练习", "在 学习进度.md 保留每次验证结果"], files: [["langchain-learning/", true], ["AGENTS.md"], ["学习空间/", true], ["学习简报.md", false, true], ["课程路线.md"], ["学习进度.md"], ["01-课程设计/", true], ["02-课程与练习/", true], ["03-项目实践/", true]], change: "课程路线.md 已更新", status: "下一步：确认每周可用时间" },
    { template: "想法探索与验证", project: "教练预约工具", chat: "收敛首个验证方向", chats: ["收敛首个验证方向", "整理用户访谈假设", "设计一周验证实验"], user: "我想做一个给自由健身教练使用的预约工具，但还不确定用户真正愿意为哪个环节付费。", response: "先不进入产品方案。我会把预约、排课和续费拆成假设，优先验证教练是否愿意为减少反复沟通付费，并记录证据与反例。", bullets: ["更新 想法简报.md：问题、受众与初始假设", "建立 假设与验证：访谈问题和判断阈值", "将未证实判断留在待确认问题中"], files: [["coach-booking/", true], ["AGENTS.md"], ["想法空间/", true], ["想法简报.md", false, true], ["待确认问题.md"], ["01-问题与机会/", true], ["03-方向归纳/", true], ["04-假设与验证/", true], ["05-决策与下一步/", true]], change: "想法简报.md 已更新", status: "验证中：高频沟通是否是痛点" },
    { template: "网页设计规范", project: "咖啡订阅页", chat: "建立响应式设计规范", chats: ["建立响应式设计规范", "确定商品信息层级", "检查移动端状态"], user: "我要做一个独立咖啡品牌订阅页。请先确定视觉方向、移动端信息层级和组件状态，再开始写页面。", response: "我会先生成一份单文件设计规范，明确字体、色彩、栅格、商品卡片和响应式行为。规范会把可用性检查写进交付标准，避免只留下视觉描述。", bullets: ["生成 网页设计规范.md：方向、组件与状态", "在 AGENTS.md 固定页面实现与检查约束", "先确认参考方向，再进入页面开发"], files: [["coffee-subscription/", true], ["AGENTS.md"], ["网页设计规范.md", false, true], ["assets/", true], ["product-images/", true], ["src/", true]], change: "网页设计规范.md 已生成", status: "待确认：视觉参考与品牌语气" },
  ],
  en: [
    { template: "Project engineering", project: "Starport Defense", chat: "Define the first playable", chats: ["Define the first playable", "Evaluate engine and platform", "Split the two-week plan"], user: "I want a solo-playable top-down survival game in eight weeks. The first version must validate the core loop, without story, multiplayer, or monetization.", response: "I will record the goal, scope, and constraints in the project brief. The first playable focuses on movement, combat, enemy spawning, and ten minutes of survival feedback. Engine choice and art investment still need your confirmation.", bullets: ["Update project-brief.md: goal, scope, and non-goals", "Create open-questions.md: engine and art direction", "Move to requirements and solution design after confirmation"], files: [["starport-defense/", true], ["AGENTS.md"], ["workspace/", true], ["project-brief.md", false, true], ["open-questions.md"], ["01-requirements-and-constraints/", true], ["02-solution-design/", true], ["03-plan-and-decisions/", true], ["05-review-and-validation/", true]], change: "project-brief.md updated", status: "Open: engine and art direction" },
    { template: "Structured learning", project: "LangChain learning plan", chat: "Design a four-week route", chats: ["Design a four-week route", "Split the retrieval app practice", "Review the first-week diagnosis"], user: "I know Python basics and want to build a small LangChain project that searches my personal notes in four weeks. I can spend at most 45 minutes a day.", response: "I will establish the learning brief and current baseline first, then organize concepts, practice, and project validation. The first cycle only validates local retrieval, without adding multi-model work or deployment early.", bullets: ["Update learning-brief.md: goal, baseline, and time", "Generate learning-roadmap.md: milestones and practice", "Keep validation results in learning-progress.md"], files: [["langchain-learning/", true], ["AGENTS.md"], ["learning-space/", true], ["learning-brief.md", false, true], ["learning-roadmap.md"], ["learning-progress.md"], ["01-course-design/", true], ["02-lessons-and-practice/", true], ["03-project-practice/", true]], change: "learning-roadmap.md updated", status: "Next: confirm weekly availability" },
    { template: "Idea exploration", project: "Coach booking tool", chat: "Converge on the first direction", chats: ["Converge on the first direction", "Organize interview hypotheses", "Design a one-week experiment"], user: "I want to make a booking tool for independent fitness coaches, but I do not yet know which part users would actually pay for.", response: "We should not jump into a product plan. I will separate booking, scheduling, and renewal into hypotheses, then validate whether coaches pay to reduce repeated communication while recording evidence and counterexamples.", bullets: ["Update idea-brief.md: problem, audience, and hypotheses", "Set up validation: interview questions and thresholds", "Keep unproven claims in open questions"], files: [["coach-booking/", true], ["AGENTS.md"], ["idea-space/", true], ["idea-brief.md", false, true], ["open-questions.md"], ["01-problems-and-opportunities/", true], ["03-direction-synthesis/", true], ["04-hypotheses-and-validation/", true], ["05-decisions-and-next-steps/", true]], change: "idea-brief.md updated", status: "Testing: repeated communication as a pain point" },
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
