const translations = {
  zh: {
    navPacks: "工作流包",
    navPlatforms: "支持工具",
    navPrompt: "Prompt 用法",
    navCli: "CLI 用法",
    navStructure: "结构",
    heroEyebrow: "AI 工作流工具包",
    heroTitle: "给你的 AI 装上工作流。",
    heroText:
      "选择一个任务场景，再选择你正在使用的 AI 工具。RecoWork 会给你一套可直接使用的提示词、项目规则、知识库模板和续聊记忆。",
    heroPrompt: "Prompt 用法",
    heroPrimary: "CLI 用法",
    heroSecondary: "浏览三个包",
    metricPacks: "首批工作流包",
    metricPlatforms: "支持的工具",
    metricCli: "本地脚手架",
    visualChoose: "选择场景",
    visualGeneral: "日常 AI 使用",
    visualProject: "项目工程化",
    visualLearning: "系统学习",
    visualUse: "选择工具",
    visualPrompt: "Prompt 入口",
    visualOutPrompt: "提示词",
    visualOutRules: "项目规则",
    visualOutKnowledge: "知识库模板",
    visualOutMemory: "续聊记忆",
    stripOneTitle: "不用从零写提示词",
    stripOneText: "直接选择现成的工作流包，再按你的工具导出。",
    stripTwoTitle: "不只是一段 prompt",
    stripTwoText: "同时拿到使用步骤、检查清单、记忆卡和项目模板。",
    stripThreeTitle: "换工具也能继续用",
    stripThreeText: "同一个场景可以生成 ChatGPT、Codex、Cursor 或飞书版本。",
    packsEyebrow: "首批工作流包",
    packsTitle: "先覆盖三个最常见的 AI 使用场景。",
    generalDesc:
      "让普通用户在手机或网页 AI App 中稳定推进任务，包含初始化 prompt、任务 prompt、续聊记忆卡和自审清单。",
    generalOne: "适合 ChatGPT Mobile / Claude Mobile / Kimi",
    generalTwo: "解决上下文丢失和输出不稳定",
    projectDesc:
      "为 AI 辅助项目建立 AGENTS.md、项目 skills、knowledge 目录、质量门禁和持续沉淀机制。",
    projectOne: "适合 Codex、Cursor、Claude Code",
    projectTwo: "让项目从第一天就有 AI 工作协议",
    learningDesc:
      "把学习拆成路线图、章节、练习、作业反馈、复盘和进度追踪，适合系统学习一个主题。",
    learningOne: "适合 LangChain、编程、产品、设计等学习项目",
    learningTwo: "让 AI 按章节教学，而不是一次性灌答案",
    platformsEyebrow: "支持的工具",
    platformsTitle: "你用什么工具，就生成对应版本。",
    adapterMobile: "分段复制 prompt、任务卡、续聊记忆卡。",
    adapterClaude: "Project instructions、上下文边界和深度任务说明。",
    adapterKimi: "中文移动端 prompt、摘要、步骤和可复制模板。",
    adapterCodex: "AGENTS.md、skills、knowledge 和项目规则。",
    adapterCursor: "rules.md、项目上下文和代码协作规则。",
    adapterNotion: "知识库页面、任务模板、复盘和团队 SOP。",
    promptEyebrow: "Prompt 用法",
    promptTitle: "直接让 AI 帮你初始化工作流包。",
    promptStepOneTitle: "复制初始化 prompt",
    promptStepOneText: "使用已经填好 RecoWork 仓库地址的 prompt 模板，再选择工作流包、目标平台和目标位置。",
    promptStepTwoTitle: "发给 AI 助手",
    promptStepTwoText: "可以用 Codex、ChatGPT、Claude、Cursor，或任何能访问仓库并创建文件/结构化内容的 AI。",
    promptStepThreeTitle: "检查生成结果",
    promptStepThreeText: "AI 应该从仓库读取包内容，展示文件树、生成文件，以及第一步怎么使用。",
    promptTemplate: `你是一个 RecoWork 工作流包初始化助手。

来源仓库：
https://github.com/recoluan/recowork

工作流包：
project-engineering

目标平台：
codex

目标位置：
当前项目

请读取仓库，找到 packages/project-engineering，根据 Codex 平台生成这个包需要的文件，包含 README，展示文件树，并告诉我第一步应该做什么。`,
    copyPrompt: "复制 prompt",
    cliEyebrow: "CLI 用法",
    cliTitle: "用 RecoWork 初始化工作流包。",
    cliHowTitle: "怎么用",
    cliHowText: "选择一个工作流包，再选择目标工具。CLI 会生成一套可直接复制或放进项目里的文件。",
    copyCommands: "复制命令",
    structureEyebrow: "开发者视角",
    structureTitle: "如果你要扩展包，它的内部结构也很简单。",
    structureYaml: "描述这个包适合谁、能解决什么问题、支持哪些工具。",
    structureCore: "保存这个场景的通用方法，比如流程、原则和检查清单。",
    structureAdapters: "保存不同工具的使用版本，比如 ChatGPT、Codex、Cursor 和飞书。",
    structureExamples: "保存真实场景样例，帮助用户快速理解怎么落地。",
    footerText: "Open workflow packs for practical AI work.",
    copied: "已复制",
  },
  en: {
    navPacks: "Packs",
    navPlatforms: "Tools",
    navPrompt: "Prompt Usage",
    navCli: "CLI Usage",
    navStructure: "Structure",
    heroEyebrow: "AI workflow toolkit",
    heroTitle: "Give your AI a workflow.",
    heroText:
      "Pick a work scenario, then pick the AI tool you already use. RecoWork gives you ready-to-use prompts, project rules, knowledge templates, and continuation memory.",
    heroPrompt: "Prompt Usage",
    heroPrimary: "CLI usage",
    heroSecondary: "Explore packs",
    metricPacks: "starter workflow packs",
    metricPlatforms: "supported tools",
    metricCli: "local scaffold",
    visualChoose: "Pick a scenario",
    visualGeneral: "Daily AI work",
    visualProject: "Project workflow",
    visualLearning: "Structured learning",
    visualUse: "Pick a tool",
    visualPrompt: "Prompt",
    visualOutPrompt: "Prompts",
    visualOutRules: "Project rules",
    visualOutKnowledge: "Knowledge templates",
    visualOutMemory: "Memory cards",
    stripOneTitle: "No prompt writing from scratch",
    stripOneText: "Choose a ready workflow pack and export it for your tool.",
    stripTwoTitle: "More than one prompt",
    stripTwoText: "Get steps, checklists, memory cards, and project templates together.",
    stripThreeTitle: "Keep using it when tools change",
    stripThreeText: "The same scenario can generate ChatGPT, Codex, Cursor, or Feishu versions.",
    packsEyebrow: "Starter workflow packs",
    packsTitle: "Start with the three most common AI work scenarios.",
    generalDesc:
      "Helps everyday users run tasks reliably in mobile or web AI apps with init prompts, task prompts, memory cards, and review checklists.",
    generalOne: "For ChatGPT Mobile / Claude Mobile / Kimi",
    generalTwo: "Reduces context loss and inconsistent outputs",
    projectDesc:
      "Sets up AGENTS.md, project skills, knowledge folders, quality gates, and durable capture for AI-assisted projects.",
    projectOne: "For Codex, Cursor, and Claude Code",
    projectTwo: "Gives a project an AI working protocol from day one",
    learningDesc:
      "Turns learning into roadmaps, chapters, exercises, homework feedback, reviews, and progress tracking.",
    learningOne: "For LangChain, coding, product, design, and more",
    learningTwo: "Teaches chapter by chapter instead of dumping answers",
    platformsEyebrow: "Supported tools",
    platformsTitle: "Use your current tool. RecoWork generates the right version.",
    adapterMobile: "Segmented prompts, task cards, and continuation memory.",
    adapterClaude: "Project instructions, context boundaries, and deep task guidance.",
    adapterKimi: "Chinese mobile prompts, summaries, steps, and copyable templates.",
    adapterCodex: "AGENTS.md, skills, knowledge, and project rules.",
    adapterCursor: "rules.md, project context, and coding collaboration rules.",
    adapterNotion: "Knowledge pages, task templates, reviews, and team SOPs.",
    promptEyebrow: "Prompt Init",
    promptTitle: "Ask AI to initialize the package for you.",
    promptStepOneTitle: "Copy the init prompt",
    promptStepOneText: "Use the prompt template with the RecoWork repo already filled in, then choose the package, platform, and target location.",
    promptStepTwoTitle: "Paste it into an AI assistant",
    promptStepTwoText: "Use Codex, ChatGPT, Claude, Cursor, or any AI that can access the repo and create files or structured content.",
    promptStepThreeTitle: "Review the generated package",
    promptStepThreeText: "The AI should read the package from the repo, show the file tree, generated files, and the first step to use it.",
    promptTemplate: `You are a RecoWork package initializer.

Source repository:
https://github.com/recoluan/recowork

Package:
project-engineering

Target platform:
codex

Target location:
current project

Read the repository, locate packages/project-engineering, generate the files this package needs for Codex, include a README, show the file tree, and tell me the first step.`,
    copyPrompt: "Copy prompt",
    cliEyebrow: "CLI Usage",
    cliTitle: "Initialize workflow packs with RecoWork.",
    cliHowTitle: "How it works",
    cliHowText: "Choose a workflow pack, then choose your target tool. The CLI creates files you can copy into chat or drop into a project.",
    copyCommands: "Copy commands",
    structureEyebrow: "For builders",
    structureTitle: "If you want to extend packs, the internal structure is simple.",
    structureYaml: "Describes who the pack is for, what problem it solves, and which tools it supports.",
    structureCore: "Stores the reusable method for the scenario, such as steps, principles, and checklists.",
    structureAdapters: "Stores tool-specific versions for ChatGPT, Codex, Cursor, Feishu, and more.",
    structureExamples: "Stores real scenarios so users can understand how to apply the pack.",
    footerText: "Open workflow packs for practical AI work.",
    copied: "Copied",
  },
};

let currentLanguage = "en";

function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = translations[language][key] || node.textContent;
  });

  const promptTemplate = document.querySelector("#promptPaths");
  if (promptTemplate) {
    promptTemplate.textContent = translations[language].promptTemplate;
  }

  document.querySelectorAll(".language-toggle").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === language);
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(translations[currentLanguage].copied);
}

document.querySelectorAll(".language-toggle").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy));
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.copyTarget}`);
    copyText(target.textContent);
  });
});

applyLanguage(currentLanguage);
