# DeepSeek Harness Integration Contract

## Purpose

`recowork-dsh` is an experimental, optional DeepSeek Harness (DSH) Bundle. It makes RecoWork easier to invoke from a DSH conversation; it does not create a new RecoWork target, agent runtime, model host, or replacement for the `rw` CLI.

## First Release Scope

The Bundle exposes exactly two model-facing tools:

- `recowork_init`: initialize a new `local-agent-project` workflow using the existing RecoWork CLI.
- `recowork_status`: read a concise status from a previously initialized workflow.

The first release has no automatic upgrade, background jobs, model/provider integration, arbitrary shell execution, arbitrary file reads, file writes outside initialization, deletion, moving, renaming, or workspace repairs. Its DSH Web UI is a collapsible, frame-wide workspace card with two bounded flows:

- The status view lists configured roots, then offers only direct-child directories containing a valid `rw-manifest.json` as selectable workspaces. It displays the selected workspace's template, locale, and recognized current-document names from the same authorized status read exposed to the model. It may additionally derive a current stage from the workspace index, surface up to three actionable items from the open-questions document, and summarize manifest/document health; it must remain a concise, read-only summary rather than a general file browser.
- The new-workspace view submits only a supported template, locale, approved root, and relative destination to the same constrained initializer used by `recowork_init`. It requires an explicit user confirmation in the UI before enabling the request; the server independently rejects requests without that confirmation.

The UI cannot edit an existing workspace. A non-empty destination, unapproved root, path traversal, or any unsupported template/locale is rejected by the server before RecoWork is invoked.

The Web card must follow the active DSH `zh` or `en` locale, subscribe to its runtime locale changes, and re-render its chrome and generic status labels without a reload. It does not translate user-owned workspace paths, document excerpts, stages, or action items.

The Bundle contributes a model-facing workflow protocol alongside the two tool schemas. It tells the Agent to initialize only on explicit request, use read-only status before durable work, then read the initialized workspace's `AGENTS.md`, role contract, and document standard before planning or editing. The protocol grants no additional filesystem authority and does not permit the Agent to bypass a rejected tool call.

## Ownership And Boundaries

`rw` remains the source of truth for template resolution, generated-file ownership, manifests, status, and upgrade behavior. The DSH package is a thin adapter and must not duplicate template generation or upgrade logic.

The agent may operate only in user-configured, absolute `allowedRoots`.

- A tool `root` argument must exactly match an allowed root after canonical path resolution.
- A `destination` is a relative descendant of that root; path traversal and targeting the root itself are rejected.
- Initialization permits only supported templates, `local-agent-project`, and `zh` or `en`.
- Initialization refuses any non-empty destination. This is stricter than direct CLI use and avoids altering user-owned files, including an existing `AGENTS.md`.
- Status requires `rw-manifest.json`, reads no arbitrary path supplied by the model, and returns only a capped excerpt from recognized, current workspace documents.

The bundle must never expose an argument that becomes an executable path, shell snippet, CLI argument list, package URL, or unbounded file path. Local administrators may configure the bundle, but that configuration is outside the model-controlled interface and must be reviewed before installation.

## Distribution And Verification

The package is an npm-style DSH Bundle: `package.json` declares `dsh.bundle.patch`, and `cordis.patch.yml` mounts the plugin. It is installed into a DSH profile with `dsh plugin --profile <name> add <package>`. Its `recowork-dsh setup --root <absolute-directory>` helper then writes the allowed roots into one marker-bounded profile configuration block. Setup requires an existing absolute directory, creates a timestamped backup before modifying the profile patch, parses the patch as one YAML array, replaces DSH's default `[]` placeholder instead of appending a second document, and validates the written file before retaining it; validation failure restores the original patch. Setup is idempotent for its own block and refuses a hand-authored `recowork-dsh` entry unless the local administrator explicitly passes `--adopt-existing`. The first interactive validation installs it into the shipped `web` profile, because `dsh web` is that profile's Web UI alias; a custom profile needs an explicit Web-app Bundle before it can serve the UI.

Before public distribution, verify against the pinned DSH version, install from a packed artifact, run the service tests, initialize every supported template/locale in a temporary approved root, and confirm that attempts to use an unapproved root, path traversal, or a non-empty destination fail without modification.
