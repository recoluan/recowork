---
title: Document Standard
version: 1.3
date: 2026-08-21
status: Current
---

# Document Standard

## Conclusion First

Learning-space documents are both course records and durable evidence of the learner's capability. Formal learning materials are organized by stable topics, course units, or project modules—not by each discussion, exercise, or agent action. Except for `index.md`, every new or substantially revised learning document uses the five-part structure and focuses on one stable learning topic, unit, or responsibility. Start from `learning-workspace/index.md`, then read the roadmap, progress, and relevant unit only as needed; update affected indexes after each learning session.

## Body

### Standard document structure

Except for `index.md`, every substantial learning document uses this order:

1. **Metadata header**: title, version, date, and status (Draft / In review / Current / Superseded / Archived). See the [Artifact Freshness Standard](./artifact-freshness-standard.md) for lifecycle semantics.
2. **Conclusion first**: 3-5 sentences covering what was learned, the evidence, key misconception, limitation, or next step.
3. **Body**: use heading levels for concepts, experiments, practice, feedback, verification, and the learner's own explanation.
4. **Related references**: use relative Markdown links to learning-workspace files.
5. **Change log**: record material updates with date, version, and summary.

### Granularity and indexes

- Each stable learning topic, course unit, or project module uses one directory. Its `index.md` is the current entry point and its `overall-plan.md` is the Current authority document for learning goals, the overall path, key conclusions, boundaries, and child-document relationships.
- Update `overall-plan.md` by default. Create a responsibility-specific child document only when it has an independent lifecycle, audience, review path, or change cadence—for example, `practice-guide.md`, `project-requirements.md`, or `acceptance-criteria.md`.
- Names must make the content and purpose clear before opening the file. When directory context is insufficient, use an object-and-responsibility name; never use process, “final”, “latest”, or version labels for a Current document.
- One document covers one stable learning topic, unit, or responsibility. Update new understanding, practice conclusions, and routine revisions in place. Split only for a new stable module or independent responsibility, then link it from the entry index.
- Do not place an entire course, all practice, and every retrospective in one unbounded body. Scale complex learning through module directories; when a document is hard to scan, split by stable responsibility.
- `index.md` contains only metadata, directory entries, one-line descriptions, status, and last-updated date; do not repeat lesson bodies or process detail. Formal directory indexes list only Current or still-open material; historical versions are entered only through `archive/index.md`.

### Progressive retrieval and maintenance

1. Read `learning-workspace/index.md` first, then the learner brief, roadmap, progress, and relevant section index as needed.
2. Open only the units, exercises, and retrospectives required for the current session.
3. After creating, materially revising, finalizing, or retiring a document, update the parent `index.md` link, summary, status, and date. Archive material updates only the archive index and never mixes into formal indexes.
4. At the end of every session, ensure indexes make it easy to resume learning later.

## Related References

- [Learning Method](./learning-method.md)
- [Assessment And Retrospective](./assessment-and-retrospective.md)
- [Artifact Freshness Standard](./artifact-freshness-standard.md)
- [Role Contract](./role-contract.md)
- [Learning Workspace Index](../learning-workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-08-21 | 1.3 | Defined module entry points, `overall-plan.md` authority documents, and responsibility-based splitting to prevent process-driven material sprawl. |
| 2026-08-18 | 1.2 | Limited formal indexes to Current content and moved history behind a separate archive index. |
| 2026-07-21 | 1.1 | Unified document lifecycle states and linked the artifact freshness standard. |
| 2026-07-12 | 1.0 | Established learning-document structure, granularity, indexing, and progressive-retrieval rules. |
