# RecoWork Agent Guide

This file is the root instruction document for AI agents working on RecoWork.

## Project Shape

RecoWork turns repeatable AI workflows into reusable templates and output targets.

Current implementation:

- `templates/`: scenario templates.
- `targets/`: reusable output targets.
- `cli/`: `rw` command implementation.
- `prompts/`: local executable-agent prompt entry points that should ask AI to run the CLI first.
- `docs/`: GitHub Pages static site only.
- `specs/`: product and engineering specifications.

Architecture:

- `templates/`: what workflow scenario to initialize.
- `targets/`: where and how the workflow should be generated.
- `locale`: which language and user-facing folder/file names should be generated when a template supports multiple languages.

## Source of Truth

Read these specs before changing product behavior, CLI behavior, template structure, output locations, or public documentation:

- `specs/targets.md`
- `specs/requirements.md`
- `specs/decisions.md`

When a change introduces a new target, template convention, CLI option, generated file location, or user-facing rule, update the relevant spec in the same change.

Template structure changes must also update the generated template files, CLI cleanup/compatibility behavior, website/README usage text when relevant, and the specs that describe the convention. Do not rely on chat history as the only record of a new rule.

## Important Rules

- Keep `docs/` focused on the GitHub Pages website.
- Do not store engineering specs under `docs/`.
- Do not leave generated workflow output in the repository root after testing.
- Do not use brand-only target names such as `claude`, `chatgpt`, or `codex`.
- Use only the two primary target names: `chat-mobile` and `local-agent-project`.
- Use `--locale <locale>` for language selection when a template supports multiple locales.
- Keep locale-specific template content under `templates/<template>/locales/<locale>/`.
- Keep locale-specific target content under `targets/<target>/locales/<locale>/files/`; use shared `targets/<target>/files/` only for convention-driven or locale-neutral output.
- Locale-specific non-output partials for root `AGENTS.md` integration may live at `targets/local-agent-project/locales/<locale>/AGENTS.integration.md.tpl`; they must never be emitted as standalone user files.
- Locale changes may translate user-facing directories and documents, but must not translate convention-driven filenames such as `AGENTS.md`, `README.md`, and `index.md`.
- Templates that govern ongoing work should include a localized role contract that defines the AI's working role, principles, prohibited behavior, and iteration rules.
- AI agents must judge objectively rather than merely validate the user's premise. State material risks, contradictions, weak assumptions, and credible alternatives clearly; disagree respectfully when evidence or reasoning warrants it, and never hide concerns to be agreeable.
- For `project-engineering`, the role contract lives at `工作方法/角色设定.md` for `zh` and `methods/role-contract.md` for `en`.
- Every template with a durable workspace keeps document conventions at `工作方法/文档规范.md` for `zh` and `methods/document-standard.md` for `en`. Agents navigate from `index.md`, retrieve documents progressively, and update affected indexes after work.
- Non-index documents follow metadata, conclusion-first summary, structured body, relative references, and a change log. `index.md` remains navigation only, with one-line entries, status, and last-updated state.
- For `general-ai-workflow`, the role contract uses the same locations and its workspace is task-oriented: task brief, open questions, setup, output, thinking traces, and review/reuse.
- For `learning-engineering`, the role contract uses the same locations and its learning space is organized around learner brief, roadmap, progress, course design, lessons/practice, project practice, questions/retrospectives, and knowledge capture.
- Chat targets are lightweight conversation workflow entry points, not local-project equivalents. They generate only a start instruction, task execution protocol, and continuation or migration summary; they do not create workspaces or manifests and do not support upgrades.
- Initialization must distinguish command-capable local agents from pure chat/mobile environments. Local agents should check Node.js and npm, then request confirmation before installing the latest stable Node.js when needed; pure chat/mobile flows must use direct chat bootstrap prompts and must not request local file creation.
- Chat continuity is manual: the user saves and pastes the continuation summary into the next conversation. Every chat target must include a migration package with project brief, current decisions, open questions, and next step for a local executable agent.
- `local-agent-project` is tool-neutral and uses root `AGENTS.md` as the sole cross-tool instruction entry point. When it is absent, generate it; when an external root `AGENTS.md` exists, preserve its content and append or update only a marker-bounded RecoWork block. Do not generate platform-specific skills, rules folders, or configuration files.
- `web-design-standard` is intentionally a single-file local standard: besides `AGENTS.md` and `rw-manifest.json`, generate exactly one localized design-standard document (`网页设计规范.md` or `web-design-standard.md`). Do not add a workspace, working-method directory, README, or design-system folder for this template.
- For `project-engineering`, keep the generated `工作空间/` concise and user-facing:
  - `工作方法/角色设定.md`
  - `项目简报.md`
  - `待确认问题.md`
  - `01-需求与约束/`
  - `02-方案设计/`
  - `03-计划与决策/`
  - `04-过程留痕/`
  - `05-评审验证/`
