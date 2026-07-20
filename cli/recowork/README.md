# RecoWork CLI

`recowork` initializes reusable AI workflows for the environment where they will actually be used. Its executable command is `rw`.

A template defines the work scenario. A target defines the AI product or output location. A locale defines the generated language.

## Documentation

- [Website and guided setup](https://recoluan.github.io/recowork/)
- [GitHub repository](https://github.com/recoluan/recowork)
- [Complete project README](https://github.com/recoluan/recowork#readme)
- [Release notes](https://recoluan.github.io/recowork/releases.html)

This document is the command reference for the bundled CLI. The root README is the product-level source of truth for workflow concepts, targets, prompts, and development guidance.

## Run

Use `npx` without a global install:

```bash
npx recowork list
npx recowork targets
```

To install the command globally:

```bash
npm install --global recowork
rw list
```

When working from this repository, run the local entry point:

```bash
node bin/rw.js list
```

## Initialize A Workflow

`rw add` is the preferred command. It writes the selected template and target files into the destination directory.

```bash
rw add <template> --target <target> [--locale <zh|en>] <destination>
```

Examples:

```bash
# Create a Codex-oriented project workflow in the current directory.
rw add project --target codex-project --locale zh .

# Create a Claude Code project workflow in a new directory.
rw add project --target claude-code-project --locale en ./my-project

# Create a ChatGPT workflow with copyable prompts.
rw add general --target chatgpt-chat --locale zh ./my-ai-workflow

# Create a structured learning workspace.
rw add learning --target notion-workspace --locale en ./langchain-study
```

`rw init` is a compatibility alias for `rw add`.

## Initialize Through AI

For Codex, Cursor, Claude Code, or another command-capable assistant, ask the AI to run the CLI rather than recreating workflow files by hand:

```text
Please initialize RecoWork template `project-engineering` for target `codex-project`.

Repository:
https://github.com/recoluan/recowork

Run:
npx recowork add project-engineering --target codex-project --locale en .
```

For mobile or web chat use, initialize a chat target and paste the generated prompt into the selected AI product. The [website setup guide](https://recoluan.github.io/recowork/usage.html) lets users compose the matching command or initialization prompt.

## Upgrade An Existing Workflow

New workflows include a versioned `rw-manifest.json` that records generated-file baselines.

```bash
rw status .
rw upgrade --check .
rw upgrade --plan .
rw upgrade --apply .
```

Checks and plans are read-only and respect `--scope`. Apply updates only unchanged methods and target files. Workspace documents are user-owned and are never overwritten, moved, deleted, or restored. To add a newly introduced workspace file that is missing, opt in explicitly:

```bash
rw upgrade --apply --scope workspace --add-missing .
```

This writes an upgrade report under `.recowork/upgrade-reports/` for manual review without modifying the workspace. For a legacy workflow, establish a baseline without changing files:

```bash
rw upgrade --adopt .
```

## Templates

| ID | Alias | Use case |
| --- | --- | --- |
| `general-ai-workflow` | `general`, `ai`, `mobile` | Durable everyday AI tasks with role, context, review, and continuation memory. |
| `project-engineering` | `project`, `engineering`, `codex` | AI-assisted projects with working rules, knowledge capture, review, and project skills. |
| `learning-engineering` | `learning`, `study`, `course` | Structured learning with a learner brief, roadmap, lessons, practice, and retrospectives. |

Inspect a template before initializing it:

```bash
rw show project
```

## Targets

| Target | Output |
| --- | --- |
| `chatgpt-chat` | Copyable prompts and continuation memory for ChatGPT web or mobile. |
| `claude-chat` | Claude chat instructions and prompts. |
| `kimi-doubao-chat` | Concise Chinese prompts for Kimi, Doubao, and similar chat AI. |
| `codex-project` | Project instructions, knowledge files, and review assets for Codex-style work. |
| `cursor-project` | Lightweight project rules for Cursor-style coding workflows. |
| `claude-code-project` | `CLAUDE.md` plus project-scoped Claude Code skills. |
| `notion-workspace` | A Markdown workspace outline for Notion-style documentation. |
| `feishu-doc` | Markdown documents ready to copy into Feishu or Lark. |

Use `rw targets` to list targets or `rw show-target <target>` to inspect one. Target aliases such as `chatgpt`, `claude`, `codex`, `cursor`, `notion`, and `feishu` are also accepted.

## Language

Templates currently support Chinese and English:

```bash
rw add project --target codex-project --locale zh .
rw add project --target codex-project --locale en .
```

If `--locale` is omitted, the template default is used.

## Compatibility

Older platform-based commands remain available:

```bash
rw platforms
rw add project --platform codex .
```

Use `--target` for new integrations. Targets describe the concrete output environment and can distinguish chat, project, workspace, and document use cases.

## Command Reference

```text
rw list
rw targets
rw show <template>
rw show-target <target>
rw add <template> --target <target> [--locale <locale>] <destination>
rw init <template> --target <target> [--locale <locale>] <destination>
rw status <destination>
rw upgrade [--check|--plan|--apply] [--scope <methods,target,workspace>] [--add-missing] <destination>
rw upgrade --adopt <destination>
rw platforms
```

Run `rw --help` for the current command help.

## Related Documentation

- [RecoWork overview](../../README.md)
- [Target standard](../../specs/targets.md)
- [Product requirements](../../specs/requirements.md)
