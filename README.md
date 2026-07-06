# RecoWork

RecoWork is a toolkit for packaging practical AI workflows into reusable, platform-ready work systems.

It is not a prompt collection. A RecoWork package gives users the prompts, project rules, knowledge templates, memory cards, and usage steps needed to use AI more consistently across different tools.

## Why

Many people can access powerful AI tools, but using them well is still hard:

- prompts are scattered and hard to reuse;
- AI forgets context between sessions;
- different tools require different formats;
- project knowledge is rarely captured;
- users often need workflows, not just one-off answers.

RecoWork solves this by turning repeatable AI work into workflow packs that can be initialized for the tool a user already uses.

## Packages

The first three workflow packs are:

| Package | Purpose | Typical users |
| --- | --- | --- |
| `general-ai-workflow` | Daily AI use with prompts, task cards, continuation memory, and review checklists. | ChatGPT Mobile, Claude Mobile, Kimi, Doubao users |
| `project-engineering` | Project-level AI workflow with `AGENTS.md`, skills, knowledge folders, and quality gates. | Codex, Cursor, Claude Code, developer workflows |
| `learning-engineering` | Structured learning workflow with roadmaps, chapters, exercises, feedback, and progress tracking. | learners, teachers, training workflows |

Each package describes a work scenario. It can then be exported for a target platform such as ChatGPT Mobile, Codex, Cursor, or Notion / Feishu.

## Supported Tools

Current platform outputs include:

- `chatgpt-mobile`
- `claude-mobile`
- `kimi-doubao`
- `codex`
- `cursor`
- `notion-feishu`

The same workflow pack can produce different files depending on the selected platform.

## Two Ways to Use a Pack

RecoWork supports both prompt-first users and project/CLI users.

### 1. Prompt Init Mode

Use this when you do not want to run a CLI. Copy one initialization prompt into an AI coding assistant or a chat AI, then tell it which package and platform you want.

The prompt needs a source repository URL so the AI knows where to read the package from. After publishing this project to GitHub, replace the placeholder with your real repository URL.

Prompt template:

```text
prompts/init-package.md
```

Typical flow:

1. Open `prompts/init-package.md`.
2. Replace the source repository URL, package, target platform, and target location.
3. Paste the prompt into an AI assistant.
4. The AI generates the needed files or copy-ready content.
5. Review the generated file tree and start from the generated README.

Prompt Init Mode is best for users who want the package initialized by an AI assistant without installing anything locally.

If the AI assistant cannot access the GitHub repository, paste the relevant files from `packages/<pack>/` into the conversation and ask it to initialize from those files.

### 2. CLI Init Mode

Use this when you want RecoWork to create files for a project or workspace automatically. This is best for Codex, Cursor, Notion / Feishu, or structured local workflows.

## Repository Structure

```text
.
├── packages/
│   ├── general-ai-workflow/
│   ├── project-engineering/
│   └── learning-engineering/
├── cli/
│   └── recowork/
└── docs/
    ├── index.html
    ├── styles.css
    └── app.js
```

Package structure:

```text
packages/<pack>/
├── pack.yaml
├── README.md
├── core/
├── adapters/
└── examples/
```

- `pack.yaml` describes who the pack is for, what it solves, and which tools it supports.
- `core/` stores the reusable workflow method for the scenario.
- `adapters/` stores tool-specific versions.
- `examples/` stores real usage examples.

## CLI Usage

The CLI package is named `recowork`; the executable command is `rw`.

Run it directly from this repository:

```bash
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js platforms
node cli/recowork/bin/rw.js show project
```

Initialize a workflow pack:

```bash
node cli/recowork/bin/rw.js init general --platform chatgpt-mobile ./my-ai-workflow
node cli/recowork/bin/rw.js init project --platform codex .
node cli/recowork/bin/rw.js init learning -p notion ./langchain-study
```

If installed as a package later, the commands are intended to look like:

```bash
rw list
rw platforms
rw init project --platform codex .
```

## Website

The static website lives in `docs/` and is designed for GitHub Pages.

Open locally:

```text
docs/index.html
```

It introduces the project, the three starter workflow packs, supported tools, and CLI usage. The site supports English and Chinese.

## Development Notes

Current validation commands:

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js platforms
```

Example initialization checks:

```bash
node cli/recowork/bin/rw.js init project --platform codex /private/tmp/recowork-project-test
node cli/recowork/bin/rw.js init learning -p notion /private/tmp/recowork-learning-test
```

## License

MIT
