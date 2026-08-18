# Idea To Project Workflow

> Version: 1.0
> Status: Current

## Conclusion First

This is one workflow with two stages and one workspace. First determine whether the user is still exploring a direction. Only after the user explicitly confirms a direction and chooses project entry may exploration conclusions become inputs to project advancement. Indexes navigate; the direction decision package and project brief hold the current facts for their stages.

## Stage One: Exploration And Validation

1. Read `workspace/index.md`, `01-exploration-and-validation/index.md`, and root `open-questions.md`, then open focused indexes as needed.
2. Clarify the problem, users, scenario, constraints, success signals, known facts, and unknowns.
3. Explore multiple directions; for each, record value, key assumptions, risks, counterevidence, and the smallest validation.
4. Put falsifiable assumptions into validation; do not substitute more brainstorming for evidence.
5. Update `01-exploration-and-validation/direction-decision-package.md` with candidates, evidence, unselected directions, material risks, recommendation, and next step.
6. Stop and ask the user to choose explicitly: continue exploring, validate a key assumption, or confirm project entry for a named direction.

## Stage Gate: Confirm Project Entry

Enter project advancement only after explicit user confirmation. The record must include the selected direction, why to enter now, accepted risks, initial scope, and success criteria. Retain unselected directions as history or pending validation; do not delete their rationale.

## Stage Two: Project Advancement

1. Use the confirmed direction decision package as input to `project-brief.md`, completing goals, scope, non-goals, constraints, and success criteria.
2. If material project agreement gaps remain, update `open-questions.md` and wait for confirmation.
3. Within confirmed scope, use `02-requirements-and-constraints/`, `03-solution-design/`, `04-plan-and-decisions/`, `05-thinking-traces/`, and `06-review-and-validation/`.
4. Advance material work through planning, implementation, validation, canonical-record updates, and index maintenance.
5. Run the [Quality Gates](./quality-gates.md) and [Artifact Freshness Standard](./artifact-freshness-standard.md): consolidate Current conclusions in place, list archive candidates and wait for confirmation, then report results, risks, and next step.

## Related References

- [Role Contract](./role-contract.md)
- [Document Standard](./document-standard.md)
- [Quality Gates](./quality-gates.md)
- [Artifact Freshness Standard](./artifact-freshness-standard.md)
- [Workspace Index](../workspace/index.md)