- Do not reintroduce the old split of `00-项目总览/`, `01-需求分析/`, `02-分析评估/`, `03-技术设计/`, `04-项目规划/`, `05-决策记录/`, `06-思考留痕/`, and `07-评审验证/` unless the spec is explicitly changed first.
- Keep convention-driven filenames unchanged, including `AGENTS.md`, `README.md`, and `index.md`. Chinese user-facing folder names and document content are allowed when the template is Chinese-oriented.
- When user feedback changes the expected AI role, working style, confirmation behavior, or quality bar, consider updating the role contract or related working methods.
- After changing generated templates, run a real initialization test into `/private/tmp/...` and inspect the generated output for stale structure or outdated wording.
- When changing localized templates, validate every supported locale that the change affects.
- RecoWork upgrades must treat generated workspaces as user-owned: never automatically overwrite, move, delete, or recreate a tracked workspace file. `rw upgrade` may safely update only unmodified working-method or target files; workspace changes are reported for review and missing newly introduced workspace files require explicit `--scope workspace --add-missing`.
- `rw add` must refuse destinations that already contain `rw-manifest.json`; never use initialization as an in-place upgrade or cleanup mechanism.
- Legacy chat manifests do not support in-place upgrades. `rw status` and `rw upgrade` must print a migration guide that creates a separate `local-agent-project` destination and leaves existing files untouched.
- New initializations write `rw-manifest.json` schema version 2 with template/target versions and generated-file hashes. Legacy manifests require `rw upgrade --adopt <destination>` before upgrade checks can establish a baseline.
- For an external root `AGENTS.md`, record the managed RecoWork block separately in the manifest. Upgrades may replace only an unchanged managed block; any user edit inside or removal of that block must be preserved and reported.

## Validation

Run relevant checks after code or site changes:

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
node cli/recowork/bin/rw.js add project --target local-agent-project --locale zh /private/tmp/recowork-zh-test
node cli/recowork/bin/rw.js add project --target local-agent-project --locale en /private/tmp/recowork-en-test
node cli/recowork/bin/rw.js add general --target chat-mobile --locale zh /private/tmp/recowork-general-zh-test
node cli/recowork/bin/rw.js add general --target chat-mobile --locale en /private/tmp/recowork-general-en-test
node cli/recowork/bin/rw.js add learning --target chat-mobile --locale zh /private/tmp/recowork-learning-zh-test
node cli/recowork/bin/rw.js add learning --target chat-mobile --locale en /private/tmp/recowork-learning-en-test
node cli/recowork/bin/rw.js add web-design-standard --target local-agent-project --locale zh /private/tmp/recowork-web-design-zh
node cli/recowork/bin/rw.js add web-design-standard --target local-agent-project --locale en /private/tmp/recowork-web-design-en
node cli/recowork/bin/rw.js add web-design-standard --target chat-mobile --locale zh /private/tmp/recowork-web-design-chat-zh
node cli/recowork/bin/rw.js add web-design-standard --target chat-mobile --locale en /private/tmp/recowork-web-design-chat-en
```

For initialization tests, use `/private/tmp/...` or another temporary directory outside the repository root.

## Commit Rules

- Follow [CONTRIBUTING.md](./CONTRIBUTING.md) and use Conventional Commits: `<type>(<scope>): <summary>`.
- Use a specific scope such as `cli`, `targets`, `templates`, `project-engineering`, `general-ai-workflow`, `learning-engineering`, `docs`, `specs`, or `release`.
- For multi-surface, migration, generated-output, or otherwise non-obvious changes, include `Why`, `Changes`, `Compatibility`, and `Validation` in the commit body.
- Use a `BREAKING CHANGE:` footer when an existing command, generated path, file format, or workflow contract becomes incompatible.
- Before committing a completed user-facing, template, target, CLI, or website change that is not yet released, add a concise bilingual entry to `CHANGELOG.md`, `CHANGELOG.zh.md`, and the Unreleased section of `docs/releases.html`. Keep the three surfaces aligned; publication moves those entries into a dated release section.
- Inspect staged files before committing; never stage unrelated user changes, generated test output, npm cache, or package tarballs.
- Before publishing, update `CHANGELOG.md`, `CHANGELOG.zh.md`, and `docs/releases.html` in both languages. Do not publish a version without a release record.
