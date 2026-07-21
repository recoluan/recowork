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
- Durable knowledge belongs in canonical documents inside the template workspace, not in a separate `knowledge/` or `知识库/` directory. Agents update the affected `index.md` when consolidating verified conclusions.

### `chat-mobile`

This is an intentionally limited conversation workflow, not a local-project substitute.

- Generates only three materials: a start instruction, a task execution protocol, and a continuation/migration summary.
- Must not request Node.js, npm, CLI usage, local directories, files, manifests, version checks, or upgrades.
- Must state that continuity is manual: users save the summary and paste it into the next conversation.
- Must include a migration package with project brief, current decisions, open questions, and next step.
- When work becomes complex, long-running, collaborative, knowledge-heavy, or auditable, it guides the user to initialize `local-agent-project` in a command-capable local agent.

## Filesystem Layout

```text
targets/
  local-agent-project/
    target.yaml
    files/
      AGENTS.md.tpl
  chat-mobile/
    target.yaml
    locales/
      zh/files/
      en/files/
```

`target.yaml` contains the target id, version, type, description, and optional aliases. Shared `files/` are locale-neutral. User-facing target files belong in `locales/<locale>/files/`.

## Compatibility

The following discontinued brand targets map to the generic environments for CLI compatibility:

| Legacy target | Maps to |
| --- | --- |
| `chatgpt-chat`, `claude-chat`, `kimi-doubao-chat` | `chat-mobile` |
| `codex-project`, `cursor-project`, `claude-code-project`, `notion-workspace`, `feishu-doc` | `local-agent-project` |

Existing generated workspaces are user-owned. `rw add` refuses a destination that already contains `rw-manifest.json`; use `rw status` and `rw upgrade` for an existing workflow. RecoWork never deletes, moves, or overwrites existing workspace files during initialization or upgrade. Legacy chat manifests receive a read-only migration guide that initializes a separate local workflow. A release that removes a brand-specific target is a breaking change and must document migration guidance.

## Locale Rules

- Use `--locale zh` or `--locale en` for user-facing generated content.
- Locale may translate user-facing folder and document names.
- Keep `AGENTS.md`, `README.md`, `index.md`, and `rw-manifest.json` unchanged.

## CLI Examples

```bash
rw add project --target local-agent-project --locale zh .
rw add learning --target local-agent-project --locale en ./langchain-study
rw add idea --target chat-mobile --locale zh ./idea-chat-kit
```
