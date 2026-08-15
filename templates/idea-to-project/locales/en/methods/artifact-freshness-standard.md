> Version: 1.0
> Date: 2026-07-21
> Status: Current

# Artifact Freshness Standard

## Conclusion First

Project briefs, requirements, designs, plans, and decisions need an explicit current version. Brainstorms, discussion summaries, and rejected options are retained only as traceable evidence. After each milestone or material decision, the agent consolidates valid conclusions into canonical project facts, marks replaced material, and makes indexes point to current content by default. Freshness never means automatic deletion: archival, moves, or deletion of user documents require confirmation.

## Body

### Lifecycle And Status

- `Draft`: still changing and not a default project fact.
- `In review`: waiting for user confirmation, evidence, or acceptance.
- `Current`: the single default source for a topic and scope.
- `Superseded`: no longer read by default and linked to its current replacement.
- `Archived`: historical reference only and not read by default.

When an older `Final` document is materially updated, migrate it to one of these states; use `Current` only when it remains the default source.

### Canonical Facts, Traces, And Decisions

- The project brief, requirements, designs, plans, and current decisions are canonical facts. Update them in place for the same topic instead of creating a file for every discussion.
- `04-thinking-traces/` holds discussion summaries, attempts, rejected options, and evidence. Name trace snapshots `YYYY-MM-DD-topic-v01.md`, increasing the suffix for multiple entries on one day.
- Create separate versions only for milestones, external deliveries, confirmed decisions, or meaningful comparisons.
- Decisions use stable identifiers. When a decision replaces another, mark the old record Superseded and link to the new record instead of leaving two competing current conclusions.
- Never delete user documents automatically. Propose archival or deletion with the candidate files, reason, and retention approach; act only after confirmation.

### Metadata And Indexes

Alongside the required fields in the [Document Standard](./document-standard.md), add `last_confirmed`, `supersedes`, `superseded_by`, `source_traces`, and `review_trigger` where applicable. Use relative links for replacements and sources.

Split affected `index.md` files into Current and Historical reference groups. Default navigation enters only Current. Historical entries must be marked Superseded or Archived and state their replacement or archival reason.

### Milestone Freshness Sweep

1. Merge confirmed conclusions into the project brief, requirements, designs, plans, decisions, or validation records.
2. Mark traces absorbed, pending, or trace-only and link them to the relevant canonical fact.
3. Consolidate duplicate drafts and record replacement relationships for documents displaced by newer conclusions.
4. Update parent indexes with current entries, historical entries, statuses, and last-updated dates.
5. Recheck current documents only when goals, scope, constraints, risks, evidence, or acceptance criteria change.

## Related References

- [Document Standard](./document-standard.md)
- [Workflow](./workflow.md)
- [Quality Gates](./quality-gates.md)
- [Workspace Index](../workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Established project artifact lifecycle, replacement, consolidation, and index freshness rules. |
