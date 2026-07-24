# Contributing To RecoWork

## Commit Convention

RecoWork uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit title uses:

```text
<type>(<scope>): <summary>
```

Use a concise imperative summary that states the result, not a vague activity. Keep the title to 72 characters or fewer and do not end it with a period.

### Types

| Type | Use for |
| --- | --- |
| `feat` | A new user-facing capability. |
| `fix` | A user-visible defect or regression fix. |
| `docs` | Documentation-only changes. |
| `refactor` | Code restructuring without behavior change. |
| `test` | Test coverage or test-only changes. |
| `chore` | Repository maintenance. |
| `build` | Packaging, dependencies, or release changes. |
| `ci` | Continuous-integration changes. |
| `perf` | Measurable performance improvements. |

### Scopes

Use the most specific scope that explains the affected surface:

```text
cli
targets
templates
project-engineering
idea-engineering
learning-engineering
docs
specs
release
```

Examples:

```text
feat(targets): localize user-facing target outputs
fix(cli): remove stale files when switching locale
docs(specs): define target localization contract
```

## Large Changes

When a commit changes multiple surfaces, introduces a migration, alters generated output, or would be hard to understand from its title alone, add a detailed body:

```text
feat(targets): localize user-facing target outputs

Why:
- Chinese initialization still created English target paths.

Changes:
- Add locale-specific target output directories.
- Generate Chinese knowledge and prompt filenames.
- Preserve tool convention files and stable skill identifiers.

Compatibility:
- Reinitializing in another locale removes stale generated target files.

Validation:
- Run localized initialization checks and npm package inspection.
```

Use `BREAKING CHANGE:` in the footer when an existing command, generated path, file format, or workflow contract becomes incompatible:

```text
BREAKING CHANGE: Chinese Codex output now uses 知识库/ instead of knowledge/.
```

## Commit Discipline

- Keep one logical change per commit when practical.
- Do not stage unrelated user changes, generated test output, npm cache, or package tarballs.
- Inspect the staged diff before committing and run checks appropriate to the changed surface.
- A commit that changes templates, targets, CLI behavior, or public documentation must include the related specs in the same commit.
- Before committing a completed functional change to a template, target, CLI, generated artifact, compatibility contract, or migration behavior that has not been released, add a concise bilingual entry to `CHANGELOG.md`, `CHANGELOG.zh.md`, and the Unreleased section of `docs/releases.html`.
- Do not add changelog entries for website-only visual, copy, layout, interaction-polish, or documentation-presentation changes. When a change includes both presentation and functional behavior, record only the functional impact.

## Release Checklist

Before publishing a release:

1. Update `package.json` with the intended semantic version.
2. Move completed items from `Unreleased` into a versioned section in both `CHANGELOG.md` and `CHANGELOG.zh.md`.
3. Add the same release entry to `docs/releases.html` in Chinese and English.
4. State breaking changes, migration requirements, and verification results clearly.
5. Run package and relevant initialization checks before `npm publish`.

Do not publish a version without updating both changelog sources and the website release record.

The Unreleased sections are maintained with completed commits, not deferred until release preparation. Publishing moves the same entries into the dated version section.
