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
