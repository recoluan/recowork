# Codex Integration Contract

## Purpose

`recowork-codex` is an optional Codex plugin that packages a RecoWork Skill. It makes the existing RecoWork CLI and generated `AGENTS.md` protocol discoverable in Codex; it does not add a new RecoWork target, workspace layout, manifest format, or lifecycle authority.

## Scope

The initial integration is Skill-only.

- It directs Codex to initialize new workflows with `npx --yes recowork@latest add ... --target local-agent-project`.
- It directs Codex to inspect and continue existing workflows through the root `AGENTS.md`, manifest, indexes, role contract, and document standard.
- It routes browsing to the existing read-only `rw view` command and lifecycle review to `rw status` or `rw upgrade --check`.
- It does not provide an MCP server, browser UI, arbitrary shell capability, hidden workspace state, or a bypass for RecoWork confirmation and ownership rules.

## Boundary With DSH

The two integrations share RecoWork's CLI, target contracts, manifests, and root `AGENTS.md` protocol. They do not share host-specific implementation:

- DSH uses its Bundle, constrained tool schemas, configured `allowedRoots`, and read-only Web panel.
- Codex uses a plugin Skill and the command-capable local-agent workflow. It may gain an MCP server only after a separate safety and user-value validation.

## Verification

Before distribution, validate the plugin manifest, inspect the Skill for command and confirmation rules, install it in a local Codex test environment, and use a fresh task to initialize and continue a temporary RecoWork workflow. Confirm that it uses `local-agent-project`, reads generated `AGENTS.md`, and refuses to treat an existing workspace as a new initialization destination.
