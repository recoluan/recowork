---
title: Document Standard
version: 1.0
date: 2026-07-21
status: Current
---

# Document Standard

## Conclusion First

Idea exploration must preserve divergent traces while keeping the current conclusion easy to find and reuse. Except for `index.md` files and very short temporary lists, every substantial document uses the five-part structure and covers one topic only. Start from `idea-space/index.md`, open specific files only as needed, and update affected indexes when exploration ends.

## Body

### Standard Document Structure

Except for `index.md`, substantial documents use this order:

1. **Metadata header**: title, version, date, and status (Draft / In review / Current / Superseded / Archived).
2. **Conclusion first**: 3-5 sentences covering the current conclusion, limitation, or next step.
3. **Body**: use heading levels for questions, directions, hypotheses, evidence, or decisions; distinguish facts, inferences, and open questions.
4. **Related references**: use relative Markdown links to other files.
5. **Change log**: record material changes with date, version, and summary.

### Granularity And Indexes

- One document answers one named question. Create and link a new document when the topic changes.
- `index.md` files are navigation only: links, one-line descriptions, status, and last-updated date, without duplicated body content.

### Progressive Retrieval And Maintenance

1. Read `idea-space/index.md` first, then open the brief, open questions, and the relevant stage index as needed.
2. Load only files required for the current exploration, never the full idea space by default.
3. After creating, materially revising, finalizing, superseding, or archiving a document, update the parent `index.md` link, summary, status, and date.
4. At the end of exploration, confirm that the next reader or agent can find the current direction and next step from the indexes.

## Related References

- [Role Contract](./role-contract.md)
- [Divergence And Convergence](./divergence-and-convergence.md)
- [Hypothesis And Evidence Standard](./hypothesis-and-evidence-standard.md)
- [Artifact Freshness Standard](./artifact-freshness-standard.md)
- [Idea Space Index](../idea-space/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-21 | 1.0 | Established document structure, indexes, and progressive retrieval rules for idea exploration. |
