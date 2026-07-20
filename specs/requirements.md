# Requirements Log

This document records product and engineering requirements established during the initial RecoWork design conversations.

## Product Positioning

- RecoWork helps people turn repeatable AI usage into engineered workflows.
- It is not a prompt collection.
- It should help users build durable working systems: prompts, rules, knowledge capture, memory, quality checks, and usage steps.
- It should serve both technical users and non-technical users across industries.
- It should be usable across different AI products, including web apps, mobile apps, coding agents, and workspace tools.
- The project should remain open-source friendly.

## Core Concepts

- A reusable work scenario should be represented as a template.
- A target should represent a concrete output environment and usage surface.
- A locale should represent the generated language and user-facing naming convention.
- Reusable template methodology should live in `工作方法/`, not `core/` or `method/`.
- Project workspace outputs should live in `工作空间/`, not `workspace/`.
- Templates and targets must evolve independently.
- Localized template content should live under `templates/<template>/locales/<locale>/` when a template supports multiple languages.
- Localized target content should live under `targets/<target>/locales/<locale>/files/`. Shared target files are reserved for convention-driven or locale-neutral output.
- Localized examples that contain user-facing language should live under the corresponding locale directory and be copied with that locale.
- Avoid duplicating platform-specific output inside every template.
- The CLI should compose a template, target, and locale into files.
- Prompt usage should be a lightweight entry point that asks AI to run the CLI first.

## Initial Templates

The first templates are:

- `general-ai-workflow`: daily AI usage with a role contract, task context, continuation memory, review, and reusable learning.
- `project-engineering`: project-level AI workflow with rules, knowledge capture, and quality gates.
- `learning-engineering`: structured learning workflow with learner diagnosis, a roadmap, lessons, practice, projects, feedback, and durable learning records.

Template content quality is intentionally deferred. The architecture should support better, more differentiated templates later.

## Targets and Platform Usage

- Do not use brand-only targets such as `claude` or `chatgpt`.
- Distinguish chat/mobile usage from local project usage.
- Claude chat and Claude Code project are different targets.
- Claude Code project skills should be generated under `.claude/skills/<skill-name>/SKILL.md`.
- Claude Code project instructions should use `CLAUDE.md`.
- Chat targets should generate copyable prompts, not local project configuration folders.
- Project targets should follow each tool's real file conventions.

## CLI Requirements

- npm package name: `recowork`.
- Executable command: `rw`.
- User-facing brand name: `RecoWork`.
- User-facing abbreviation: `RW`.
- Preferred command should be short and practical:

```bash
rw add <template> --target <target> <destination>
```

- Language-specific output should use:

```bash
rw add <template> --target <target> --locale <locale> <destination>
```

- `rw init` can remain as a compatibility alias if needed.
- CLI initialization should be deterministic file copy/render, not AI-generated long-form reconstruction.
- CLI should list templates and targets, and `rw show <template>` should show supported locales.
- CLI should support aliases only when they are unambiguous.
- If a requested locale is not supported by the template, the CLI should fail with supported locales.
- New initializations must write a versioned `rw-manifest.json` with generated-file hashes and ownership metadata.
- `rw status <destination>` and `rw upgrade --check <destination>` must be read-only and explain available template/target updates, user modifications, missing files, and workspace items needing review. When `--scope` is provided, their output must be filtered to that scope.
- `rw upgrade --apply <destination>` may update only unchanged working-method or target files within the selected scope. It must preserve user-modified files.
- Generated workspaces are user-owned. Upgrade must never overwrite, move, delete, restore, or add reports within an existing/tracked workspace file tree. It may add a newly introduced missing workspace file only with both `--scope workspace` and `--add-missing`; upgrade reports live under `.recowork/upgrade-reports/`.
- Legacy manifests without a generated-file baseline must require explicit `rw upgrade --adopt <destination>`; adoption records state without changing project files.

## Prompt Requirements

- Prompt mode exists for users who do not want to manually learn the CLI.
- Prompt mode should not embed full template content.
- Prompt mode should tell AI to run:

```bash
npx recowork add <template> --target <target> <destination>
```

- When language matters, prompt mode should tell AI to run:

```bash
npx recowork add <template> --target <target> --locale <locale> <destination>
```

- If the environment cannot run `npx`, the prompt may instruct AI to read the GitHub repository and manually compose `templates/<template>/` with `targets/<target>/`.
- If the template has localized content, fallback prompt mode should instruct AI to use `templates/<template>/locales/<locale>/`.
- Chinese prompt templates should be written in Chinese.
- Prompt templates must include the GitHub repository URL so AI knows where to read the source.
- Initialization must distinguish a command-capable local agent from a pure chat/mobile environment.
- A command-capable agent should check Node.js and npm first. If either is missing, unavailable, or outdated, it must ask for confirmation before installing the latest stable Node.js, then run the CLI.
- A pure chat/mobile environment must not be asked to install Node.js or create local files. It should receive a direct, copyable chat bootstrap prompt with the selected workflow's role, working protocol, self-review, and continuation-memory rules.

