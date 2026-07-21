---
title: Artifact Freshness Standard
version: 1.0
date: 2026-07-21
status: Current
---

# Artifact Freshness Standard

## Conclusion First

Learning creates diagnostics, course drafts, lesson notes, practice attempts, error analysis, and retrospectives, but the next session should rely by default only on the current learner brief, roadmap, progress, and validated knowledge. Process materials preserve learning evidence; they must not compete with current course conclusions. Before a unit or phase ends, merge valid understanding and next steps into formal learning records, then mark old drafts, resolved questions, and process materials.

## Body

### Lifecycle And Status

- `Draft`: still changing and not a default source for the next learning session.
- `In review`: waiting for learner confirmation, practice evidence, or validation.
- `Current`: the single default learning source for a unit and scope.
- `Superseded`: retained for learning history and linked to the new current record.
- `Archived`: historical reference only and not read by default.

When an older `Final` document is materially updated, migrate it to one of these states; use `Current` only when it still represents the active learning conclusion.

### Formal Learning Records And Process Materials

- `learner-brief.md`, `course-roadmap.md`, `learning-progress.md`, validated unit records, and knowledge capture are formal learning records. Update them in place for the same unit.
- Store discussion summaries, unsuccessful practice attempts, rejected explanations, and experiment details with the relevant unit, under `04-questions-and-retrospectives/`, or under `03-project-practice/`, and state whether they have been absorbed.
- Name process snapshots `YYYY-MM-DD-topic-v01.md`, increasing the suffix for multiple entries on one day. Keep separate snapshots only for phase acceptance, material roadmap changes, or meaningful comparisons.
- Never delete learner notes or exercises automatically. Explain proposed archival or deletion, preserve them by default, and act only after learner confirmation.

### Metadata And Indexes

Alongside the required fields in the [Document Standard](./document-standard.md), add `last_confirmed`, `supersedes`, `superseded_by`, `source_traces`, and `review_trigger` where applicable. Use relative links for all relationships.

Split affected `index.md` files into Current and Historical reference groups. Default navigation enters only Current. Historical entries must be marked Superseded or Archived and state their replacement or archival reason.

### Unit And Phase Freshness Sweep

1. Merge validated understanding, practice evidence, misconceptions, and next steps into a unit record, progress tracker, or `05-knowledge-capture/`.
2. Mark questions, practice attempts, and discussion summaries absorbed, pending, or trace-only and link them to the relevant formal record.
3. Consolidate duplicate drafts and record replacement relationships for documents displaced by newer understanding or roadmap changes.
4. Update parent indexes with current entries, historical entries, statuses, and last-updated dates.
5. Recheck current records only when learning goals, prerequisites, practice evidence, time constraints, or completion criteria change.

## Related References

- [Document Standard](./document-standard.md)
- [Learning Method](./learning-method.md)
- [Assessment And Retrospective](./assessment-and-retrospective.md)
- [Learning Workspace Index](../learning-workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Established learning artifact lifecycle, consolidation, indexing, and archival rules. |
