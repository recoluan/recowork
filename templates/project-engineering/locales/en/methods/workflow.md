# Project Engineering Workflow

> Version: 1.1
> Date: 2026-07-12
> Status: Final

## Conclusion First

Navigate with indexes first, then read project documents only as needed; do not put the entire workspace into context. Clarify goals, boundaries, and open questions before work; validate, capture conclusions, and update affected indexes afterwards. [Document Standard](./document-standard.md) defines document format, granularity, and references.

## Start A Project

1. Clarify the project goal, users, boundaries, and success criteria.
2. Create and maintain `project-brief.md`.
3. Establish the AI working agreement.
4. Create `workspace/` and organize content under `01-requirements-and-constraints/`, `02-solution-design/`, `03-plan-and-decisions/`, `04-thinking-traces/`, and `05-review-and-validation/`.
5. Use `open-questions.md` for questions AI must not silently assume.
6. Define pre-output self-review and post-change knowledge capture rules.

## Execute A Task

1. Read `workspace/index.md` first, then project rules and relevant knowledge as needed.
2. Produce a plan.
3. Implement the change.
4. Validate the result.
5. Update relevant `workspace/` documents and decision records according to the [Document Standard](./document-standard.md), then update affected `index.md` statuses.
6. Summarize changes and risks.

## Related References

- [Document Standard](./document-standard.md)
- [Quality Gates](./quality-gates.md)
- [Workspace Index](../workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-12 | 1.1 | Added index-first navigation, progressive retrieval, and index maintenance. |
