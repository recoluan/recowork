const translations = {
  zh: {
    pageTitle: "RecoWork · AI 工作流模板",
    pageDescription: "RecoWork 将 AI 工作流模板初始化为聊天 / 手机端或电脑端 AI 助手的工程化工作流。",
    navPacks: "工作流模板",
    navEssence: "模板精髓",
    navPlatforms: "使用位置",
    navStructure: "结构",
    heroEyebrow: "AI 工作 Harness",
    heroTitle: "让 AI 用工程化的方式聪明地工作。",
    heroText:
      "RecoWork 是 AI 工作 harness：把上下文、规则和检查机制沉淀成模板，再为聊天 / 手机端或电脑端 AI 助手生成可持续的工作流。",
    heroInitialize: "开始初始化",
    heroPrimary: "阅读使用说明",
    heroSecondary: "查看案例",
    metricPacks: "首批模板",
    metricPlatforms: "使用位置",
    metricCli: "本地脚手架",
    visualCommand: "rw add project --target local-agent-project --locale zh .",
    visualChoose: "选择场景",
    visualGeneral: "日常 AI 使用",
    visualProject: "项目工程化",
    visualLearning: "系统学习",
    visualUse: "选择使用位置",
    visualPrompt: "初始化",
    visualOutPrompt: "提示词",
    visualOutRules: "项目规则",
    visualOutKnowledge: "工作空间记录",
    visualOutMemory: "续接摘要",
    copyCommand: "复制",
    configTemplateLabel: "模板或规范",
    configTargetLabel: "使用位置",
    configLocaleLabel: "输出语言",
    configTemplateGeneral: "日常任务协作",
    configTemplateProject: "项目工程化",
    configTemplateLearning: "系统学习",
    configTemplateIdea: "想法探索与验证",
    configTemplateWebDesign: "网页设计规范",
    configEnvironmentLabel: "运行环境",
    environmentAgent: "本地智能体",
    environmentChat: "纯聊天 / 手机端",
    cliCommands: `npx recowork list
npx recowork targets
npx recowork add project --target local-agent-project --locale zh .
npx recowork add learning --target local-agent-project --locale zh ./my-learning-workflow
npx recowork add idea --target chat-mobile --locale zh ./idea-chat-kit

rw list
rw targets
rw add project --target local-agent-project --locale zh .`,
    stripOneTitle: "不用从零写提示词",
    stripOneText: "直接选择现成工作流模板和两种使用环境之一。",
    stripTwoTitle: "不只是一段 prompt",
    stripTwoText: "同时拿到使用步骤、检查清单、记忆卡和项目模板。",
    stripThreeTitle: "换工具也能继续用",
    stripThreeText: "同一套方法可在聊天入口与本地工作空间之间迁移。",
    packsEyebrow: "内置工作流模板",
    packsTitle: "从五类可复用的 AI 工作模板开始。",
    essenceEyebrow: "模板精髓",
    essenceTitle: "模板交付的是一套工作系统，不是一段 prompt。",
    templateGeneral: "日常 AI 使用",
    templateProject: "项目工程化",
    templateLearning: "系统学习",
    essenceIncluded: "初始化后包含",
    generalDesc:
      "让普通用户在手机或网页 AI App 中启动任务，包含对话内澄清、确认、自审和可手动保存的续接摘要。长期沉淀应迁移到本地 Agent。",
    generalOne: "适合任意网页、App 或手机聊天",
    generalTwo: "让上下文、质量标准和有效方法持续积累",
    projectDesc:
      "先澄清并确认项目约定，再建立 AGENTS.md、文档与产物保鲜规范、质量门禁和持续沉淀机制。",
    projectOne: "适合具备命令执行能力的本地 Agent",
    projectTwo: "让项目从第一天就有 AI 工作协议",
    learningDesc:
      "先诊断并确认学习约定，再推进课程路线、章节练习、项目实践、反馈、复盘和持续保鲜的知识沉淀。",
    learningOne: "适合 LangChain、编程、产品、设计等学习项目",
    learningTwo: "逐单元练习、验证和复盘，而不是一次性灌答案",
    platformsEyebrow: "使用位置",
    platformsTitle: "选择轻量对话入口或完整本地工作流。",
    initializeEyebrow: "开始使用",
    initializeTitle: "选择配置，再选择你习惯的初始化方式。",
    initMethodAi: "让 AI 帮你初始化",
    initMethodCli: "命令行初始化",
    promptStepOneTitle: "复制初始化 Prompt",
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
local-agent-project

语言：
zh

目标位置：
当前项目

请运行：
npx recowork add project-engineering --target local-agent-project --locale zh .

如果当前环境不能使用 npx，请说明阻塞原因并先征求确认。不要在纯聊天环境中模拟创建本地文件。完成后展示文件树，并告诉我第一步应该做什么。`,
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
    footerText: "面向真实 AI 工作的开源工作流模板。",
    copied: "已复制",
  },
  en: {
    pageTitle: "RecoWork · AI Workflow Templates",
    pageDescription: "RecoWork initializes AI workflow templates for Chat / mobile or a desktop AI assistant.",
    navPacks: "Packs",
    navEssence: "What you get",
    navPlatforms: "Targets",
    navStructure: "Structure",
    heroEyebrow: "AI work harness",
    heroTitle: "Let AI work smarter through engineered workflows.",
    heroText:
      "RecoWork is an AI work harness: it packages context, rules, and checks into templates, then generates durable workflows for Chat / mobile or a desktop AI assistant.",
    heroInitialize: "Initialize",
    heroPrimary: "Read the guide",
    heroSecondary: "View cases",
    metricPacks: "starter templates",
    metricPlatforms: "output targets",
    metricCli: "local scaffold",
    visualCommand: "rw add project --target local-agent-project --locale en .",
    visualChoose: "Pick a scenario",
    visualGeneral: "Daily AI work",
    visualProject: "Project workflow",
    visualLearning: "Structured learning",
    visualUse: "Pick a target",
    visualPrompt: "Initialize",
    visualOutPrompt: "Prompts",
    visualOutRules: "Project rules",
    visualOutKnowledge: "Workspace records",
    visualOutMemory: "Continuation summaries",
    copyCommand: "Copy",
    configTemplateLabel: "Template or standard",
    configTargetLabel: "Usage target",
    configLocaleLabel: "Output language",
    configTemplateGeneral: "Daily task workflow",
    configTemplateProject: "Project engineering",
    configTemplateLearning: "Structured learning",
    configTemplateIdea: "Idea exploration",
    configTemplateWebDesign: "Web design standard",
    configEnvironmentLabel: "Runtime capability",
    environmentAgent: "Local agent",
    environmentChat: "Chat / mobile",
    cliCommands: `npx recowork list
npx recowork targets
npx recowork add project --target local-agent-project --locale en .
npx recowork add learning --target local-agent-project --locale en ./my-learning-workflow
npx recowork add idea --target chat-mobile --locale en ./idea-chat-kit

rw list
rw targets
rw add project --target local-agent-project --locale en .`,
    stripOneTitle: "No prompt writing from scratch",
    stripOneText: "Choose a ready workflow template and one of two delivery environments.",
    stripTwoTitle: "More than one prompt",
    stripTwoText: "Get steps, checklists, memory cards, and project templates together.",
    stripThreeTitle: "Keep using it when tools change",
    stripThreeText: "Move the same method between a chat entry point and a local workspace.",
    packsEyebrow: "Built-in workflow templates",
    packsTitle: "Start with five reusable AI work templates.",
    essenceEyebrow: "Template essence",
    essenceTitle: "A template gives AI a working system, not one prompt.",
    templateGeneral: "Daily AI work",
    templateProject: "Project engineering",
    templateLearning: "Structured learning",
    essenceIncluded: "Included after initialization",
    generalDesc:
      "Helps everyday users start tasks in mobile or web AI apps with in-chat clarification, confirmation, self-review, and a manually saved continuation summary. Move durable work to a local agent.",
    generalOne: "For any web, app, or mobile chat",
    generalTwo: "Keeps context, quality standards, and proven methods reusable",
    projectDesc:
      "Confirms a project agreement before setting up AGENTS.md, document and artifact freshness standards, quality gates, and durable capture for AI-assisted projects.",
    projectOne: "For command-capable local agents",
    projectTwo: "Gives a project an AI working protocol from day one",
    learningDesc:
      "Starts with diagnosis and a confirmed learning agreement, then advances through roadmaps, lessons, practice, projects, feedback, retrospectives, and fresh durable knowledge capture.",
    learningOne: "For LangChain, coding, product, design, and more",
    learningTwo: "Validates one learning unit at a time instead of dumping answers",
    platformsEyebrow: "Output targets",
    platformsTitle: "Choose a lightweight chat entry point or complete local workflow.",
    initializeEyebrow: "Get started",
    initializeTitle: "Choose a configuration, then choose how to initialize it.",
    initMethodAi: "Let AI initialize it",
    initMethodCli: "Initialize with CLI",
    promptStepOneTitle: "Copy the initialization prompt",
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
local-agent-project

Locale:
en

Destination:
current project

Run:
npx recowork add project-engineering --target local-agent-project --locale en .

If npx is unavailable, explain the blocker and request confirmation. Do not simulate local file creation in a pure chat environment. Show the file tree and first step.`,
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

const templateStructures = {
  zh: {
    general: {
      eyebrow: "日常 AI 使用",
      title: "让每次对话都能继续，而不是从头开始。",
      description: "用对话内澄清、自审和续接摘要，把手机或网页中的一次性对话变成可持续推进的轻量任务流程；需要工作空间时迁移到本地 Agent。",
      outcomes: [
        "AI 工作角色、流程与自审清单",
        "任务简报与待确认问题",
        "任务准备、产出、过程留痕与复盘沉淀",
      ],
      tree: `工作方法/
  角色设定.md
  工作流程.md
  检查清单.md
  记忆卡模板.md
工作空间/
  任务简报.md
  待确认问题.md
  01-任务准备/
  02-任务产出/
  03-过程留痕/
  04-复盘与沉淀/`,
    },
    project: {
      eyebrow: "项目工程化",
      title: "把 AI 协作变成可追溯的项目系统。",
      description: "角色协议与文档规范约束 AI 的工作方式；它先从索引按需读取资料，再将需求、方案、决策、过程和验收沉淀为可追溯的项目事实。",
      outcomes: [
        "AI 角色设定、文档规范与质量门禁",
        "项目简报与待确认问题",
        "需求、方案、计划、留痕和验证空间",
      ],
      tree: `工作方法/
  角色设定.md
  文档规范.md
  工作流程.md
  质量门禁.md
工作空间/
  项目简报.md
  待确认问题.md
  01-需求与约束/
  02-方案设计/
  03-计划与决策/
  04-过程留痕/
  05-评审验证/`,
    },
    learning: {
      eyebrow: "系统学习",
      title: "把“想学”推进成可以验证的真实能力。",
      description: "从学习者基础和目标出发，逐单元完成讲解、练习、项目实践与复盘，避免一次性灌输课程内容。",
      outcomes: [
        "学习导师角色、课程单元与评估规则",
        "学习简报、课程路线与进度追踪",
        "课程练习、项目实践、问题复盘与知识沉淀",
      ],
      tree: `工作方法/
  角色设定.md
  学习方法.md
  课程单元模板.md
  评估与复盘.md
学习空间/
  学习简报.md
  课程路线.md
  学习进度.md
  01-课程设计/
  02-课程与练习/
  03-项目实践/
  04-问题与复盘/
  05-知识沉淀/`,
    },
    idea: {
      eyebrow: "想法探索与验证",
      title: "让脑暴留下方向，而不是留下更多噪音。",
      description: "先发散候选方向，再用事实、假设和小验证收敛；被排除的想法保留理由，但不干扰当前结论。",
      outcomes: ["探索角色、发散收敛和验证方法", "想法简报与待确认问题", "方向、验证、决策和下一步空间"],
      tree: `工作方法/
  角色设定.md
  发散与收敛方法.md
  假设与验证规范.md
  产物保鲜规范.md
想法空间/
  想法简报.md
  待确认问题.md
  01-问题与机会/
  02-脑暴留痕/
  03-方向归纳/
  04-假设与验证/
  05-决策与下一步/`,
    },
    webDesign: {
      eyebrow: "网页设计规范",
      title: "让 AI 交付可用网页，而不只是好看的静态截图。",
      description: "一份可跨项目复用的产品型网页规范：先处理层级与任务，再约束 token、桌面与移动端、组件状态和可访问性。已有品牌规范优先。",
      outcomes: ["一份可复用的网页设计规范", "PC / 移动端响应式策略", "组件状态与可访问性自检清单"],
      tree: `AGENTS.md
网页设计规范.md
rw-manifest.json`,
    },
  },
  en: {
    general: {
      eyebrow: "Daily AI work",
      title: "Continue each conversation instead of starting over.",
      description: "In-chat clarification, self-review, and a continuation summary turn one-off mobile or web chats into a lightweight task flow. Move to a local agent when a workspace is needed.",
      outcomes: [
        "AI role, workflow, and self-review checklist",
        "Task brief and open questions",
        "Task setup, output, thinking traces, and reusable learning",
      ],
      tree: `methods/
  role-contract.md
  workflow.md
  quality-checklist.md
  continuation-memory-template.md
workspace/
  task-brief.md
  open-questions.md
  01-task-setup/
  02-task-output/
  03-thinking-traces/
  04-review-and-reuse/`,
    },
    project: {
      eyebrow: "Project engineering",
      title: "Turn AI collaboration into a traceable project system.",
      description: "A role contract and document standard constrain how AI works. The agent navigates indexes and reads focused documents on demand while the workspace preserves traceable project facts for the next collaboration.",
      outcomes: [
        "AI role contract, document standard, and quality gates",
        "Project brief and open questions",
        "Spaces for requirements, solutions, plans, traces, and validation",
      ],
      tree: `methods/
  role-contract.md
  document-standard.md
  workflow.md
  quality-gates.md
workspace/
  project-brief.md
  open-questions.md
  01-requirements-and-constraints/
  02-solution-design/
  03-plan-and-decisions/
  04-thinking-traces/
  05-review-and-validation/`,
    },
    learning: {
      eyebrow: "Structured learning",
      title: "Turn “I want to learn” into demonstrable capability.",
      description: "Start from the learner's foundation and progress through lessons, practice, projects, and retrospectives instead of unloading a complete course at once.",
      outcomes: [
        "Learning mentor role, lesson units, and assessment rules",
        "Learner brief, course roadmap, and progress tracker",
        "Lessons, project practice, questions, retrospectives, and knowledge capture",
      ],
      tree: `methods/
  role-contract.md
  learning-method.md
  lesson-template.md
  assessment-and-retrospective.md
learning-workspace/
  learner-brief.md
  course-roadmap.md
  learning-progress.md
  01-course-design/
  02-lessons-and-practice/
  03-project-practice/
  04-questions-and-retrospectives/
  05-knowledge-capture/`,
    },
    idea: {
      eyebrow: "Idea exploration",
      title: "Let brainstorming produce direction, not more noise.",
      description: "Explore candidate directions, then converge with facts, assumptions, and small validations. Keep rejected ideas for context without letting them obscure the current conclusion.",
      outcomes: ["Exploration role, divergence, convergence, and validation", "Idea brief and open questions", "Spaces for directions, validation, decisions, and next steps"],
      tree: `methods/
  role-contract.md
  divergence-and-convergence.md
  hypothesis-and-evidence-standard.md
  artifact-freshness-standard.md
idea-space/
  idea-brief.md
  open-questions.md
  01-problem-and-opportunity/
  02-brainstorming-traces/
  03-direction-synthesis/
  04-hypotheses-and-validation/
  05-decisions-and-next-steps/`,
    },
    webDesign: {
      eyebrow: "Web design standard",
      title: "Make AI deliver usable web pages, not only attractive screenshots.",
      description: "A reusable product-web standard that establishes hierarchy and tasks before constraining tokens, desktop and mobile behavior, component states, and accessibility. Existing brand guidance wins.",
      outcomes: ["One reusable web design standard", "Desktop and mobile responsive strategy", "Component-state and accessibility checklist"],
      tree: `AGENTS.md
web-design-standard.md
rw-manifest.json`,
    },
  },
};

let currentLanguage = "zh";
let currentTemplate = "project";
let currentInitMethod = "ai";
const generatorConfig = {
  template: "project-engineering",
  target: "local-agent-project",
  locale: "zh",
};

const templateAliases = {
  "general-ai-workflow": "general",
  "project-engineering": "project",
  "learning-engineering": "learning",
  "idea-engineering": "idea",
  "web-design-standard": "web-design",
};

const chatTargets = new Set(["chat-mobile"]);

const chatBootstrapDetails = {
  zh: {
    "general-ai-workflow": {
      role: "严谨的 AI 工作顾问",
      focus: "先澄清真实目标、约束和完成标准；区分事实、推断和假设；重要任务结束后留下续聊记忆。",
    },
    "project-engineering": {
      role: "资深项目负责人和技术规划顾问",
      focus: "先澄清目标、范围、约束和风险；重要方向变化前先确认；记录关键决策、问题和验收依据。",
    },
    "learning-engineering": {
      role: "资深课程设计师、领域导师和实践教练",
      focus: "先诊断基础、目标和时间约束；一次只推进一个可验证单元；通过练习、反馈和复盘建立真实能力。",
    },
    "idea-engineering": {
      role: "严谨的想法探索引导者、产品策略顾问和验证教练",
      focus: "先澄清问题、用户、约束和成功信号；充分发散多个方向；用事实、假设和验证收敛。",
    },
    "web-design-standard": {
      role: "资深产品网页设计师和前端实现评审者",
      focus: "优先遵循已有品牌规范；同时完成信息层级、桌面与移动端、真实组件状态和可访问性检查。",
    },
  },
  en: {
    "general-ai-workflow": {
      role: "a rigorous AI work advisor",
      focus: "Clarify goals, constraints, and completion criteria; separate facts, inferences, and assumptions; leave continuation memory after meaningful work.",
    },
    "project-engineering": {
      role: "a senior project lead and technical planning advisor",
      focus: "Clarify goals, scope, constraints, and risks; confirm material direction changes; record key decisions, questions, and acceptance evidence.",
    },
    "learning-engineering": {
      role: "a senior curriculum designer, subject mentor, and practice coach",
      focus: "Diagnose foundation, goals, and time constraints; advance one validated unit at a time; build real capability through practice, feedback, and retrospectives.",
    },
    "idea-engineering": {
      role: "a rigorous idea exploration facilitator, product strategy advisor, and validation coach",
      focus: "Clarify the question, user, constraints, and success signals; explore multiple directions; converge through facts, assumptions, and validation.",
    },
    "web-design-standard": {
      role: "a senior product web designer and front-end implementation reviewer",
      focus: "Prioritize existing brand guidance while checking hierarchy, desktop and mobile behavior, real component states, and accessibility.",
    },
  },
};

function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  if (document.body.dataset.titleZh && document.body.dataset.titleEn) {
    document.title = language === "zh" ? document.body.dataset.titleZh : document.body.dataset.titleEn;
    const description = document.querySelector('meta[name="description"]');
    if (description && document.body.dataset.descriptionZh && document.body.dataset.descriptionEn) {
      description.content = language === "zh"
        ? document.body.dataset.descriptionZh
        : document.body.dataset.descriptionEn;
    }
  } else if (document.body.dataset.page === "home") {
    document.title = translations[language].pageTitle;
    document.querySelector('meta[name="description"]').content = translations[language].pageDescription;
  }

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = translations[language][key] || node.textContent;
  });

  document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
    node.textContent = node.dataset[language];
  });

  if (document.querySelector("#templateStructureTree")) {
    renderTemplateStructure(currentTemplate);
  }

  if (document.querySelector("#promptPaths")) {
    renderGeneratorOutputs();
  }

  const usageCommands = document.querySelector("#usageCommands");
  if (usageCommands) {
    usageCommands.textContent = language === "zh"
      ? `npx recowork list
npx recowork targets
npx recowork add project --target local-agent-project --locale zh .
npx recowork add learning --target local-agent-project --locale zh ./my-learning-workflow`
      : `npx recowork list
npx recowork targets
npx recowork add project --target local-agent-project --locale en .
npx recowork add learning --target local-agent-project --locale en ./my-learning-workflow`;
  }

  const cliReference = document.querySelector("#cliReference");
  if (cliReference) {
    cliReference.textContent = language === "zh"
      ? `# 查看模板
npx recowork list

# 查看 targets
npx recowork targets

# 初始化项目工作流到当前目录
npx recowork add project --target local-agent-project --locale zh .

# 初始化学习工作流到电脑端 AI 助手
npx recowork add learning --target local-agent-project --locale zh ./my-learning-workflow

# 只读检查已有工作流的更新建议
npx recowork upgrade --check .

# 安全更新未改动的工作方法和 target 文件
npx recowork upgrade --apply .

# 仅补齐新版新增且当前缺失的工作空间文件
npx recowork upgrade --apply --scope workspace --add-missing .`
      : `# List templates
npx recowork list

# List targets
npx recowork targets

# Initialize a project workflow in the current directory
npx recowork add project --target local-agent-project --locale en .

# Initialize a learning workflow for a desktop AI assistant
npx recowork add learning --target local-agent-project --locale en ./my-learning-workflow

# Read-only check for workflow update suggestions
npx recowork upgrade --check .

# Safely update unchanged methods and target files
npx recowork upgrade --apply .

# Add only newly introduced, currently missing workspace files
npx recowork upgrade --apply --scope workspace --add-missing .`;
  }

  document.querySelectorAll(".language-toggle").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === language);
  });
}

