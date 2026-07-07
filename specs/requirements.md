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
- Templates and targets must evolve independently.
- Avoid duplicating platform-specific output inside every template.
- The CLI should compose a template and a target into files.
- Prompt usage should be a lightweight entry point that asks AI to run the CLI first.

## Initial Templates

The first templates are:

- `general-ai-workflow`: daily AI usage with task prompts, memory, and review.
- `project-engineering`: project-level AI workflow with rules, knowledge capture, and quality gates.
- `learning-engineering`: structured learning workflow with plans, chapters, feedback, and progress.

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

- `rw init` can remain as a compatibility alias if needed.
- CLI initialization should be deterministic file copy/render, not AI-generated long-form reconstruction.
- CLI should list templates and targets.
- CLI should support aliases only when they are unambiguous.

## Prompt Requirements

- Prompt mode exists for users who do not want to manually learn the CLI.
- Prompt mode should not embed full template content.
- Prompt mode should tell AI to run:

```bash
npx recowork add <template> --target <target> <destination>
```

- If the environment cannot run `npx`, the prompt may instruct AI to read the GitHub repository and manually compose `templates/<template>/` with `targets/<target>/`.
- Chinese prompt templates should be written in Chinese.
- Prompt templates must include the GitHub repository URL so AI knows where to read the source.

## Documentation and Website Requirements

- README defaults to English.
- Chinese README filename: `README.zh.md`.
- Website defaults to English.
- Website supports English and Chinese.
- Website is served from `docs/` for GitHub Pages.
- Website should explain the project from a user's point of view, not from internal implementation details.
- Website style should be modern, colorful, and vivid.
- Website should explain both CLI usage and prompt usage.
- Website should avoid overlong or unclear main titles.

## Packaging and Publishing Requirements

- npm package should include only source assets needed to run RecoWork:
  - `bin/`
  - `cli/`
  - `templates/`
  - `targets/`
  - `prompts/`
  - README files
- npm package must not include npm cache, generated tgz files, local test output, or generated project output.
- `.npm-cache/`, `node_modules/`, and `*.tgz` should be ignored.
- Publishing requires npm authentication that supports package publish, including 2FA or a granular access token with publish permission when required by npm.

## Project Workflow Requirements

- Durable decisions and requirements should be recorded in repo docs, not left only in chat.
- AI-generated changes should be reviewed before being presented as complete.
- Large or ambiguous design changes should be confirmed before broad execution.
- Test output generated in the repository root should be cleaned up.
- Verification commands should be reported after meaningful code changes.

## Naming Requirements

- Use `RecoWork` in user-facing text.
- Use `RW` for the abbreviation.
- npm package remains lowercase `recowork`.
- CLI binary remains lowercase `rw`.
