# RecoWork for Codex

`recowork-codex` is a Codex plugin containing the RecoWork workflow skill.

It does not define a new RecoWork target or workspace layout. It directs Codex to use the existing `recowork` CLI and the generated root `AGENTS.md` protocol, so Codex and DSH operate on the same durable RecoWork projects without duplicating template or lifecycle logic.

During local development, add the plugin to a configured local Codex marketplace, then install it from that marketplace. The skill is intentionally transport-only: it does not expose arbitrary filesystem tools, bypass confirmation gates, or manage RecoWork upgrades.