## Documentation and Website Requirements

- README defaults to English.
- Chinese README filename: `README.zh.md`.
- Website defaults to Chinese.
- Website supports English and Chinese.
- Website is served from `docs/` for GitHub Pages.
- Website should explain the project from a user's point of view, not from internal implementation details.
- Website style should be modern, colorful, and vivid.
- Website should present AI-assisted initialization and CLI initialization as two selectable paths within one initialization area.
- Website should let users select a workflow template, usage target, output locale, and runtime capability, then generate matching copyable CLI and prompt examples.
- Website should avoid overlong or unclear main titles.

## Packaging and Publishing Requirements

- npm package should include only source assets needed to run RecoWork:
  - `bin/`
  - `cli/`
  - `templates/`
  - `targets/`
  - `prompts/`
  - README files
  - changelog files
- npm package must not include npm cache, generated tgz files, local test output, or generated project output.
- `.npm-cache/`, `node_modules/`, and `*.tgz` should be ignored.
- Publishing requires npm authentication that supports package publish, including 2FA or a granular access token with publish permission when required by npm.
- Every published version must move completed items from `Unreleased` into a dated version section in both `CHANGELOG.md` and `CHANGELOG.zh.md`.
- Every published version must also have a matching Chinese and English entry on the GitHub Pages release record at `docs/releases.html`.

## Project Workflow Requirements

- Durable decisions and requirements should be recorded in repo docs, not left only in chat.
- When discussion establishes a new convention, update `AGENTS.md` and the relevant file under `specs/` in the same change.
- Template changes must keep source templates, CLI compatibility cleanup, README/site usage text, and specs consistent.
- Convention-driven filenames must not be translated. Keep names such as `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `README.md`, and `index.md` unchanged.
- Chinese can be used in user-facing folder names and document content when the template is Chinese-oriented.
- English locale output should use English user-facing folders and documents, such as `methods/`, `workspace/`, `project-brief.md`, and `open-questions.md`.
- Chinese locale output should use Chinese user-facing folders and documents, such as `工作方法/`, `工作空间/`, `项目简报.md`, and `待确认问题.md`.
- Locale applies to user-facing target paths and static target text as well as template content. For example, Chinese Codex output uses `知识库/`, while English output uses `knowledge/`.
- Project-oriented templates should include a role contract that defines the AI role, working principles, core capabilities, prohibited behavior, and iteration rules.
- Role contracts should be localized with the template content. For `project-engineering`, use `工作方法/角色设定.md` in `zh` and `methods/role-contract.md` in `en`.
- Generated project rules should explicitly tell AI to read the role contract before planning or executing project work.
- AI-generated changes should be reviewed before being presented as complete.
- Large or ambiguous design changes should be confirmed before broad execution.
- Test output generated in the repository root should be cleaned up.
- Verification commands should be reported after meaningful code changes.
- Every template with a durable workspace must generate localized document conventions: `工作方法/文档规范.md` for `zh` and `methods/document-standard.md` for `en`.
- Except for `index.md`, substantial workspace documents use metadata, a conclusion-first summary, structured body, relative references, and a change log; each document covers one topic.
- `index.md` is navigation only: one-line entries, relative links, status, and last-updated state, without copied body content.
- Agents start from the relevant root index, retrieve focused documents progressively, and update affected indexes after material work.
- Commits must follow Conventional Commits using `<type>(<scope>): <summary>`; the full contributor guidance lives in `CONTRIBUTING.md`.
- Commits that span multiple surfaces, introduce migrations, alter generated output, or are otherwise non-obvious require `Why`, `Changes`, `Compatibility`, and `Validation` sections in the body.
- Incompatible command, generated-path, file-format, or workflow-contract changes require a `BREAKING CHANGE:` footer.
- Template and target manifests must declare semantic versions. A meaningful generated-content change increments its owning template or target version and is described in the release record.

## Project Engineering Workspace Requirements

The `project-engineering` template should generate a concise Chinese-oriented `工作空间/` structure:

```text
工作空间/
├── index.md
├── 项目简报.md
├── 待确认问题.md
├── 01-需求与约束/
├── 02-方案设计/
├── 03-计划与决策/
├── 04-过程留痕/
└── 05-评审验证/
```

The Chinese locale should also generate:

```text
工作方法/
└── 角色设定.md
```

The Chinese locale must also generate `工作方法/文档规范.md`; the English locale must generate `methods/document-standard.md`. This working method defines a five-part document structure (metadata, conclusion first, body, relative references, and change log), one-topic granularity, index-only navigation rules, progressive retrieval, and index-status maintenance after work.

Responsibilities:

- `项目简报.md`: project background, problem, goals, scope, non-goals, current status, and constraints.
- `待确认问题.md`: questions that AI must not silently assume.
- `01-需求与约束/`: requirements, user scenarios, constraints, assumptions, and clarifications.
- `02-方案设计/`: tradeoff analysis, feasibility, architecture, technical design, and implementation path.
- `03-计划与决策/`: phases, milestones, execution plan, and durable decisions.
- `04-过程留痕/`: brainstorming, intermediate reasoning, discussion summaries, and process traces.
- `05-评审验证/`: review notes, validation results, acceptance checks, and follow-up items.

The old seven-part split must not be generated by default:

- `00-项目总览/`
- `01-需求分析/`
- `02-分析评估/`
- `03-技术设计/`
- `04-项目规划/`
- `05-决策记录/`
- `06-思考留痕/`
- `07-评审验证/`

`index.md` filenames remain unchanged because they are navigation conventions. User-facing folder names and content can be Chinese.

The English locale should generate the same structure in English-oriented names:

```text
workspace/
├── index.md
├── project-brief.md
├── open-questions.md
├── 01-requirements-and-constraints/
├── 02-solution-design/
├── 03-plan-and-decisions/
├── 04-thinking-traces/
└── 05-review-and-validation/
```

The English locale should also generate:

```text
methods/
└── role-contract.md
```

## General AI Workflow Workspace Requirements

The `general-ai-workflow` template should remain lightweight for everyday chat and mobile users, while still preserving task context and reusable learning.

The Chinese locale should generate:

```text
工作方法/
├── 角色设定.md
├── 工作流程.md
├── 检查清单.md
└── 记忆卡模板.md

