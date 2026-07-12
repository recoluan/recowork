# Architecture Decisions

## 001. Use Templates Instead of Packages

Decision: RecoWork work scenarios are called templates.

Reason:

- "Package" sounded like a complete bundled product for every platform.
- Templates better express reusable workflow structure.
- Template content can improve independently from platform output rules.

## 002. Separate Templates From Platform Output

Decision: Do not store complete platform output inside every template.

Reason:

- Per-template adapters duplicate too much content.
- Adding a new platform would require editing every template.
- A shared target layer lets all templates reuse the same platform output rules.

## 003. Replace Platform With Target

Decision: RecoWork should use targets for user-facing initialization.

Reason:

- Platform brand names are ambiguous.
- Claude chat and Claude Code project have different file conventions.
- ChatGPT web/mobile, Codex projects, Cursor projects, Notion workspaces, and Feishu docs are different output environments.

Implication:

- `--target` should become the preferred CLI option.
- `--platform` may remain as a compatibility alias only for unambiguous mappings.

## 004. Prompt Mode Should Invoke the CLI

Decision: Prompt mode should ask AI to run the RecoWork CLI first.

Reason:

- Asking AI to reconstruct files from long context is slow.
- It burns tokens and increases hallucination risk.
- CLI-based initialization is deterministic and faster.

Fallback:

- If commands are unavailable, AI may manually compose `templates/<template>/` and `targets/<target>/` from the GitHub repository.

## 005. Claude Chat and Claude Code Are Different Targets

Decision: Split Claude usage into at least `claude-chat` and `claude-code-project`.

Reason:

- Claude chat needs copyable instructions and prompts.
- Claude Code projects need real project files and project-scoped skills.
- Project-scoped Claude Code skills belong under `.claude/skills/<skill-name>/SKILL.md`.
- Project instructions belong in `CLAUDE.md`.

## 006. Specs Live Under specs

Decision: Product and engineering specs live in `specs/`.

Reason:

- `docs/` is already the GitHub Pages source and should stay focused on the website.
- Specs should be visible in the repository and easy to link from README or the site.
- Keeping specs separate from website UI files avoids mixing product policy with presentation code.

## 007. English README, Chinese Website Default

Decision: The repository README defaults to English, while the GitHub Pages website defaults to Chinese. Both surfaces provide Chinese and English content.

Reason:

- An English README keeps the repository approachable for a broad open-source audience.
- The website is currently oriented toward the project's primary Chinese-speaking users and should be immediately usable without a language switch.

Implication:

- `README.md` remains English and `README.zh.md` remains its Chinese counterpart.
- `docs/index.html` starts with `zh-CN`, the Chinese toggle active, and Chinese metadata.
- The language toggle must update visible text, page metadata, and copyable command examples.
## 008. Keep Project Engineering Workspace Concise

Decision: The `project-engineering` template should use a concise `工作空间/` structure with five main sections:

- `01-需求与约束/`
- `02-方案设计/`
- `03-计划与决策/`
- `04-过程留痕/`
- `05-评审验证/`

Root workspace documents:

- `项目简报.md`
- `待确认问题.md`
- `index.md`

Reason:

- A separate `00-项目总览/` duplicates `项目简报.md`.
- Splitting analysis and technical design too early makes the template feel heavy for new projects.
- Splitting project planning and decisions creates too many folders before the user has enough content.
- Five sections preserve the engineering workflow while keeping the generated structure easier to understand.

Implication:

- The CLI should clean up known old workspace files and empty old directories when re-initializing `project-engineering`.
- User-facing Chinese template content should avoid leftover English scaffold terms such as `Purpose`, `Documents`, and `TBD`.
- Future template structure changes must update the source template, CLI cleanup rules, and specs together.

## 009. Add Locale as a First-Class Initialization Option

Decision: RecoWork initialization should support locale selection:

```text
template + target + locale = initialized workflow
```

CLI:

```bash
rw add <template> --target <target> --locale <locale> <destination>
```

Reason:

- Users may want the same workflow in different languages.
- Language changes affect user-facing folder names and document names, not only text content.
- Duplicating whole templates for every language would make template maintenance harder.

Implication:

- Localized template content should live under `templates/<template>/locales/<locale>/`.
- `pack.yaml` can declare `default_locale` and `locales`.
- Targets remain language-neutral unless a platform convention itself is language-specific.
- Convention-driven filenames remain unchanged across locales.

