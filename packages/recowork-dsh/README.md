# RecoWork for DeepSeek Harness

`recowork-dsh` is an experimental DSH Bundle that gives an agent two narrowly scoped tools:

- `recowork_init`: initializes one new RecoWork `local-agent-project` workflow.
- `recowork_status`: reads its manifest and a small, fixed set of current-work documents.

It also contributes a model-facing workflow protocol: use initialization only on an explicit request, inspect a workspace before durable work, then read its `AGENTS.md` and localized working methods before planning or editing. It intentionally does not expose a shell, arbitrary file reads, upgrades, deletion, or renaming.

In DSH Web it also adds a collapsible workspace card with two bounded flows:

- **Status** lets the user select a recognized direct-child workspace from the configured root, then reads its template, locale, current-document names, derived current stage, up to three actionable open-question items, and a concise manifest/document health summary through the same authorization checks as `recowork_status`.
- **New workspace** accepts an approved root, relative destination, supported template, and locale. The user must explicitly confirm that the destination is missing or empty before the card calls the same constrained initializer as `recowork_init`.

The card cannot edit, delete, repair, or upgrade a workspace. The server rejects an initialization request without the confirmation field, outside an approved root, or against a non-empty destination.

Its interface follows DSH's active `zh` or `en` preference live, including when the user changes the language in DSH Settings. Workspace document names and action text remain in the language of the selected workspace.

The Bundle has no runtime npm dependency on DSH internals. This keeps a locally linked checkout resolvable from its own source directory; DSH accepts the plugin's raw JSON-Schema tool definitions directly.

## Install

1. Install DeepSeek Harness and start its Web profile once so its profile exists.
2. Install the published Bundle into the Web profile, then explicitly authorize one or more existing directories:

```bash
dsh plugin --profile web add recowork-dsh@0.1.0
npx --yes recowork-dsh@0.1.0 setup --root /absolute/path/to/your/recowork-lab
dsh web
```

Repeat `--root` to authorize more than one directory. If your DSH home is not the default `~/.dsh`, either set `DSH_HOME` or pass it explicitly:

```bash
DSH_HOME=/path/to/dsh-home npx --yes recowork-dsh@0.1.0 setup --root /absolute/path/to/your/recowork-lab
```

The setup command creates a timestamped backup of `cordis.patch.yml` and writes only a marker-bounded RecoWork block. If you previously configured `recowork-dsh` by hand, review that entry and rerun the command with `--adopt-existing`; it will back up the file before replacing only the old RecoWork entry. The default initializer runs `npx --yes recowork@3.2.2`.

For local development, replace the first command with `dsh plugin --profile web add ./packages/recowork-dsh`, then run `node ./packages/recowork-dsh/bin/recowork-dsh.js setup --root /absolute/path/to/your/recowork-lab --dsh-home "$DSH_HOME"`.

## Safety contract

- `root` must exactly match an entry in `allowedRoots`; `destination` must be a descendant of that root.
- Initialization requires a missing or empty directory and only permits the three supported templates and `zh`/`en` locales.
- Status requires `rw-manifest.json` and reads only fixed, localized current-work files, capped at 12,000 characters each.
- Existing RecoWork workspaces remain user-owned. Use `rw status` or `rw upgrade` directly for upgrade review.

The only DSH Web write action is new-workspace initialization under the same strict rules as `recowork_init`. Any future write action requires a separate permission and lifecycle design review; it must not bypass RecoWork's existing confirmation gates or workspace-ownership rules.
