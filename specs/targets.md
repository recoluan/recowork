# Targets Standard

RecoWork uses targets to describe where generated workflow assets will be used and how they should be delivered.

A target is not just a platform brand. It is a concrete output environment with a specific usage mode and file convention.

## Core Model

```text
template + target + locale = initialized workflow
```

- `template` answers: what work scenario is this for?
- `target` answers: where will the user use it, and what files or copyable content should be generated?
- `locale` answers: which language and user-facing naming convention should be generated?

Examples:

```text
project-engineering + codex-project = project rules, knowledge files, skills
project-engineering + claude-code-project = CLAUDE.md, .claude/skills, project instructions
project-engineering + claude-chat = copyable Claude instructions
learning-engineering + notion-workspace = markdown workspace pages
general-ai-workflow + chatgpt-chat = copyable prompts and memory cards
project-engineering + codex-project + en = English project workflow files
project-engineering + codex-project + zh = Chinese project workflow files
```

## Target Naming

Target IDs must include both the tool family and the usage surface.

Good:

- `chatgpt-chat`
- `chatgpt-mobile-chat`
- `claude-chat`
- `claude-code-project`
- `codex-project`
- `cursor-project`
- `notion-workspace`
- `feishu-doc`

Avoid:

- `claude`
- `chatgpt`
- `codex`
- `mobile`

Brand-only names are ambiguous because the same brand can have multiple surfaces.

## Target Types

Every target must declare one primary type:

- `chat`: generates copyable prompts, memory cards, and instructions.
- `project`: generates files inside a local project repository.
- `workspace`: generates documentation or knowledge workspace pages.
- `doc`: generates copyable document templates.

The type controls where files are allowed to go.

## Directory Contract

Each target must include `target.yaml` and may use shared files when it has convention-driven or locale-neutral output:

```text
targets/<target-id>/
├── target.yaml
└── files/
    └── ...
```

Targets may also localize user-facing output paths and static content:

```text
targets/<target-id>/
├── target.yaml
├── files/                     # optional: convention-driven or locale-neutral output only
└── locales/
    ├── en/files/
    └── zh/files/
```

The CLI renders shared `files/` first, then renders `locales/<locale>/files/`. Use localized target files for user-facing filenames, directories, and static text such as prompts, workspace templates, and knowledge documents. Keep tool conventions and machine files unchanged, including `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `.claude/`, and `rw-manifest.json`.

`target.yaml`:

```yaml
id: claude-code-project
name: Claude Code Project
type: project
description: Generates Claude Code project instructions and project-scoped skills.
aliases:
  - claude-code
  - claude-project
```

Template variables allowed in `files/`:

- `{{template_id}}`
- `{{template_name}}`
- `{{template_description}}`
- `{{target}}`
- `{{audience}}`
- `{{outputs}}`

Files ending with `.tpl` are rendered and written without the `.tpl` suffix.

## Placement Rules

Targets must follow real platform conventions. Do not invent hidden directories or file locations because they look tidy.

Convention-driven filenames must stay unchanged. Do not translate names such as `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `README.md`, or `index.md`.

Reusable template methodology should be referenced as `工作方法/`.

Project targets:

- May write project-level files.
- May write tool-specific hidden directories only when the tool officially uses them.
- Must keep generated files scoped and predictable.
- Must include `rw-manifest.json`.

Chat targets:

- Should generate copyable prompt files.
- Should not create project tool directories such as `.claude/`, `.codex/`, or `.cursor/`.
- Should favor short prompts that instruct AI to run the CLI when possible.

Workspace/doc targets:

- Should generate markdown pages or document templates.
- Should not assume local coding-tool behavior.

## Platform-Specific Notes

### Claude Chat

Use `claude-chat` for Claude web or mobile chat usage.

Expected outputs:

- `project-instructions.md`
- copyable task prompts
- continuation memory

Do not create `.claude/` for this target.

### Claude Code Project

Use `claude-code-project` for local Claude Code project initialization.

Expected outputs:

```text
CLAUDE.md
.claude/
  skills/
    <skill-name>/
      SKILL.md
rw-manifest.json
```

Project instructions belong in `CLAUDE.md`. Project-scoped skills belong in `.claude/skills/<skill-name>/SKILL.md`.

Not all knowledge files must live inside `.claude/`. Durable project knowledge can live in a template-defined location such as `knowledge/` or `docs/ai/` if that is clearer for users.

### Codex Project

Use `codex-project` for Codex-style local project workflows.

Expected outputs:

- `AGENTS.md`
- project knowledge files
- project skills if supported by the target convention
- `rw-manifest.json`

The target must reflect the actual Codex project convention used by RecoWork. Do not copy Claude Code placement rules into Codex.

### Cursor Project

Use `cursor-project` for Cursor coding workflows.

Expected outputs should follow Cursor's current project rules convention. The target must avoid generic `rules.md` if a more precise Cursor path is required.

### ChatGPT Chat

Use `chatgpt-chat` or `chatgpt-mobile-chat` for ChatGPT web/mobile copyable workflows.

Expected outputs:

- init prompt
- task prompt
- continuation memory card
- review checklist

Do not create local project configuration directories for this target.

## CLI Contract

Preferred command:

```bash
rw add <template> --target <target> [--locale <locale>] <destination>
```

Compatibility command:

```bash
rw add <template> --platform <legacy-platform> <destination>
```

Legacy `platform` names should map to targets only when the mapping is unambiguous. If a legacy name is ambiguous, the CLI should ask for a concrete target or fail with a helpful message.

Examples:

```bash
rw add project --target codex-project --locale en .
rw add project --target claude-code-project --locale zh .
rw add project --target claude-chat ./claude-prompts
rw add learning --target notion-workspace ./learning
rw add general --target chatgpt-chat ./chat-prompts
```

## Acceptance Checklist

Before adding or changing a target:

- The target ID includes both tool family and usage surface.
- The generated file locations follow real platform conventions.
- Chat targets do not generate project directories.
- Project targets do not generate copy-only prompt bundles as their primary output.
- The target has a `target.yaml`.
- The target has at least one real initialization test.
- README, prompt templates, and website copy are updated if the target is user-facing.