function getGeneratorCommand(binary) {
  const template = templateAliases[generatorConfig.template];
  return `${binary} add ${template} --target ${generatorConfig.target} --locale ${generatorConfig.locale} .`;
}

function getGeneratorPrompt() {
  const command = getGeneratorCommand("npx recowork");
  const promptLocale = generatorConfig.locale;

  if (chatTargets.has(generatorConfig.target)) {
    if (generatorConfig.template === "web-design-standard") {
      if (promptLocale === "en") {
        return `You are a senior product web designer and front-end implementation reviewer. Design or improve a web page from this input:

This is a pure chat environment without a terminal or local file system. Do not ask me to install Node.js, run commands, clone repositories, or create local project files.

- Product or page: [describe]
- Audience and primary task: [describe]
- Required content and actions: [describe]
- Existing brand, design system, or reference: [describe or write none]
- Technical constraints: [describe]

Existing brand guidance, component libraries, and explicit visual requirements override this default. State material conflicts and ask only necessary clarification questions.

Default direction: restrained, modern, trustworthy product web for SaaS, tools, small product sites, and lightweight operational dashboards. Put content and hierarchy first; use purposeful whitespace, low decoration, limited accents, real component states, and accessibility.

Tokens: page #FFFFFF, surface #F8FAFC, text #0F172A, muted #475569, border #E2E8F0, primary #2563EB, primary hover #1D4ED8. Use Inter/system sans, 16px/1.5 body text, a 4/8/12/16/24/32/48/64px spacing scale, max 1200px container, 6px controls, and 8px cards/dialogs.

Cover desktop and mobile: below 768px prefer one column, collapse constrained layouts, make mobile navigation closable, and do not rely on hover-only information. Implement semantic HTML and real navigation, button, form, card, list/table, empty, loading, success, error, disabled, hover, and focus states where relevant.

Do not use broad gradients, purposeless glassmorphism, excessive rounding, nested cards, marketing buzzwords, fake metrics, desktop-only layouts, or screenshot-only UI.

First provide a concise plan for hierarchy, responsive behavior, states, and validation. Before delivery, report brand handling, desktop/mobile checks, interaction states, keyboard/focus/semantic/contrast/alt-text checks, and available build/test/visual verification.

End meaningful work with: current page goal, confirmed visual decisions, implemented work and verification, open questions or risks, and next step. I must save and paste that summary into the next chat; it is not persisted automatically. When the work becomes complex, long-running, collaborative, knowledge-heavy, or auditable, prepare a migration package with a project brief, current decisions, open questions, and next step for a command-capable local agent.`;
      }

      return `你是一名资深产品网页设计师和前端实现评审者。请根据下面输入设计或改造网页：

当前是纯聊天环境，没有终端和本地文件系统。不要要求我安装 Node.js、执行命令、克隆仓库或创建本地项目文件。

- 产品或页面：［填写］
- 目标用户与主任务：［填写］
- 必要内容与操作：［填写］
- 既有品牌、设计系统或参考：［填写；没有则写无］
- 技术约束：［填写］

用户已有品牌规范、组件库和明确视觉要求优先于本默认规范。存在实质冲突时应说明，并只提出必要的澄清问题。

默认采用克制、现代、可信赖的产品型网页风格，适用于 SaaS、工具型产品、个人或小团队官网与轻量运营后台：内容与层级优先、留白克制、低装饰、有限强调色、真实组件状态、可访问性优先。

Token：页面 #FFFFFF，次级背景 #F8FAFC，主文字 #0F172A，次级文字 #475569，边框 #E2E8F0，主色 #2563EB，悬停 #1D4ED8。使用 Inter/系统无衬线字体，正文 16px/1.5，间距 4/8/12/16/24/32/48/64px，容器最大 1200px，控件圆角 6px，卡片/弹层 8px。

同时覆盖桌面与移动端：768px 以下优先单列，空间不足时收起并列布局，移动导航必须可关闭，不要依赖仅悬停可见的信息。使用语义化 HTML，并在需要时实现真实的导航、按钮、表单、卡片、列表/表格、空、加载、成功、错误、禁用、悬停和焦点状态。

不要使用大面积渐变、无意义玻璃拟态、过度圆角、卡片嵌卡片、营销词堆砌、虚假指标、仅桌面可用布局或只适合截图的静态界面。

先给出信息层级、响应式处理、组件状态和验证方式的简短计划。交付前报告品牌优先级处理、桌面/移动端、交互状态、键盘/焦点/语义/对比度/替代文本，以及可执行的构建、测试或视觉验证。

每次重要工作结束时附上：当前页面目标、已确认视觉决策、已实现内容与验证结果、待确认问题或风险、下一步。该摘要需要由我保存并粘贴到下一轮对话，系统不会自动持久化。当任务变复杂、需要长期推进、多人协作、知识沉淀或可审计过程时，生成包含项目简报、当前决策、未决问题和下一步的迁移包，供我粘贴到具备命令执行能力的本地 Agent。`;
    }

    const details = chatBootstrapDetails[promptLocale][generatorConfig.template];
    if (promptLocale === "en") {
      return `You are ${details.role}. This is a pure chat environment without a terminal or local file system.

Do not ask me to install Node.js, run commands, clone repositories, or create local project files.

Working protocol:
- ${details.focus}
- Do not present guesses as facts. State uncertainty and ask the smallest necessary clarifying questions.
- Before a meaningful answer, give a short plan when the task is complex. Review the answer before presenting it as complete.
- At the end of each meaningful response, include a short continuation summary with: confirmed goal, completed work, key conclusions, open questions, and next step. I must save and paste it into the next chat; it is not persisted automatically.
- When the work becomes complex, long-running, collaborative, knowledge-heavy, or auditable, prepare a migration package with a project brief, current decisions, open questions, and next step for a command-capable local agent.

Start now by asking the most important questions needed to begin my ${generatorConfig.template} workflow for ${generatorConfig.target}.`;
    }

    return `你是${details.role}。当前是纯聊天环境，没有终端和本地文件系统。

不要要求我安装 Node.js、执行命令、克隆仓库或创建本地项目文件。

工作协议：
- ${details.focus}
- 不要把猜测当作事实；明确不确定性，只提出最必要的澄清问题。
- 任务复杂时，先给出简短计划；输出前自审后再说明完成。
- 每次重要回复结束时，给出一份简短续接摘要：已确认目标、已完成内容、关键结论、待确认问题和下一步。需要由我保存并粘贴到下一轮对话，系统不会自动持久化。
- 当任务变复杂、需要长期推进、多人协作、知识沉淀或可审计过程时，生成包含项目简报、当前决策、未决问题和下一步的迁移包，供我粘贴到 Codex、Claude Code 或 Cursor 等本地 Agent。

现在先向我提出开始这个 ${generatorConfig.template} 工作流最重要的问题。使用位置是 ${generatorConfig.target}。`;
  }

  if (promptLocale === "en") {
    return `You are initializing a RecoWork workflow template.

Repository:
https://github.com/recoluan/recowork

Template:
${generatorConfig.template}

Usage target:
${generatorConfig.target}

Output locale:
${generatorConfig.locale}

Destination:
current directory

Do this:
1. Confirm this environment can execute commands, then run \`node --version\` and \`npm --version\`.
2. If Node.js or npm is unavailable or outdated, explain the situation and ask for my confirmation before installing the latest stable Node.js. After confirmation, install it using the platform's normal method and verify both versions.
3. Run:
   ${command}
4. Do not substitute a mobile-chat workflow. If root \`AGENTS.md\` already exists, preserve its existing rules and verify that RecoWork added only its marker-bounded integration block. Then show the generated file tree, explain what was created, and tell me the first step.`;
  }

  return `你正在为我初始化一个 RecoWork 工作流模板。

仓库地址：
https://github.com/recoluan/recowork

模板：
${generatorConfig.template}

使用位置：
${generatorConfig.target}

输出语言：
${generatorConfig.locale}

目标位置：
当前目录

请这样做：
1. 先确认当前环境能执行命令，然后运行 \`node --version\` 和 \`npm --version\`。
2. 如果 Node.js 或 npm 缺失、不可用或版本过旧，先说明情况，并向我确认是否安装最新版稳定版 Node.js。只有在我确认后才按当前系统的常规方式安装，并再次验证两个版本。
3. 运行：
   ${command}
4. 不要改用手机端聊天流程。如果根目录已有 \`AGENTS.md\`，保留其原有规则，并确认 RecoWork 只新增带稳定标记的整合区块。初始化后展示生成后的文件树，说明创建了什么，并告诉我第一步应该做什么。`;
}

