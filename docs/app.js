const translations = {
  zh: {
    navPacks: "工作流模板",
    navPlatforms: "输出目标",
    navPrompt: "Prompt 用法",
    navCli: "CLI 用法",
    navStructure: "结构",
    heroEyebrow: "AI 工作流工具包",
    heroTitle: "给你的 AI 装上工作流。",
    heroText:
      "选择一个工作流模板，再选择你正在使用的 AI 工具。RecoWork 会组合两者，并生成你需要的文件。",
    heroPrompt: "Prompt 用法",
    heroPrimary: "CLI 用法",
    heroSecondary: "浏览三个包",
    metricPacks: "首批模板",
    metricPlatforms: "输出目标",
    metricCli: "本地脚手架",
    visualChoose: "选择场景",
    visualGeneral: "日常 AI 使用",
    visualProject: "项目工程化",
    visualLearning: "系统学习",
    visualUse: "选择 target",
    visualPrompt: "Prompt 入口",
    visualOutPrompt: "提示词",
    visualOutRules: "项目规则",
    visualOutKnowledge: "知识库模板",
    visualOutMemory: "续聊记忆",
    stripOneTitle: "不用从零写提示词",
    stripOneText: "直接选择现成的工作流模板，再组合具体输出目标。",
    stripTwoTitle: "不只是一段 prompt",
    stripTwoText: "同时拿到使用步骤、检查清单、记忆卡和项目模板。",
    stripThreeTitle: "换工具也能继续用",
    stripThreeText: "同一个场景可以生成聊天 prompt、项目文件或工作区文档。",
    packsEyebrow: "首批工作流模板",
    packsTitle: "先从三个可复用的 AI 工作模板开始。",
    generalDesc:
      "让普通用户在手机或网页 AI App 中持续推进任务，包含角色设定、任务上下文、续聊记忆、自审和复盘沉淀。",
    generalOne: "适合 ChatGPT Mobile / Claude Mobile / Kimi",
    generalTwo: "让上下文、质量标准和有效方法持续积累",
    projectDesc:
      "为 AI 辅助项目建立 AGENTS.md、项目 skills、knowledge 目录、质量门禁和持续沉淀机制。",
    projectOne: "适合 Codex、Cursor、Claude Code",
    projectTwo: "让项目从第一天就有 AI 工作协议",
    learningDesc:
      "把学习拆成诊断、课程路线、章节练习、项目实践、反馈、复盘和知识沉淀，适合系统掌握一个主题。",
    learningOne: "适合 LangChain、编程、产品、设计等学习项目",
    learningTwo: "逐单元练习、验证和复盘，而不是一次性灌答案",
    platformsEyebrow: "输出目标",
    platformsTitle: "选择这个工作流真正要用在哪里。",
    adapterMobile: "分段复制 prompt、任务卡、续聊记忆卡。",
    adapterClaude: "Project instructions、上下文边界和深度任务说明。",
    adapterKimi: "CLAUDE.md 和项目级 .claude/skills。",
    adapterCodex: "AGENTS.md、skills、knowledge 和项目规则。",
    adapterCursor: "rules.md、项目上下文和代码协作规则。",
    adapterNotion: "知识库页面、任务模板、复盘和团队 SOP。",
    promptEyebrow: "Prompt 用法",
    promptTitle: "让 AI 帮你运行 CLI。",
    promptStepOneTitle: "复制 CLI prompt",
    promptStepOneText: "使用已经填好 RecoWork 仓库地址的 prompt 模板，再选择模板、输出目标、语言和目标位置。",
    promptStepTwoTitle: "发给 AI 助手",
    promptStepTwoText: "可以用 Codex、Cursor，或任何能执行命令或创建文件的 AI 助手。",
    promptStepThreeTitle: "检查生成结果",
    promptStepThreeText: "AI 应该优先运行 npx，然后展示文件树和第一步怎么使用。",
    promptTemplate: `你正在为我初始化一个 RecoWork 工作流模板。

仓库地址：
https://github.com/recoluan/recowork

模板：
project-engineering

Target：
codex-project

语言：
zh

目标位置：
当前项目

请运行：
npx recowork add project-engineering --target codex-project --locale zh .

如果当前环境不能使用 npx，请使用仓库里的 templates/project-engineering/、templates/project-engineering/locales/zh/ 和 targets/codex-project/ 手动创建同等文件。完成后展示文件树，并告诉我第一步应该做什么。`,
    copyPrompt: "复制 prompt",
    cliEyebrow: "CLI 用法",
    cliTitle: "用 RecoWork 初始化工作流模板。",
    cliHowTitle: "怎么用",
    cliHowText: "选择一个工作流模板、运行位置和语言。CLI 会复制模板并套用 target 输出规则。",
    copyCommands: "复制命令",
    structureEyebrow: "开发者视角",
    structureTitle: "模板和 target 可以独立演进。",
    structureYaml: "保存项目、学习、日常 AI 使用等场景模板。",
    structureCore: "保存不同语言版本的工作方法、工作空间和说明文档。",
    structureAdapters: "保存 chat、project、workspace、doc 等 target 的可复用输出规则。",
    structureExamples: "保存真实场景样例，帮助用户快速理解怎么落地。",
    footerText: "Open workflow templates for practical AI work.",
    copied: "已复制",
  },
  en: {
    navPacks: "Packs",
    navPlatforms: "Targets",
    navPrompt: "Prompt Usage",
    navCli: "CLI Usage",
    navStructure: "Structure",
    heroEyebrow: "AI workflow toolkit",
    heroTitle: "Give your AI a workflow.",
    heroText:
      "Pick a workflow template, then pick the AI tool you already use. RecoWork combines the two and creates the files you need.",
    heroPrompt: "Prompt Usage",
    heroPrimary: "CLI usage",
    heroSecondary: "Explore packs",
    metricPacks: "starter templates",
    metricPlatforms: "output targets",
    metricCli: "local scaffold",
    visualChoose: "Pick a scenario",
    visualGeneral: "Daily AI work",
    visualProject: "Project workflow",
    visualLearning: "Structured learning",
    visualUse: "Pick a target",
    visualPrompt: "Prompt",
    visualOutPrompt: "Prompts",
    visualOutRules: "Project rules",
    visualOutKnowledge: "Knowledge templates",
    visualOutMemory: "Memory cards",
    stripOneTitle: "No prompt writing from scratch",
    stripOneText: "Choose a ready workflow template and combine it with a concrete output target.",
    stripTwoTitle: "More than one prompt",
    stripTwoText: "Get steps, checklists, memory cards, and project templates together.",
    stripThreeTitle: "Keep using it when tools change",
    stripThreeText: "The same scenario can generate chat prompts, project files, or workspace documents.",
    packsEyebrow: "Starter workflow templates",
    packsTitle: "Start with three reusable AI work templates.",
    generalDesc:
      "Helps everyday users run tasks reliably in mobile or web AI apps with a role contract, task context, continuation memory, review, and reusable learning.",
    generalOne: "For ChatGPT Mobile / Claude Mobile / Kimi",
    generalTwo: "Keeps context, quality standards, and proven methods reusable",
    projectDesc:
      "Sets up AGENTS.md, project skills, knowledge folders, quality gates, and durable capture for AI-assisted projects.",
    projectOne: "For Codex, Cursor, and Claude Code",
    projectTwo: "Gives a project an AI working protocol from day one",
    learningDesc:
      "Turns learning into diagnosis, roadmaps, lessons, practice, projects, feedback, retrospectives, and durable knowledge capture.",
    learningOne: "For LangChain, coding, product, design, and more",
    learningTwo: "Validates one learning unit at a time instead of dumping answers",
    platformsEyebrow: "Output targets",
    platformsTitle: "Choose where the workflow will actually be used.",
    adapterMobile: "Segmented prompts, task cards, and continuation memory.",
    adapterClaude: "Project instructions, context boundaries, and deep task guidance.",
    adapterKimi: "CLAUDE.md and project-scoped .claude/skills.",
    adapterCodex: "AGENTS.md, skills, knowledge, and project rules.",
    adapterCursor: "rules.md, project context, and coding collaboration rules.",
    adapterNotion: "Knowledge pages, task templates, reviews, and team SOPs.",
    promptEyebrow: "Prompt Init",
    promptTitle: "Ask AI to run the CLI for you.",
    promptStepOneTitle: "Copy the CLI prompt",
    promptStepOneText: "Use the prompt template with the RecoWork repo filled in, then choose the template, output target, locale, and destination.",
    promptStepTwoTitle: "Paste it into an AI assistant",
    promptStepTwoText: "Use Codex, Cursor, or any AI assistant that can run commands or create files.",
    promptStepThreeTitle: "Review the generated package",
    promptStepThreeText: "The AI should run npx first, then show the file tree and first step.",
    promptTemplate: `You are initializing a RecoWork workflow template.

Repository:
https://github.com/recoluan/recowork

Template:
project-engineering

Target:
codex-project

Locale:
en

Destination:
current project

Run:
npx recowork add project-engineering --target codex-project --locale en .

If npx is unavailable, use templates/project-engineering/, templates/project-engineering/locales/en/, and targets/codex-project/ from the repository. Show the file tree and first step.`,
    copyPrompt: "Copy prompt",
    cliEyebrow: "CLI Usage",
    cliTitle: "Initialize workflow templates with RecoWork.",
    cliHowTitle: "How it works",
    cliHowText: "Choose a workflow template, where it will run, and the output language. The CLI copies the template and applies the target output rules.",
    copyCommands: "Copy commands",
    structureEyebrow: "For builders",
    structureTitle: "Templates and targets evolve independently.",
    structureYaml: "Stores scenario templates such as project work, learning, or daily AI use.",
    structureCore: "Stores localized methods, workspaces, and documentation for each supported language.",
    structureAdapters: "Stores reusable output rules for chat, project, workspace, and document targets.",
    structureExamples: "Stores real scenarios so users can understand how to apply the pack.",
    footerText: "Open workflow templates for practical AI work.",
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
