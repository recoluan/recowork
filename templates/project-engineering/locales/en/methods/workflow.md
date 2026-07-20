# Project Engineering Workflow

> Version: 1.2
> Date: 2026-07-20
> Status: Final

## Conclusion First

Navigate with indexes first, then read project documents only as needed; do not put the entire workspace into context. At the start of project planning, form a project agreement and wait for user confirmation before designing a solution, plan, or implementation change; validate, capture conclusions, and update affected indexes afterwards. [Document Standard](./document-standard.md) defines document format, granularity, and references.

## Start A Project

1. Clarify the project goal, users, boundaries, and success criteria.
2. Record known information, assumptions, and constraints in a draft `project-brief.md`, and use `open-questions.md` for questions AI must not silently assume.
3. Present a short project agreement and ask the user to explicitly confirm or correct it.
4. Until confirmation, do not generate a complete solution, plan, or implementation change.
5. After confirmation, establish the AI working agreement and create `workspace/` organized under `01-requirements-and-constraints/`, `02-solution-design/`, `03-plan-and-decisions/`, `04-thinking-traces/`, and `05-review-and-validation/`.
6. Define pre-output self-review and post-change knowledge capture rules.

## Execute A Task

1. Read `workspace/index.md` first, then project rules and relevant knowledge as needed.
2. Confirm that the current local task was explicitly approved by the user; if not, update the project brief or open questions and wait for confirmation.
3. Produce a plan.
4. Implement the change.
5. Validate the result.
6. Update relevant `workspace/` documents and decision records according to the [Document Standard](./document-standard.md), then update affected `index.md` statuses.
7. Summarize changes and risks.

## Related References

- [Document Standard](./document-standard.md)
- [Quality Gates](./quality-gates.md)
- [Workspace Index](../workspace/index.md)

## Change Log

| Date | Version | Change |
| --- | --- | --- |
| 2026-07-20 | 1.2 | Added a project-agreement confirmation gate: first planning and unconfirmed scopes cannot directly generate a solution, plan, or implementation change. |
| 2026-07-12 | 1.1 | Added index-first navigation, progressive retrieval, and index maintenance. |
