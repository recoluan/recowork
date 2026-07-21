# RecoWork

RecoWork turns practical AI workflows into reusable templates that can be initialized for the tool and environment a user actually uses.

It is not a prompt collection. A RecoWork template defines the work scenario; a target defines where the workflow will be used; a locale defines the generated language and user-facing paths. The CLI combines them into real output.

## Why

Using AI well often fails for engineering reasons:

- prompts are scattered and hard to reuse;
- AI forgets context between sessions;
- every tool expects different files or prompt formats;
- project knowledge is rarely captured;
- users need repeatable workflows, not one-off answers.

RecoWork keeps the workflow method in one place and keeps output rules reusable.

## Architecture

```text
.
├── templates/        # scenario templates
├── targets/          # reusable output targets
├── cli/              # rw command implementation
├── prompts/          # short prompts that ask AI to run the CLI
├── docs/             # GitHub Pages static site
├── specs/            # product and engineering specs
├── AGENTS.md         # AI agent project guide
└── package.json
```

Templates describe the work scenario:

| Template | Purpose |
| --- | --- |
| `general-ai-workflow` | Daily AI work with a role contract, task context, continuation memory, review, and fresh reusable task records. |
| `project-engineering` | Project-level AI workflow with rules, document and artifact freshness standards, progressive retrieval, knowledge capture, and quality gates. |
| `learning-engineering` | Structured learning with learner diagnosis, a roadmap, lessons, practice, projects, feedback, and fresh durable learning records. |

The next architecture standard calls these reusable output definitions targets. Target IDs describe the output environment:

- `chatgpt-chat`
- `claude-chat`
- `claude-code-project`
- `codex-project`
- `cursor-project`
- `notion-workspace`
- `feishu-doc`

The target standard is documented in [specs/targets.md](./specs/targets.md).

## CLI Usage

The npm package name is `recowork`; the executable command is `rw`.

Preferred usage:

```bash
npx recowork list
npx recowork targets
npx recowork add project --target codex-project --locale en .
npx recowork add project --target claude-code-project --locale zh .
npx recowork add general --target chatgpt-chat --locale en ./my-ai-workflow
npx recowork add learning --target chatgpt-chat --locale en ./my-learning-workflow
```

Legacy platform compatibility is still available for older commands:

```bash
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
node cli/recowork/bin/rw.js add project --target codex-project --locale en .
```

`rw init` can remain as a compatibility alias for `rw add`.

Use `--locale zh` or `--locale en` when a template supports multiple languages. Locale applies to user-facing template and target files, such as Chinese `知识库/` or English `knowledge/`. If omitted, the template default is used.

## Upgrade An Existing Workflow

New workflows include a versioned `rw-manifest.json` so RecoWork can identify generated-file changes without taking ownership of project work.

```bash
npx recowork status .
npx recowork upgrade --check .
npx recowork upgrade --plan .
npx recowork upgrade --apply .
```

`--check` and `--plan` are read-only and respect `--scope`. `--apply` updates only unchanged working-method and target files. Workspace documents are always user-owned: RecoWork never overwrites, moves, deletes, or restores them. To add a newly introduced, currently missing workspace template, use the explicit opt-in below; it creates an upgrade report under `.recowork/upgrade-reports/` for manual review without modifying the workspace.

```bash
npx recowork upgrade --apply --scope workspace --add-missing .
```

Older workflows use a legacy manifest. Record a baseline first without changing project files:

```bash
npx recowork upgrade --adopt .
```

## Prompt Usage

Prompt mode should not ask AI to recreate the whole template in chat. It should ask AI to install or run the CLI first:

```text
Please initialize RecoWork template `project-engineering` for target `codex-project`.
Run:
npx recowork add project-engineering --target codex-project --locale en .

If npx is unavailable, use:
https://github.com/recoluan/recowork
templates/project-engineering/
targets/codex-project/
```

Full prompt templates:

- `prompts/init-package.md`
- `prompts/init-package.zh.md`

## Specs

Product and engineering specs live in [specs](./specs/):

- [Targets Standard](./specs/targets.md)
- [Requirements Log](./specs/requirements.md)
- [Architecture Decisions](./specs/decisions.md)

Update these specs whenever a change introduces a new target, CLI behavior, template convention, or user-facing rule.

## Changelog

Release history is available in [CHANGELOG.md](./CHANGELOG.md) and [CHANGELOG.zh.md](./CHANGELOG.zh.md). The same bilingual record is published on the [release notes page](https://recoluan.github.io/recowork/releases.html).

## Development

Validation commands:

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
node cli/recowork/bin/rw.js add project --target codex-project --locale en /private/tmp/recowork-project-test
```

## License

MIT
