# RecoWork

**Help the AI agent you already use keep finishing real work.**

RecoWork is a layer of work standards and project facts for people and AI agents. It does not replace an agent runtime, host models, run tasks in the background, or manage your API keys.

It fixes the task, professional standards, current facts, review criteria, and handoff so a useful conversation can become work that is easier to continue, inspect, and reuse.

[中文说明](./README.zh.md) · [Website](https://recoluan.github.io/recowork/) · [Usage guide](https://recoluan.github.io/recowork/usage.html)

## What It Helps With

| Real work | What RecoWork preserves | Current template |
| --- | --- | --- |
| Move a project forward | Briefs, open questions, designs, decisions, reviews | `project-engineering` |
| Learn with evidence | Diagnosis, roadmap, practice, projects, retrospectives | `learning-engineering` |
| Turn an idea into a direction | Problem framing, hypotheses, validation, next decisions | `idea-engineering` |
| Improve web-page quality | Design direction, responsive rules, component states, self-review | `web-design-standard` |

The web design standard is a separate reusable standard. It is being validated independently, rather than treated as another project-workflow scenario.

## Two Environments

### Local executable agent

Use this for long-running projects, code, complex learning, and work that needs durable facts or reviewability. RecoWork initializes a root `AGENTS.md`, working methods, a localized workspace where applicable, and a versioned manifest in the directory you choose.

### Chat / Mobile

Use this for fast starts, temporary tasks, and lightweight conversations. It produces only a start instruction, task execution protocol, and continuation or migration summary. It does not ask for Node.js, a CLI, local folders, automatic persistence, upgrades, or file-level traceability.

Chat continuity is manual: save and paste the continuation summary into the next conversation. When work becomes long-running, collaborative, knowledge-heavy, or auditable, use the migration package to start a separate local workflow.

## Start a Local Workflow

In a command-capable local agent, initialize a workflow deterministically:

```bash
npx recowork add project --target local-agent-project --locale en .
```

Choose another scenario or locale as needed:

```bash
npx recowork list
npx recowork add learning --target local-agent-project --locale en ./my-learning-work
npx recowork add idea --target local-agent-project --locale en ./idea-work
```

`rw` is the installed command alias. Use `npx recowork` when you do not have the package installed globally.

## Start Through an Agent

For a local agent that can run commands, paste this instruction:

```text
Initialize a RecoWork project workflow in the current directory.

Repository: https://github.com/recoluan/recowork
Run: npx recowork add project --target local-agent-project --locale en .

First verify Node.js and npm. If either is unavailable or outdated, explain the blocker and ask for confirmation before installing the latest stable Node.js. Preserve any existing root AGENTS.md and verify that RecoWork adds only its marker-bounded integration block. Then show the created files and the first working step.
```

For a pure chat or mobile environment, use the website selector to generate a copyable chat start instruction. Do not use the CLI or simulate local files in that environment.

## Boundaries

- You control the agent; RecoWork does not run it for you.
- Local files stay in the location you choose.
- AI output, recommendations, and changes still require human review.
- RecoWork does not claim automatic memory, unlimited execution, or unattended completion.
- Specific agent products are not presented as officially supported unless compatibility has been verified.

## Development

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
```

Product and target conventions are recorded in [specs/requirements.md](./specs/requirements.md), [specs/targets.md](./specs/targets.md), and [specs/decisions.md](./specs/decisions.md). See [CHANGELOG.md](./CHANGELOG.md) for unreleased and published changes.
