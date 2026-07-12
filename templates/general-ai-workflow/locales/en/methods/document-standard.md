---
title: Document Standard
version: 1.0
date: 2026-07-12
status: Final
---

# Document Standard

## Conclusion First

Daily AI work captures only the minimum context needed to continue, but it must remain easy for people and agents to find, understand, and reuse. Except for `index.md` files and very short temporary lists, substantial task documents use the five-part structure and cover one topic only. Start with `workspace/index.md`, open specific files only as needed, and update affected indexes when the task ends.

## Body

### Standard document structure

Except for `index.md`, substantial documents use this order:

1. **Metadata header**: title, version, date, and status (Draft / In review / Final).
2. **Conclusion first**: 3-5 sentences covering the conclusion, limitation, or next step; a short task may use 1-3 bullets.
3. **Body**: use heading levels for task facts, outputs, judgments, or retrospectives, and distinguish facts, inferences, and open questions.
4. **Related references**: use relative Markdown links to other workspace files.
5. **Change log**: record material changes with date, version, and summary.

### Granularity and indexes

- One document answers one named question. Create and link a new document when the topic changes.
- Do not combine task background, working trace, final output, and retrospective in one large document.
- `index.md` files are navigation only: metadata, links, one-line descriptions, status, and last-updated date, without duplicated body text.

### Progressive retrieval and maintenance

1. Read `workspace/index.md` first, then the brief, open questions, and the relevant section index.
2. Load only files required for the current task, never the full workspace by default.
3. After creating, materially revising, finalizing, or retiring a document, update the parent `index.md` link, summary, status, and date.
4. At completion, confirm the next reader or agent can find the current conclusion from the indexes.

## Related References

- [Workflow](./workflow.md)
- [Self-Review And Retrospective Checklist](./quality-checklist.md)
- [Role Contract](./role-contract.md)
- [Workspace Index](../workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-12 | 1.0 | Established lightweight task documentation, indexing, and progressive-retrieval rules. |
