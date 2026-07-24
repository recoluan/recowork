# recowork CLI

`recowork` installs the `rw` command for initializing RecoWork templates.

## Install or Run

```bash
npx recowork list
npx recowork targets
npx recowork add project --target local-agent-project --locale zh .
```

After installation, use `rw` instead of `npx recowork`.

## Templates

| Template | Aliases | Purpose |
| --- | --- | --- |
| `idea-engineering` | `idea`, `brainstorm`, `explore` | Idea exploration, validation, and next-step agreement. |
| `learning-engineering` | `learning`, `study`, `course` | Structured learning workflow. |
| `project-engineering` | `project`, `engineering` | Durable project workflow with methods, workspace records, and quality gates. |
| `web-design-standard` | `web-design`, `design-standard`, `web-ui` | Reusable product-web design guidance for HTML and web-page work. |

## Environments

| Target | What it creates |
| --- | --- |
| `local-agent-project` | Tool-neutral `AGENTS.md`, methods, workspace records, and `rw-manifest.json` for a command-capable local agent. |
| `chat-mobile` | A start instruction, task protocol, and manual continuation/migration summary for any chat or mobile AI app. |

Brand names such as `codex-project`, `claude-code-project`, and `chatgpt-chat` are retained as compatibility aliases. They now resolve to one of the two generic targets and no longer create brand-specific files.

If the local destination already has a root `AGENTS.md`, `rw add` keeps the existing content and adds a marker-bounded RecoWork block for the selected template. The manifest tracks that block separately; upgrades update only an unchanged block and preserve user edits.

## Commands

```bash
rw list
rw targets
rw show project
rw show-target local-agent-project

rw add project --target local-agent-project --locale zh .
rw add learning --target local-agent-project --locale en ./langchain-study
rw add idea --target chat-mobile --locale zh ./idea-chat-kit
rw add web-design --target local-agent-project --locale zh ./product-site

rw status .
rw upgrade --check .
rw upgrade --apply .
```

Chat targets do not create a manifest and do not support status or upgrade commands.

## Upgrade Safety

Generated workspaces belong to the user. `rw add` refuses an existing RecoWork destination; use `rw upgrade` instead. `rw upgrade --apply` updates only unchanged method or target files. It never overwrites, moves, or deletes workspace files. Missing workspace files require explicit `--scope workspace --add-missing`. Legacy Chat manifests print a migration guide for a separate local workflow.

Source and website: [RecoWork](https://github.com/reco-dev/recowork)
