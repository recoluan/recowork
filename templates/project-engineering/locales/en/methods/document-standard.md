# Document Standard

> Version: 1.1
> Date: 2026-07-21
> Status: Final

## Conclusion First

Project documents are durable facts that the AI and team can reuse; they are not backups of chat transcripts. Every new or substantially revised document, except an index, uses the five-part structure below and covers one topic only. An agent reads the root index first, then opens only the documents needed for the task; it must not load the entire workspace at the start. At the end of work, it updates the affected `index.md` status.

## Body

### 1. Standard document structure

Except for `index.md`, every project document uses this order:

1. **Metadata header**: title, version, date, and status (Draft / In review / Current / Superseded / Archived). Owner, scope, and freshness metadata may be added, but do not replace the required fields. See the [Artifact Freshness Standard](./artifact-freshness-standard.md) for lifecycle semantics.
2. **Conclusion first**: 3–5 sentences covering the conclusion, scope, key constraint, or next step so readers can decide whether to continue.
3. **Body**: use heading levels for facts, decisions, evidence, or records; distinguish facts, inferences, and open questions.
4. **Related references**: link to other project documents with relative Markdown paths, such as `[Project Brief](../project-brief.md)`; do not use bare filenames or absolute paths.
5. **Change log**: record material changes in reverse chronological order, at least with date, version, and summary.

### 2. Document granularity

- One document answers one named question. When the topic changes, create a new document and link to it.
- Do not put “all requirements” or “every decision” in one body. Indexes navigate; focused documents contain the detail.
- When conclusions become hard to locate, split by topic first and add a parent index.

### 3. An index is navigation, not a body

`index.md` is the exception: it contains only metadata, directory entries, one-line descriptions, status, and relative-path links. It must not duplicate bodies, long conclusions, process logs, or detailed change history. Use entries such as `[Document title](./file.md) — one-line description (status)`.

### 4. Progressive retrieval and index maintenance

1. Start by reading the nearest root index (normally `workspace/index.md`) for navigation.
2. Read only the project brief, open questions, and focused documents required for the current task; do not load every directory at once.
3. Before entering a section, read that section's `index.md`, then follow only the relevant entries.
4. After creating, finalizing, retiring, or materially revising a document, update the parent `index.md` with its relative link, summary, status, and last-updated date.
5. At task completion, check that affected indexes still let the next reader or agent find the current facts.

## Related References

- [Workflow](./workflow.md): defines when to navigate, execute work, and capture knowledge.
- [Quality Gates](./quality-gates.md): verifies delivery and durable knowledge capture.
- [Artifact Freshness Standard](./artifact-freshness-standard.md): defines canonical facts, traces, replacement relationships, and archival handling.
- [Role Contract](./role-contract.md): defines agent judgment, confirmation, and iteration responsibilities.
- [Workspace Index](../workspace/index.md): root navigation for project facts.

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-21 | 1.1 | Unified document lifecycle states and linked the artifact freshness standard. |
| 2026-07-12 | 1.0 | Established document structure, granularity, indexing, and progressive retrieval rules. |
