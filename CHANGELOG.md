# Changelog

All notable changes to RecoWork are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