## 010. Add Role Contract to Project-Oriented Templates

Decision: `project-engineering` should include a localized role contract:

- `zh`: `工作方法/角色设定.md`
- `en`: `methods/role-contract.md`

Reason:

- A project workflow needs a durable AI role definition, not only task prompts.
- The role should constrain judgment, confirmation behavior, scope control, and quality standards.
- The role should evolve as users add project-specific preferences and working rules.

Implication:

- Generated project rules should instruct AI to read the role contract before project work.
- The role contract should be maintained like other working methods when user feedback changes expected behavior.
- Avoid vague role claims; specify responsibilities, principles, prohibited behavior, and iteration rules.

## 011. Engineer General AI Workflows Around Tasks, Not Projects

Decision: `general-ai-workflow` uses the same durable principles as `project-engineering` but a lighter task-oriented structure.

- `zh`: `工作方法/` and `工作空间/`
- `en`: `methods/` and `workspace/`
- The workspace separates task setup, output, thinking traces, and review/reuse.
- Both locales include a role contract, workflow, quality checklist, and continuation memory template.

Reason:

- Everyday chat and mobile AI users need continuity and quality controls without adopting a full project-management workspace.
- A task brief and open-question list make AI clarification behavior visible and reusable.
- Separating final output from traces prevents chats from becoming one unstructured, hard-to-resume record.

Implication:

- `general-ai-workflow` supports `zh` and `en`, with localized names and examples.
- CLI re-initialization cleans up known legacy general-workflow files and empty directories.
- Chat prompts must render in the selected locale and refer users to the role contract.

## 012. Engineer Learning Around Validated Units And Throughline Practice

Decision: `learning-engineering` should use a localized role contract and a dedicated learning workspace, informed by the LangChain TypeScript learning project.

- `zh`: `工作方法/` and `学习空间/`
- `en`: `methods/` and `learning-workspace/`
- Root learning documents are learner brief, roadmap, and progress.
- Learning work is separated into course design, lessons/practice, project practice, questions/retrospectives, and knowledge capture.

Reason:

- A study plan alone does not demonstrate mastery; each unit needs practice, verification, and a learner-owned explanation.
- A throughline project gives otherwise isolated concepts a concrete application and an evolving acceptance surface.
- Recording actual commands, results, errors, and reasoning makes technical learning reproducible rather than performative.

Implication:

- The learning mentor must diagnose before teaching and teach one validated unit at a time.
- Templates must support code and non-code learning without assuming a specific file extension or technology stack.
- The CLI cleans up known legacy learning-template files on re-initialization.

## 013. Choose Initialization By Runtime Capability

Decision: RecoWork initialization should distinguish runtime capability from the output target.

- A command-capable local agent, including Codex, Cursor, and Claude Code, can initialize any target through an AI-guided CLI flow.
- That flow checks Node.js and npm first; if either is missing, unavailable, or outdated, it asks the user before installing the latest stable Node.js.
- A pure chat or mobile environment receives a direct chat bootstrap prompt and is restricted to chat targets. It must not be instructed to install Node.js or create local project files.

Reason:

- Codex, Cursor, and Claude Code can converse and run commands, so a chat-led initialization flow can still produce deterministic project files.
- Mobile chat products do not have a shell or writable project directory; treating them as failed CLI environments produces unusable instructions.

Implication:

- Target describes the desired output surface; runtime capability describes how initialization can happen.
- Website initialization controls must collect both values and change available paths accordingly.
- Prompt templates for local agents must include runtime checks and confirmation before installing Node.js.

## 014. Treat Document Conventions As A First-Class Working Method

Decision: every RecoWork template with a durable workspace includes a localized document standard separate from workflow steps and quality gates.

- `zh`: `工作方法/文档规范.md`
- `en`: `methods/document-standard.md`

Reason:

- Workflow describes when work happens; quality gates check whether work is ready; neither defines how durable project knowledge is structured, linked, retrieved, and maintained.
- A fixed document shape makes conclusions discoverable and lets AI retrieve only the context needed for the current task.

Implication:

- Non-index documents use metadata, conclusion-first summary, structured body, relative references, and a change log.
- `index.md` files remain lightweight navigation only, with one-line entries, relative links, status, and last-updated state.
- Agents navigate from indexes, retrieve focused documents progressively, and update affected indexes after material work.