function renderGeneratorOutputs() {
  const prompt = document.querySelector("#promptPaths");
  const cliCommand = document.querySelector("#cliCommand");
  const visualCommand = document.querySelector("#visualCommand");
  if (!prompt || !cliCommand) {
    return;
  }
  const selectedCommand = getGeneratorCommand("rw");
  const isChatEnvironment = chatTargets.has(generatorConfig.target);

  const promptSteps = [...document.querySelectorAll(".prompt-steps > div")];
  if (isChatEnvironment && promptSteps.length === 3) {
    const chatStepCopy = currentLanguage === "zh"
      ? [["复制聊天启动指令", "选择工作流、聊天平台和语言后，复制直接可用的对话启动指令。"], ["粘贴到聊天窗口", "直接发给 ChatGPT、Claude、Kimi、豆包等聊天助手；不需要 Node.js、CLI 或本地文件。"], ["保存续接摘要", "每次重要回复后保存续接摘要；需要长期协作时，用迁移包转到本地 Agent。"]]
      : [["Copy the chat start instruction", "Choose a workflow, chat platform, and language, then copy the ready-to-use chat start instruction."], ["Paste it into chat", "Send it directly to ChatGPT, Claude, Kimi, Doubao, or another chat assistant. No Node.js, CLI, or local files are needed."], ["Save the continuation summary", "Save the summary after meaningful work. Use its migration package when work moves to a local agent."]];
    promptSteps.forEach((step, index) => {
      step.querySelector("strong").textContent = chatStepCopy[index][0];
      step.querySelector("p").textContent = chatStepCopy[index][1];
    });
  } else if (promptSteps.length === 3) {
    const translation = translations[currentLanguage];
    const localStepKeys = [
      ["promptStepOneTitle", "promptStepOneText"],
      ["promptStepTwoTitle", "promptStepTwoText"],
      ["promptStepThreeTitle", "promptStepThreeText"],
    ];
    promptSteps.forEach((step, index) => {
      step.querySelector("strong").textContent = translation[localStepKeys[index][0]];
      step.querySelector("p").textContent = translation[localStepKeys[index][1]];
    });
  }

  prompt.textContent = getGeneratorPrompt();
  cliCommand.textContent = `${getGeneratorCommand("npx recowork")}

# ${currentLanguage === "zh" ? "安装后可使用" : "After installation"}
${selectedCommand}`;
  if (visualCommand) {
    visualCommand.textContent = isChatEnvironment
      ? `${currentLanguage === "zh" ? "聊天启动 Prompt" : "Chat bootstrap prompt"} · ${generatorConfig.target} · ${generatorConfig.locale}`
      : selectedCommand;
  }
  const visualCopy = document.querySelector("#visualCopy");
  if (visualCopy) {
    visualCopy.dataset.copyTarget = isChatEnvironment ? "promptPaths" : "visualCommand";
    visualCopy.textContent = isChatEnvironment
      ? currentLanguage === "zh" ? "复制 Prompt" : "Copy prompt"
      : translations[currentLanguage].copyCommand;
  }

  document.querySelector("#configTemplate").value = generatorConfig.template;
  document.querySelectorAll(".config-locale").forEach((button) => {
    const isActive = button.dataset.locale === generatorConfig.locale;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const selectedTargetOption = document.querySelector(
    `.target-option[data-target="${generatorConfig.target}"]`,
  );
  const targetSelectBrand = document.querySelector("#targetSelectBrand");
  const selectedTargetBrand = selectedTargetOption
    .querySelector(".target-brand")
    .cloneNode(true);
  selectedTargetBrand.id = "targetSelectBrand";
  targetSelectBrand.replaceWith(selectedTargetBrand);
  document.querySelector("#targetSelectLabel").textContent = selectedTargetOption
    .querySelector(".target-option-label")
    .textContent;

  document.querySelectorAll(".target-option").forEach((button) => {
    const isActive = button.dataset.target === generatorConfig.target;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.disabled = false;
  });

  const cliTab = document.querySelector('[data-init-method="cli"]');
  cliTab.hidden = isChatEnvironment;
  cliTab.textContent = isChatEnvironment
    ? ""
    : translations[currentLanguage].initMethodCli;
  document.querySelector('[data-init-method="ai"]').textContent = isChatEnvironment
    ? currentLanguage === "zh" ? "复制聊天启动 Prompt" : "Copy chat bootstrap prompt"
    : translations[currentLanguage].initMethodAi;

  if (isChatEnvironment && currentInitMethod === "cli") {
    renderInitMethod("ai");
  }
}

function renderInitMethod(method) {
  if (!document.querySelector(".init-method-tab")) {
    return;
  }
  currentInitMethod = method;
  document.querySelectorAll(".init-method-tab").forEach((button) => {
    const isActive = button.dataset.initMethod === method;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".init-method-panel").forEach((panel) => {
    panel.hidden = panel.dataset.initPanel !== method;
  });
}

function renderTemplateStructure(templateId) {
  const structure = templateStructures[currentLanguage][templateId];
  if (!structure) {
    return;
  }

  currentTemplate = templateId;
  if (!document.querySelector("#templateStructureTree")) {
    return;
  }
  document.querySelector("#templateStructureEyebrow").textContent = structure.eyebrow;
  document.querySelector("#templateStructureTitle").textContent = structure.title;
  document.querySelector("#templateStructureDescription").textContent = structure.description;
  document.querySelector("#templateStructureTree").textContent = structure.tree;

  const outcomes = document.querySelector("#templateStructureOutcomes");
  outcomes.replaceChildren(...structure.outcomes.map((outcome) => {
    const item = document.createElement("li");
    item.textContent = outcome;
    return item;
  }));

  document.querySelectorAll(".template-tab").forEach((button) => {
    const isActive = button.dataset.template === templateId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderTemplateCategory(category) {
  document.querySelectorAll(".template-category-tab").forEach((button) => {
    const isActive = button.dataset.templateCategory === category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll("[data-template-category-card]").forEach((card) => {
    card.hidden = card.dataset.templateCategoryCard !== category;
  });

  document.querySelectorAll("[data-template-category-intro]").forEach((intro) => {
    intro.hidden = intro.dataset.templateCategoryIntro !== category;
    intro.classList.toggle("active", intro.dataset.templateCategoryIntro === category);
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

document.querySelectorAll(".template-tab").forEach((button) => {
  button.addEventListener("click", () => renderTemplateStructure(button.dataset.template));
});

document.querySelectorAll(".template-category-tab").forEach((button) => {
  button.addEventListener("click", () => renderTemplateCategory(button.dataset.templateCategory));
});

document.querySelector("#configTemplate")?.addEventListener("change", (event) => {
  generatorConfig.template = event.target.value;
  renderGeneratorOutputs();
});

document.querySelectorAll(".target-option").forEach((button) => {
  button.addEventListener("click", () => {
    generatorConfig.target = button.dataset.target;
    document.querySelector("#targetSelectMenu").hidden = true;
    document.querySelector("#targetSelectTrigger").setAttribute("aria-expanded", "false");
    renderGeneratorOutputs();
  });
});

document.querySelector("#targetSelectTrigger")?.addEventListener("click", () => {
  const menu = document.querySelector("#targetSelectMenu");
  menu.hidden = !menu.hidden;
  document.querySelector("#targetSelectTrigger").setAttribute("aria-expanded", String(!menu.hidden));
});

document.addEventListener("click", (event) => {
  const selector = document.querySelector(".target-select");
  if (selector && !selector.contains(event.target)) {
    document.querySelector("#targetSelectMenu").hidden = true;
    document.querySelector("#targetSelectTrigger").setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".config-locale").forEach((button) => {
  button.addEventListener("click", () => {
    generatorConfig.locale = button.dataset.locale;
    renderGeneratorOutputs();
  });
});


document.querySelectorAll(".init-method-tab").forEach((button) => {
  button.addEventListener("click", () => renderInitMethod(button.dataset.initMethod));
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
renderInitMethod(currentInitMethod);
window.lucide?.createIcons();
