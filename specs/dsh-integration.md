# DeepSeek Harness Integration Contract

## Purpose

`recowork-dsh` is an experimental, optional DeepSeek Harness (DSH) Bundle. It makes RecoWork easier to invoke from a DSH conversation; it does not create a new RecoWork target, agent runtime, model host, or replacement for the `rw` CLI.

## Current Scope

The Bundle exposes exactly three model-facing tools:

- `recowork_init`: initialize a new `local-agent-project` workflow using the existing RecoWork CLI.
- `recowork_status`: read a concise status from a previously initialized workflow.
- `recowork_import`: safely connect an existing non-empty project using `rw import` without overwriting existing paths.

The Bundle has no automatic upgrade, background jobs, model/provider integration, arbitrary shell execution, arbitrary file reads, writes outside explicitly confirmed initialization or import, deletion, moving, renaming, or workspace repairs. Its DSH Web UI is a collapsible project cockpit with one primary dashboard and two secondary flows:

- The dashboard offers only direct-child directories containing a valid `rw-manifest.json` as selectable workspaces and automatically performs the same authorized read-only status call when the selection changes. It leads with a continuation action carrying the complete workspace protocol, then shows blocking decisions derived from the open-questions document, the current workflow stage, and up to three stable bullet items from the project brief as project memory. A task may be queued into the current DSH session through DSH's public session API or copied for a different conversation. The cockpit never stores task state, executes a task itself, or claims that a copied package created a new DSH session.
- Status and settings retain the selected approved root, manifest metadata, document health, recognized current-document names, and a manual refresh. This is secondary diagnostic information rather than the primary product experience and remains a read-only summary rather than a general file browser.
- The add-project view separates new-workspace initialization from existing-project import. New workspace submits only a supported template, locale, approved root, and relative destination to `recowork_init`. Import lists only direct-child, non-empty directories without `rw-manifest.json`, then submits the selected project, template, and locale to `recowork_import`. Each mode has its own explicit confirmation and the server independently rejects an unconfirmed request.

The UI cannot edit an initialized RecoWork workspace. New-workspace initialization still rejects a non-empty destination. Import accepts only an existing non-empty non-RecoWork project and delegates safe merge behavior to `rw import`: existing paths are preserved, missing RecoWork files may be added, and a regular root `AGENTS.md` may receive only its marker-bounded RecoWork block. An unapproved root, path traversal, unsupported template/locale, symlinked target, or existing manifest is rejected before the CLI is invoked. Cockpit prompts must restate that the workspace documents and root `AGENTS.md` are authoritative, and must preserve the generated confirmation rules before a task changes project direction, scope, or files.

The Web card must follow the active DSH `zh` or `en` locale, subscribe to its runtime locale changes, and re-render its chrome and generic status labels without a reload. It does not translate user-owned workspace paths, document excerpts, stages, or action items.

The Bundle contributes a model-facing workflow protocol alongside the three tool schemas. It tells the Agent to initialize or import only on explicit request, use read-only status before durable work, then read the initialized workspace's `AGENTS.md`, role contract, and document standard before planning or editing. The protocol grants no additional filesystem authority and does not permit the Agent to bypass a rejected tool call.

## Ownership And Boundaries

`rw` remains the source of truth for template resolution, generated-file ownership, manifests, status, and upgrade behavior. The DSH package is a thin adapter and must not duplicate template generation or upgrade logic.

The agent may operate only in user-configured, absolute `allowedRoots`.

- A tool `root` argument must exactly match an allowed root after canonical path resolution.
- A `destination` is a relative descendant of that root; path traversal and targeting the root itself are rejected.
- Initialization permits only supported templates, `local-agent-project`, and `zh` or `en`.
- Initialization refuses any non-empty destination. This is stricter than direct CLI use and avoids altering user-owned files, including an existing `AGENTS.md`.
- Import requires a direct user request, an existing non-empty destination without `rw-manifest.json`, and the same supported template/locale boundary. It invokes only `rw import`, which writes missing files, preserves same-name paths, and confines `AGENTS.md` changes to a marker-bounded block.
- Status requires `rw-manifest.json`, reads no arbitrary path supplied by the model, and returns only a capped excerpt from recognized, current workspace documents.

The bundle must never expose an argument that becomes an executable path, shell snippet, CLI argument list, package URL, or unbounded file path. Local administrators may configure the bundle, but that configuration is outside the model-controlled interface and must be reviewed before installation.

## Distribution And Verification

The package is an npm-style DSH Bundle: `package.json` declares `dsh.bundle.patch`, and `cordis.patch.yml` mounts the plugin. It is installed into a DSH profile with `dsh plugin --profile <name> add <package>`. Its `recowork-dsh setup --root <absolute-directory>` helper then writes the allowed roots into one marker-bounded profile configuration block. Setup requires an existing absolute directory, creates a timestamped backup before modifying the profile patch, parses the patch as one YAML array, replaces DSH's default `[]` placeholder instead of appending a second document, and validates the written file before retaining it; validation failure restores the original patch. Setup is idempotent for its own block and refuses a hand-authored `recowork-dsh` entry unless the local administrator explicitly passes `--adopt-existing`. The first interactive validation installs it into the shipped `web` profile, because `dsh web` is that profile's Web UI alias; a custom profile needs an explicit Web-app Bundle before it can serve the UI.

Before public distribution, verify against the pinned DSH version, install from a packed artifact, run the service tests, initialize every supported template/locale in a temporary approved root, and import fixtures with existing `README.md` and `AGENTS.md` content. Confirm that initialization rejects a non-empty destination, import rejects an existing manifest and unsafe paths, and no rejected operation modifies project content.

Release 0.3.0 pins its initializer, importer and setup to `recowork@4.1.0`. Distribution verification uses `@deepseek-ai/dsh@0.1.2-rc.1` in an isolated DSH home: install the packed Bundle into the web profile, apply setup, and compose its configuration. Packed-service checks run all three templates in both locales against the published CLI, including existing README/AGENTS preservation and repeated-import rejection. These checks do not claim a full browser interaction review.

## Task-Specific Methods

Follow the task-specific method contract in `specs/requirements.md`. Local files, chat protocols, DSH guidance and website prompts must preserve their respective environment boundaries. DSH reads project stage from the delivery plan with legacy index fallback, uses localized learning paths and does not infer completion from document presence.

The unreleased DSH 0.4.0 requires RecoWork 4.2.0 for method-aware initialization. Publish and verify core 4.2.0 before publishing the adapter; do not ship a pin to an unavailable package. Development integration must use the packed local core artifact via administrator configuration. No publication is authorized by these source changes alone. Open-question summaries recognize the template table and legacy lists, exclude closed sections/completed checkboxes, and remain heuristic navigation rather than proof of no blockers.
