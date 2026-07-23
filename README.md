# RecoWork

RecoWork turns repeatable AI work into reusable, engineered workflows. It provides templates for daily tasks, idea exploration, learning, projects, and web design standards, with explicit confirmation, self-review, fresh records, and a clean handoff between chat and local work.

中文说明：[README.zh.md](./README.zh.md) | Website: [RecoWork](https://recowork.recoluan.com)

## Two Environments

| Environment | Use it when | What it delivers |
| --- | --- | --- |
| `local-agent-project` | Work needs to persist, evolve, be reviewed, or be upgraded | `AGENTS.md`, working methods, an indexed workspace, intermediate artifacts, and `rw-manifest.json`. |
| `chat-mobile` | You need a low-friction workflow in any web, app, or mobile chat | A start instruction, task protocol, and a manually saved continuation/migration summary. |

The local workflow is tool-neutral and can be used by a command-capable agent such as Codex, Claude Code, or Cursor. It intentionally does not generate platform-specific skills or configuration directories.

When a local destination already has a root `AGENTS.md`, RecoWork preserves it and automatically appends a marker-bounded, template-specific RecoWork block. Existing project rules outside that block take priority. Upgrades only update an unchanged RecoWork block and report user edits instead of overwriting them.

Chat continuity is manual. Save the summary and paste it into the next conversation. When work becomes long-running, collaborative, knowledge-heavy, or auditable, use the included migration package to move into a local agent.

## Templates

| Template | Use case |
| --- | --- |
| `general-ai-workflow` (`general`) | Daily tasks that need context, review, and continuity. |
| `idea-engineering` (`idea`) | Brainstorming, direction synthesis, hypothesis validation, and a confirmed next step. |
| `learning-engineering` (`learning`) | Learning diagnosis, roadmap, lessons, practice, and retrospectives. |
| `project-engineering` (`project`) | AI-assisted projects with working methods, document standards, workspace records, and quality gates. |
| `web-design-standard` (`web-design`) | A reusable restrained product-web standard for AI-generated or improved HTML and web pages. |

## Initialize With CLI

```bash
npx recowork add project --target local-agent-project --locale en .
npx recowork add learning --target local-agent-project --locale zh ./langchain-study
npx recowork add idea --target chat-mobile --locale en ./idea-chat-kit
npx recowork add web-design --target local-agent-project --locale en ./product-site
```

`rw` is the installed command. Run `rw list` and `rw targets` to inspect available templates and environments.

## Initialize Through AI

For a local command-capable agent, paste this prompt:

```text
Initialize the RecoWork `project-engineering` template for the `local-agent-project` environment in English in the current directory.

First check whether Node.js and npm are available. If they are missing or outdated, explain the situation and ask for my confirmation before installing the latest stable Node.js. After confirmation, run:

npx recowork add project-engineering --target local-agent-project --locale en .

Then inspect the generated files and tell me the first decision you need from me. Repository source: https://github.com/recoluan/recowork
```

For a web or mobile chat, initialize the `chat-mobile` target and paste its `start-instruction` into the conversation. It does not require Node.js, a CLI, or local files.

## Durable Records

RecoWork does not create a separate knowledge base. Verified conclusions belong in the appropriate canonical document inside the generated workspace. Each affected `index.md` is updated so agents retrieve context progressively instead of loading every document at once.

## Upgrades

`rw add` refuses a directory that already contains `rw-manifest.json`; use `rw status <directory>` and `rw upgrade --check <directory>` for an existing workflow. `rw upgrade --apply` only updates unchanged method or target files. User-owned workspace files are never overwritten, moved, or deleted. Legacy Chat workflows receive a migration guide that creates a separate local workflow.

See [specs/targets.md](./specs/targets.md), [specs/requirements.md](./specs/requirements.md), and [CHANGELOG.md](./CHANGELOG.md) for the durable product contract.
