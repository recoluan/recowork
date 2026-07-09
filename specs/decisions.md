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

## 007. English Is the Default Public Language

Decision: Public documentation and website default to English, with Chinese versions where needed.

Reason:

- The project is intended to be open-source and reusable by a broader audience.
- Chinese content remains important for the original use case and local users.

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
