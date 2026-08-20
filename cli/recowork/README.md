# recowork CLI

`recowork` installs the `rw` command for initializing RecoWork templates.

## Install or Run

```bash
npx --yes recowork@latest list
npx --yes recowork@latest targets
npx --yes recowork@latest add project --target local-agent-project --locale zh .
```

These commands fetch the current package for the run and need no global installation. After installing RecoWork globally, you may use `rw` instead.

## Templates

| Template | Aliases | Purpose |
| --- | --- | --- |
| `idea-to-project` | `idea`, `project`, `from-idea-to-project` | Staged exploration, validation, direction confirmation, and project advancement. |
| `learning-engineering` | `learning`, `study`, `course` | Structured learning workflow. |
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

rw add idea-to-project --target local-agent-project --locale zh .
rw add learning --target local-agent-project --locale en ./langchain-study
rw add idea-to-project --target chat-mobile --locale zh ./idea-chat-kit
rw add web-design --target local-agent-project --locale zh ./product-site

rw status .
rw upgrade --check .
rw upgrade --apply .

rw view .
rw view ./langchain-study --port 4311 --no-open
```

Chat targets do not create a manifest and do not support status or upgrade commands.

## Read A Local Workspace

`rw view [directory]` opens a zero-configuration local Markdown viewer for a RecoWork workspace. It runs only on `127.0.0.1`, follows `index.md` for current-work navigation, supports shareable document links, full-text search, breadcrumbs, previous/next navigation, and GitHub-flavored Markdown, and keeps `archive/` or `归档/` behind an explicit toggle. It is read-only: it never writes configuration, generates a documentation site, or changes workspace files. Generated local-agent instructions tell the agent to run `npx --yes recowork@latest view .` itself after initialization or when the user asks to browse the workspace; a running viewer for the same workspace is reused automatically.

## Upgrade Safety

Generated workspaces belong to the user. `rw add` refuses an existing RecoWork destination; use `rw upgrade` instead. `rw upgrade --apply` updates only unchanged method or target files. It never overwrites, moves, or deletes workspace files. Missing workspace files require explicit `--scope workspace --add-missing`. Legacy Chat manifests print a migration guide for a separate local workflow.

Source and website: [RecoWork](https://github.com/recoluan/recowork)
