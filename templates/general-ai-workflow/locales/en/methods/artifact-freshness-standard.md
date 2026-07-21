---
title: Artifact Freshness Standard
version: 1.0
date: 2026-07-21
status: Current
---

# Artifact Freshness Standard

## Conclusion First

Tasks generate drafts, attempts, and discussion summaries, but the next session should rely by default only on the current task brief, formal outputs, and confirmed conclusions. Traces explain why; they are not competing sources of truth. Before important work ends, merge durable conclusions into canonical documents and mark what happened to the supporting traces.

## Body

### Lifecycle And Status

- `Draft`: still changing and not a default source for the next task.
- `In review`: waiting for user input, evidence, or validation.
- `Current`: the single default source for a topic and scope.
- `Superseded`: retained for traceability and linked to its current replacement.
- `Archived`: historical reference only and not read by default.

When an older `Final` document is materially updated, migrate it to one of these states; use `Current` only when it remains the default source.

### Canonical Documents And Traces

- Update the task brief, formal outputs, and reusable conclusions in place for the same question; do not create a new document for every chat.
- `03-thinking-traces/` stores discussion summaries, attempts, rejected directions, and evidence. Name trace snapshots `YYYY-MM-DD-topic-v01.md`, increasing the suffix for multiple entries on one day.
- Keep separate snapshots only for milestones, external deliveries, confirmed decisions, or meaningful comparisons.
- Never delete user documents automatically. Explain proposed archival or deletion, preserve the file by default, and act only after user confirmation.

### Required Links And Indexes

For substantial documents, add these metadata fields when applicable: `last_confirmed`, `supersedes`, `superseded_by`, `source_traces`, and `review_trigger`. Use relative links for relationships.

Split each affected `index.md` into Current and Historical reference groups. Default navigation uses only Current. Historical entries must be marked Superseded or Archived and state their replacement or archival reason.

### Freshness Sweep At Important Task End

1. Merge confirmed goals, conclusions, and delivery state into `task-brief.md`, a formal output, or `04-review-and-reuse/`.
2. Mark every trace as absorbed, pending, or trace-only and link it to the canonical document.
3. Consolidate duplicate drafts and record replacement relationships for superseded documents.
4. Update parent indexes with current entries, historical entries, statuses, and last-updated dates.
5. Recheck current documents only when direction, constraints, evidence, or acceptance criteria change; avoid cosmetic rewrites.

## Related References

- [Document Standard](./document-standard.md)
- [Workflow](./workflow.md)
- [Quality Checklist](./quality-checklist.md)
- [Workspace Index](../workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Established task artifact lifecycle, consolidation, indexing, and archival rules. |
