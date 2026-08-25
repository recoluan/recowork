---
name: recowork
description: Initialize, inspect, and continue a RecoWork local workflow using its CLI and the generated root AGENTS.md protocol.
---

# RecoWork for Codex

Use this skill when the user asks to create, inspect, browse, or continue a RecoWork workflow.

## Core contract

- RecoWork's `rw` CLI is the source of truth for templates, generated files, manifests, status, and upgrades.
- A generated local workflow is tool-neutral. Read its root `AGENTS.md` and follow the selected template's role contract and document standard; do not create Codex-specific workspace files.
- Treat the workspace as user-owned. Never use initialization to modify an existing RecoWork destination, and never overwrite, move, delete, rename, or recreate workspace material without the user's explicit confirmation.

## Initialize a workflow

Only initialize when the user explicitly requests a new workflow and supplies or approves a destination.

1. Check that `node` and `npm` are available. If they are missing or outdated, ask before installing or changing them.
2. Run one deterministic initialization command:

   ```bash
   npx --yes recowork@latest add <template> --target local-agent-project --locale <zh|en> <destination>
   ```

3. Do not substitute a brand target such as `codex-project`; `local-agent-project` is the supported, tool-neutral target.
4. Read the generated root `AGENTS.md`, then follow its required workflow before planning or editing.

## Continue an existing workflow

1. Start at the project root and read `AGENTS.md`, `rw-manifest.json`, and the workspace index.
2. Retrieve only the role contract, document standard, project brief, open questions, and topic documents relevant to the request.
3. Respect confirmation gates. In `idea-to-project`, do not enter project design, planning, or implementation until the user explicitly confirms a direction and project entry.
4. When the user asks to browse or review the workspace, run:

   ```bash
   npx --yes recowork@latest view .
   ```

   Report the local URL; do not ask the user to install RecoWork or locate the workspace.

## Safe lifecycle actions

- For status or upgrade review, prefer `npx --yes recowork@latest status .` and `npx --yes recowork@latest upgrade --check .`.
- Do not run `rw add` in a directory containing `rw-manifest.json`.
- Do not apply an upgrade that changes workspace files. Explain the report and obtain scoped confirmation before any permitted update.

## Finish each task

Report the outcome, files changed, validation performed, unresolved risks, and the next confirmation or action required by the workspace protocol.
