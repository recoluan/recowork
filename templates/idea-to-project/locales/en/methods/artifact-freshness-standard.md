> Version: 1.2
> Date: 2026-08-20
> Status: Current

# Artifact Freshness Standard

## Conclusion First

Formal workspace directories contain only Current, directly usable project facts. Update the single Current document for a topic in place; do not create competing “final”, “latest”, or parallel drafts. Superseded formal versions and completed process material that no longer participates in current work are stored under `workspace/archive/` by category, topic, and version. Archives exist for traceability and are excluded from normal navigation. Before moving, archiving, or deleting an existing user document, the agent must identify the candidate and reason, then obtain confirmation.

## Body

### Lifecycle And Status

- `Draft`: still changing and not a default project fact.
- `In review`: waiting for user confirmation, evidence, or acceptance.
- `Current`: the single default source for a topic and scope.
- `Superseded`: replaced by a Current document and retained in the archive for traceability.
- `Archived`: retained only for historical value or an external-delivery snapshot and not read by default.

When an older `Final` document is materially revised, mark it Current, Superseded, or Archived. Do not use “Final” to conceal competing versions.

### Current Workspace And Archive Boundary

- The project brief, requirements, designs, plans, current decisions, and current validation records are canonical facts. Update them in place by topic.
- `parked-ideas.md` is the single Current list of restartable directions. It is not an archive and must not be mixed into open questions or the active project scope.
- `05-thinking-traces/` holds only active, unresolved, or unvalidated process material. Completed discussion summaries, attempts, rejected options, and evidence move to the archive.
- Use `workspace/archive/<category>/<topic>/v<major>.<minor>.md`, reusing the workspace category such as `03-solution-design` or `05-thinking-traces`.
- Archive separate versions only for milestones, external deliveries, confirmed decisions, material retrospectives, or meaningful comparisons. Routine edits update the Current document directly.
- Decisions use stable identifiers. When a new decision replaces one, archive the prior record and link it to the new one; never leave competing Current conclusions.

### Archive Operation Protocol

1. Before writing, classify the change as a Current-document update, active process material, or archive candidate. Default to updating the Current document.
2. For an archive proposal, list candidate files, archival reason, destination, status, and the Current replacement.
3. Before user confirmation, only mark candidates and update navigation. Do not move, delete, rename, or rewrite existing user documents.
4. After confirmation, move historical material to the archive using the standard version name and add relative links between archive and Current documents.
5. Do not create empty archive categories or copy historical bodies back into formal directories or normal indexes.

### Metadata And Indexes

Alongside the required fields in the [Document Standard](./document-standard.md), add `last_confirmed`, `supersedes`, `superseded_by`, `source_traces`, and `review_trigger` where applicable. Use relative links for all relationships.

Formal `index.md` files list Current or still-open material only; they never enumerate historical versions. The root index has one link to `archive/index.md`. The archive index navigates category, topic, version, status, and one-line summary. When a trace is absorbed or completed, state its destination and remove it from the active directory after confirmation.

### Milestone Freshness Sweep

1. Merge confirmed conclusions into the project brief, requirements, designs, plans, decisions, or validation records. Update `parked-ideas.md` for directions that are not being advanced but may restart.
2. Mark process material Absorbed, Still open, or Archive candidate and link it to the relevant canonical fact.
3. Consolidate duplicate drafts so every topic has one Current default source.
4. List archive candidates for user confirmation; after confirmation, archive them by category, topic, and version.
5. Update formal indexes with Current entries and the archive index with historical entries, status, and last-updated date.
6. Recheck Current documents only when goals, scope, constraints, risks, evidence, or acceptance criteria change.

## Related References

- [Document Standard](./document-standard.md)
- [Workflow](./workflow.md)
- [Quality Gates](./quality-gates.md)
- [Workspace Index](../workspace/index.md)
- [Parked Ideas](../workspace/parked-ideas.md)
- [Archive Index](../workspace/archive/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-08-20 | 1.2 | Defined a parked-ideas list for restartable directions, separate from open questions and archives. |
| 2026-08-18 | 1.1 | Moved historical versions and completed process material into a separate archive with an explicit confirmation protocol. |
| 2026-07-21 | 1.0 | Established project artifact lifecycle, replacement, consolidation, and index freshness rules. |