工作空间/
├── index.md
├── 任务简报.md
├── 待确认问题.md
├── 01-任务准备/
├── 02-任务产出/
├── 03-过程留痕/
└── 04-复盘与沉淀/
```

The English locale should generate the equivalent structure:

```text
methods/
├── role-contract.md
├── workflow.md
├── quality-checklist.md
└── continuation-memory-template.md

workspace/
├── index.md
├── task-brief.md
├── open-questions.md
├── 01-task-setup/
├── 02-task-output/
├── 03-thinking-traces/
└── 04-review-and-reuse/
```

Responsibilities:

- The role contract defines a rigorous AI work advisor role, explicit uncertainty handling, confirmation behavior, and continuous improvement rules.
- The task brief stores the stable agreement for the current task; it is not a long process log.
- Open questions store gaps AI must not silently assume.
- Task setup, output, thinking traces, and review/reuse keep preparation, deliverables, process, and durable learning separate.
- The template must stay lighter than `project-engineering`; simple tasks should only capture context that helps the next task.

## Learning Engineering Workspace Requirements

The `learning-engineering` template should turn learning into a validated progression of diagnosis, units, practice, projects, retrospectives, and reusable knowledge. It should not generate a complete course as one long answer.

The Chinese locale should generate:

```text
工作方法/
├── 角色设定.md
├── 学习方法.md
├── 课程单元模板.md
└── 评估与复盘.md

学习空间/
├── index.md
├── 学习简报.md
├── 课程路线.md
├── 学习进度.md
├── 01-课程设计/
├── 02-课程与练习/
├── 03-项目实践/
├── 04-问题与复盘/
└── 05-知识沉淀/
```

The English locale should generate the equivalent structure under `methods/` and `learning-workspace/`:

```text
learning-workspace/
├── index.md
├── learner-brief.md
├── course-roadmap.md
├── learning-progress.md
├── 01-course-design/
├── 02-lessons-and-practice/
├── 03-project-practice/
├── 04-questions-and-retrospectives/
└── 05-knowledge-capture/
```

Responsibilities:

- The role contract defines a curriculum designer, subject mentor, and practice coach role.
- Learning initialization has a mandatory confirmation gate: diagnose the learner, present a concise learning agreement, and wait for explicit confirmation before generating or changing a roadmap, lesson content, practice plan, or project plan. An explicitly confirmed local unit may proceed without repeated confirmation.
- The learner brief captures the learner's foundation, target ability, constraints, preferences, and completion criteria.
- The roadmap records unit dependencies, practice output, acceptance criteria, and a throughline project.
- Each learning unit should include a goal, a minimal experiment, practice, feedback, verification, and learner-owned explanation.
- Code or operational courses should show the problem, key change, actual verification, and data-flow reasoning; they must not claim unrun work succeeded.
- The workspace separates course design, lessons, project work, questions/retrospectives, and validated knowledge capture.

## Naming Requirements

- Use `RecoWork` in user-facing text.
- Use `RW` for the abbreviation.
- npm package remains lowercase `recowork`.
- CLI binary remains lowercase `rw`.
