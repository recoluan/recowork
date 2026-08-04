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
  renderPrompt();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
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

applyLanguage(language);
