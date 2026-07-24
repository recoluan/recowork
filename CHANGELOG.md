# Changelog

All notable changes to RecoWork are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Added `web-design-standard`, a reusable product-web design standard that produces one localized standard file for local agents and a standalone responsive-web prompt for Chat / mobile.
- Added a public interactive reference implementation for the default product-web direction, including responsive navigation, filtering, loading, empty state, form validation, and success feedback.

### Changed

- Reframed the public website and README around helping an existing AI agent finish real work continuously, with clear task, standards, project facts, review, and continuation boundaries instead of CLI-first template language.
- Reworked the bilingual homepage, usage guide, philosophy, and cases around real work scenarios and the distinction between a local executable agent and Chat / Mobile. Public copy now avoids unverified product-support claims and clarifies that Chat / Mobile continuity is manual.
- Retired `general-ai-workflow` because its daily-task scope did not provide a sufficiently distinct reusable workflow. New initialization now directs users to idea, project, or learning workflows; existing general workflow files remain untouched and receive a read-only migration guide from `rw status` or `rw upgrade`.
- Local initialization now safely integrates a marker-bounded RecoWork block into an existing root `AGENTS.md`; upgrades preserve a user-modified or removed managed block.
- Workflow role contracts now require objective assessment of risks, contradictions, weak assumptions, and credible alternatives instead of reflexive agreement.
- The documentation site separates workflow templates from design standards in both the catalog and initialization flow, and the release summary now names each pending capability.
- The documentation site now trials remotely loaded Noto Sans SC and JetBrains Mono to unify Chinese, English, and code typography before any font assets are self-hosted.
- Site headings now use semantic line breaks, highlighted keywords, and a more compact desktop hierarchy from H1 through H3 in Chinese and English, avoiding arbitrary phrase splits, oversized page heroes, and weak visual hierarchy.

### Compatibility

- Existing root `AGENTS.md` content remains unchanged outside the managed RecoWork block. Existing workflows are not modified automatically.
- Existing `general-ai-workflow` files remain untouched; use the migration guidance from `rw status` or `rw upgrade` to initialize a separate supported workflow.

### Breaking Changes

- `general-ai-workflow` and its `general`, `task`, and `daily` aliases can no longer be initialized, listed, or shown.

## [1.0.0] - 2026-07-21

### Added

- Added the `chat-mobile` target with a start instruction, task protocol, and manual continuation/migration summary.
- Added the `local-agent-project` target with tool-neutral `AGENTS.md`, working methods, a durable workspace, and safe upgrade support.
- Added legacy chat migration guidance that initializes a separate local workflow without touching existing files.

### Changed

- Replaced brand-specific targets with the two user-facing environments: Chat / mobile and desktop AI assistant.
- Consolidated durable knowledge into canonical workspace documents and indexes instead of a separate knowledge directory.
- `rw add` now refuses destinations that already contain `rw-manifest.json`, preventing reinitialization from overwriting an existing workflow.
- Updated templates, CLI prompts, bilingual README files, specifications, and the documentation site for the new environment model.

### Removed

- Removed brand-specific target output, native skills, platform configuration folders, and Notion/Feishu document exports.

### Compatibility

- Legacy target names remain CLI aliases and resolve to `chat-mobile` or `local-agent-project`.
- Existing workspaces remain untouched. Legacy Chat workflows receive a migration command for a separate local destination.

### Breaking Changes

- Brand-specific generated paths and native skill output are no longer produced. Use `local-agent-project` for complete local workflows or `chat-mobile` for lightweight chat workflows.

## [0.4.0] - 2026-07-20

### Added

- Learning workflows now require a confirmed learning agreement before generating or changing a roadmap, lesson, practice plan, or project plan.
- Project workflows now require a confirmed project agreement before generating or changing a complete solution, plan, or implementation.
- Confirmation gates are included in localized role contracts, working methods, chat prompts, and project instructions.

### Changed

- `learning-engineering` and `project-engineering` templates are now version `1.1.0`.
- The published npm package now exposes repository, homepage, and issue-tracker links; the bundled CLI reference links to guided setup, source, releases, and AI-led initialization.

### Compatibility

- Existing workflows are not changed automatically. Run `rw upgrade --plan .` to review available method and target updates; apply only updates that remain unmodified in the user project.
- New initializations pause for explicit confirmation only before broad learning or project design work. Explicitly confirmed local tasks can proceed without repeated confirmation.

## [0.3.0] - 2026-07-12

### Added

- Localized target output paths and static content for Chinese and English initialization.
- Document standards, index-first retrieval, and index maintenance across durable workflow templates.
- Conventional Commit guidance for contributors and AI agents.
- A conservative workflow upgrade advisor with versioned manifests, read-only checks, safe updates, and workspace review reports.

### Changed

- Chinese initialization now generates user-facing paths such as `知识库/` and `示例/` while preserving tool convention files.
- Target locale changes remove stale generated files from the previous locale when they are safe to replace.
- Workspaces are now explicitly user-owned during upgrades: existing workspace content is never overwritten, moved, deleted, or restored.
- Upgrade reports are written to `.recowork/upgrade-reports/`, outside user-owned workspaces.

### Compatibility

- Existing workflows are not changed automatically. Run `rw upgrade --adopt .` before using upgrade checks on legacy manifests.
- New workspace templates require `--scope workspace --add-missing`; existing workspace files remain untouched.

## [0.2.2] - 2026-07-09

### Fixed

- Added a `recowork` executable alias so `npx recowork ...` resolves and runs correctly.

## [0.2.1] - 2026-07-09

### Fixed

- Published the root package that includes the CLI entry point, templates, and targets.

## [0.2.0] - 2026-07-09

### Deprecated

- This version was published without the required executable entry point. Use `0.2.2` or later.
