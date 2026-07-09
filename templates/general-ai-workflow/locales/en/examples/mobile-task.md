# Example: Mobile Task

A user wants AI to help write an event plan on a phone.

1. Generate initialization and task prompts with the `chatgpt-chat` target.
2. Fill in `workspace/task-brief.md` with the audience, budget, schedule, and delivery format.
3. Track unresolved event scale or channel choices in `open-questions.md` so AI asks before assuming.
4. Save the plan draft in `02-task-output/` and ask AI to review it against the checklist.
5. Finish with a continuation memory card and record a reusable planning structure in `04-review-and-reuse/`.
