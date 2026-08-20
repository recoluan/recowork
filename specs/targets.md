# RecoWork Targets Standard

## Purpose

A target defines the delivery environment for a RecoWork template. RecoWork intentionally supports two environments only:

| Target | Positioning | Delivered capability |
| --- | --- | --- |
| `local-agent-project` | Complete, durable workflow for a command-capable local agent | `AGENTS.md`, working methods, a user-owned workspace, intermediate artifacts, indexes, a manifest, status checks, and safe upgrades. |
| `chat-mobile` | Lightweight entry point for any web, app, or mobile chat | A start instruction, task execution protocol, and continuation/migration summary. |

Targets are not brands. A user may run the local target in Codex, Claude Code, Cursor, or another compatible local agent. A user may paste the chat target into ChatGPT, Claude, Kimi, Doubao, or another chat application.

## Target Contracts

### `local-agent-project`

This is the product core.

- Generates only tool-neutral `AGENTS.md` as the cross-tool instruction entry point.
- Generates template methods and a durable, user-owned workspace.
- Writes `rw-manifest.json` schema version 2 for status checks and upgrades.
- Requires a command-capable local agent. The bootstrap prompt may check Node.js and npm and must ask before installing Node.js.
- Never generates platform-specific `.claude/`, `.cursor/`, `CLAUDE.md`, skills, or brand rules.
- Durable knowledge belongs in canonical documents inside the template workspace, not in a separate `knowledge/` or `知识库/` directory. Formal workspace indexes list only current or still-open material; superseded versions and completed process material are organized under the localized workspace archive by category, topic, and version. Agents update the affected current or archive `index.md` when consolidating verified conclusions.
- Root `AGENTS.md` uses safe auto-integration. If missing, RecoWork generates the complete target file. If an external root file exists, RecoWork preserves all existing content and appends or updates only its marker-bounded block: `<!-- recowork:start ... -->` through `<!-- recowork:end -->`.
- The integration block explicitly states that rules outside the block take priority. The manifest stores its marker and hashes separately; upgrades replace only an unchanged block and report any edited or removed block without overwriting it.
- Only the initialization destination's root `AGENTS.md` participates in this behavior. RecoWork does not scan or modify nested instruction files.

The `web-design-standard` template is a deliberate single-file exception: apart from target-owned `AGENTS.md` and `rw-manifest.json`, it generates only `网页设计规范.md` (`zh`) or `web-design-standard.md` (`en`). It does not create a workspace, methods directory, README, or design-system folder. Its rendered `AGENTS.md` requires agents to read the standard before web work, defer to existing brand guidance, complete responsive/state/accessibility checks, and report the checklist result.

### `chat-mobile`

This is an intentionally limited conversation workflow, not a local-project substitute.

- Generates only three materials: a start instruction, a task execution protocol, and a continuation/migration summary.
- Must not request Node.js, npm, CLI usage, local directories, files, manifests, version checks, or upgrades.
- Must state that continuity is manual: users save the summary and paste it into the next conversation.
- Must include a migration package with project brief, current decisions, open questions, and next step.
- When work becomes complex, long-running, collaborative, knowledge-heavy, or auditable, it guides the user to initialize `local-agent-project` in a command-capable local agent.

For `web-design-standard`, the start instruction is a complete standalone web-design prompt. It includes task input fields, the default product-web direction and tokens, desktop and mobile rules, component rules, prohibitions, delivery expectations, self-checking, brand-priority handling, and a manual continuation-summary format. It never asks a chat user to create local files.

## Filesystem Layout

```text
targets/
  local-agent-project/
    target.yaml
    files/
      AGENTS.md.tpl
    locales/
      zh/AGENTS.integration.md.tpl
      en/AGENTS.integration.md.tpl
  chat-mobile/
    target.yaml
    locales/
      zh/files/
      en/files/
```

`target.yaml` contains the target id, version, type, description, and optional aliases. Shared `files/` are locale-neutral. User-facing target files belong in `locales/<locale>/files/`.

`AGENTS.integration.md.tpl` is a localized, non-output partial used only when an external root `AGENTS.md` needs a RecoWork block. It is never copied into the initialized project as a standalone file.

## Compatibility

The following discontinued brand targets map to the generic environments for CLI compatibility:

| Legacy target | Maps to |
| --- | --- |
| `chatgpt-chat`, `claude-chat`, `kimi-doubao-chat` | `chat-mobile` |
| `codex-project`, `cursor-project`, `claude-code-project`, `notion-workspace`, `feishu-doc` | `local-agent-project` |

Existing generated workspaces are user-owned. `rw add` refuses a destination that already contains `rw-manifest.json`; use `rw status` and `rw upgrade` for an existing workflow. RecoWork never deletes, moves, or overwrites existing workspace files during initialization or upgrade. Legacy chat manifests receive a read-only migration guide that initializes a separate local workflow. A release that removes a brand-specific target is a breaking change and must document migration guidance.

`idea-to-project` uses these target contracts as one staged user workflow. The local target generates a unified workspace with exploration/validation first and project advancement only after explicit user confirmation, including a localized current list for restartable parked ideas. The chat target still generates only the three lightweight materials; its start instruction must identify the current stage, distinguish a restartable parked direction from an open question or archived decision, require an explicit project-entry gate, and include parked directions with restart conditions in the manual summary.

`idea-engineering` and `project-engineering` are retired template IDs. Existing generated workspaces remain untouched. Status and upgrade commands print a read-only guide to initialize `idea-to-project` in a separate destination; they never attempt an in-place conversion.

## Locale Rules

- Use `--locale zh` or `--locale en` for user-facing generated content.
- Locale may translate user-facing folder and document names.
- Keep `AGENTS.md`, `README.md`, `index.md`, and `rw-manifest.json` unchanged.

## CLI Examples

```bash
rw add idea-to-project --target local-agent-project --locale zh .
rw add learning --target local-agent-project --locale en ./langchain-study
rw add idea-to-project --target chat-mobile --locale zh ./idea-chat-kit
rw view ./my-local-workflow
```

`rw view` is a local read-only companion for a directory containing a RecoWork workspace or Markdown files. It is not a target and does not generate a documentation site, write configuration, or change initialized output. It reads `index.md` for normal navigation, localizes its UI from the detected workspace locale, and keeps `归档/` or `archive/` outside the default current-work view. It provides URL document routes, scope-aware full-text search, compact overview metadata, breadcrumbs, previous/next navigation, and GitHub-flavored Markdown with raw HTML disabled. Local-agent instructions direct a command-capable agent to run `npx --yes recowork@latest view .` from the initialized project root after initialization and whenever the user asks to browse or review the workspace; the agent reports the local URL instead of requiring terminal use or a global install. A running viewer is reused only for the same resolved workspace.
