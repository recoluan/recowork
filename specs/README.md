# RecoWork Specs

This directory stores durable product and engineering decisions for RecoWork.

These documents are the source of truth when changing templates, targets, CLI behavior, prompts, documentation, or publishing flows.

## Documents

- [Targets Standard](./targets.md): how RecoWork defines the `local-agent-project` and `chat-mobile` delivery environments.
- [Requirements Log](./requirements.md): product, naming, packaging, website, CLI, prompt, and documentation requirements collected so far.
- [Architecture Decisions](./decisions.md): important design decisions and the reasoning behind them.
- [DeepSeek Harness Integration Contract](./dsh-integration.md): optional DSH Bundle scope, safety boundary, and verification rules.
- [Codex Integration Contract](./codex-integration.md): optional Codex Skill scope, shared-core boundary, and verification rules.

## Rule

When a change introduces a new concept, target, template behavior, CLI option, or user-facing convention, update the relevant spec in the same change.
