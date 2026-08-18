---
title: Artifact Freshness Standard
version: 1.1
date: 2026-08-18
status: Current
---

# Artifact Freshness Standard

## Conclusion First

The learning workspace keeps only records that the next session should use directly: the learner brief, roadmap, progress tracker, Current unit, and validated knowledge. Update one learning topic in place; do not create competing “final”, “latest”, or parallel lesson files. Superseded formal versions and completed practice, discussion, and retrospective material belong in `learning-workspace/archive/` by category, topic, and version; archives do not participate in normal learning navigation. Before moving, archiving, or deleting an existing learner file, propose the candidate and reason and obtain confirmation.

## Body

### Lifecycle And Status

- `Draft`: still changing and not a default source for the next learning session.
- `In review`: waiting for learner confirmation, practice evidence, or validation.
- `Current`: the single default learning source for a topic and scope.
- `Superseded`: replaced by a new Current record and retained in the archive for traceability.
- `Archived`: retained only for historical value or a phase-acceptance snapshot and not read by default.

When an older `Final` document is materially revised, mark it Current, Superseded, or Archived. Do not use “Final” to conceal competing versions.

### Current Learning Area And Archive Boundary

- `learner-brief.md`, `course-roadmap.md`, `learning-progress.md`, Current unit records, and validated knowledge capture are formal learning records. Update them in place by topic.
- Unit directories, `03-project-practice/`, and `04-questions-and-retrospectives/` hold only active, unresolved, or unvalidated material. Completed summaries, unsuccessful attempts, rejected explanations, and experiment detail move to the archive.
- Use `learning-workspace/archive/<category>/<topic>/v<major>.<minor>.md`, reusing the learning-area category such as `02-lessons-and-practice`, `03-project-practice`, or `04-questions-and-retrospectives`.
- Archive separate versions only for phase acceptance, material roadmap changes, important retrospectives, or meaningful comparisons. Routine learning edits update the Current record directly.

### Archive Operation Protocol

1. Before writing, classify the change as a Current-record update, active learning material, or archive candidate. Default to updating the Current record.
2. For an archive proposal, list candidate files, archival reason, destination, status, and the Current replacement.
3. Before learner confirmation, only mark candidates and update navigation. Do not move, delete, rename, or rewrite existing learner files.
4. After confirmation, move historical material to the archive using the standard version name and add relative links between archive and Current records.
5. Do not create empty archive categories or copy historical lesson or practice bodies back into formal directories or normal indexes.

### Metadata And Indexes

Alongside the required fields in the [Document Standard](./document-standard.md), add `last_confirmed`, `supersedes`, `superseded_by`, `source_traces`, and `review_trigger` where applicable. Use relative links for all relationships.

Formal `index.md` files list Current or still-open learning material only; they never enumerate historical versions. The learning-workspace root index has one link to `archive/index.md`. The archive index navigates category, topic, version, status, and one-line summary. When material is absorbed or completed, state its destination and remove it from the active directory after confirmation.

### Unit And Phase Freshness Sweep

1. Merge validated understanding, practice evidence, misconceptions, and next steps into the Current unit record, progress tracker, or `05-knowledge-capture/`.
2. Mark questions, practice attempts, and discussion summaries Absorbed, Still open, or Archive candidate and link them to the formal record.
3. Consolidate duplicate drafts so every topic has one Current default source.
4. List archive candidates for learner confirmation; after confirmation, archive them by category, topic, and version.
5. Update formal indexes with Current entries and the archive index with historical entries, status, and last-updated date.
6. Recheck Current records only when learning goals, prerequisites, practice evidence, time constraints, or completion criteria change.

## Related References

- [Document Standard](./document-standard.md)
- [Learning Method](./learning-method.md)
- [Assessment And Retrospective](./assessment-and-retrospective.md)
- [Learning Workspace Index](../learning-workspace/index.md)
- [Archive Index](../learning-workspace/archive/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-08-18 | 1.1 | Moved historical learning versions and completed process material into a separate archive with an explicit confirmation protocol. |
| 2026-07-21 | 1.0 | Established learning artifact lifecycle, consolidation, indexing, and archival rules. |
