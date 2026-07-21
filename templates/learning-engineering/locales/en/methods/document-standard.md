---
title: Document Standard
version: 1.1
date: 2026-07-21
status: Current
---

# Document Standard

## Conclusion First

Learning-space documents are both course records and durable evidence of the learner's capability. Except for `index.md`, every new or substantially revised learning document uses the five-part structure and focuses on one learning question, unit, or conclusion. Start from `learning-workspace/index.md`, then read the roadmap, progress, and relevant unit only as needed; update affected indexes after each learning session.

## Body

### Standard document structure

Except for `index.md`, every substantial learning document uses this order:

1. **Metadata header**: title, version, date, and status (Draft / In review / Current / Superseded / Archived). See the [Artifact Freshness Standard](./artifact-freshness-standard.md) for lifecycle semantics.
2. **Conclusion first**: 3-5 sentences covering what was learned, the evidence, key misconception, limitation, or next step.
3. **Body**: use heading levels for concepts, experiments, practice, feedback, verification, and the learner's own explanation.
4. **Related references**: use relative Markdown links to learning-workspace files.
5. **Change log**: record material updates with date, version, and summary.

### Granularity and indexes

- One document covers one learning unit, question, retrospective, or reusable conclusion. Split when the topic changes.
- Do not place an entire course, all practice, and every retrospective in one body.
- `index.md` contains only metadata, directory entries, one-line descriptions, status, and last-updated date; do not repeat lesson bodies or process detail.

### Progressive retrieval and maintenance

1. Read `learning-workspace/index.md` first, then the learner brief, roadmap, progress, and relevant section index as needed.
2. Open only the units, exercises, and retrospectives required for the current session.
3. After creating, materially revising, finalizing, or retiring a document, update the parent `index.md` link, summary, status, and date.
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
| 2026-07-21 | 1.1 | Unified document lifecycle states and linked the artifact freshness standard. |
| 2026-07-12 | 1.0 | Established learning-document structure, granularity, indexing, and progressive-retrieval rules. |
