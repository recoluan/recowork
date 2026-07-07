# RecoWork Agent Guide

This file is the root instruction document for AI agents working on RecoWork.

## Project Shape

RecoWork turns repeatable AI workflows into reusable templates and output targets.

Current implementation:

- `templates/`: scenario templates.
- `targets/`: reusable output targets.
- `cli/`: `rw` command implementation.
- `prompts/`: prompt entry points that should ask AI to run the CLI first.
- `docs/`: GitHub Pages static site only.
- `specs/`: product and engineering specifications.

Architecture:

- `templates/`: what workflow scenario to initialize.
- `targets/`: where and how the workflow should be generated.

## Source of Truth

Read these specs before changing product behavior, CLI behavior, template structure, output locations, or public documentation:

- `specs/targets.md`
- `specs/requirements.md`
- `specs/decisions.md`

When a change introduces a new target, template convention, CLI option, generated file location, or user-facing rule, update the relevant spec in the same change.

## Important Rules

- Keep `docs/` focused on the GitHub Pages website.
- Do not store engineering specs under `docs/`.
- Do not leave generated workflow output in the repository root after testing.
- Do not use brand-only target names such as `claude`, `chatgpt`, or `codex`.
- Use concrete target names such as `claude-chat`, `claude-code-project`, `codex-project`, or `chatgpt-chat`.
- Chat targets generate copyable prompts and should not create project tool directories.
- Project targets must follow real tool conventions.
- Claude Code project skills belong under `.claude/skills/<skill-name>/SKILL.md`.
- Claude Code project instructions belong in `CLAUDE.md`.

## Validation

Run relevant checks after code or site changes:

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
```

For initialization tests, use `/private/tmp/...` or another temporary directory outside the repository root.
