# RecoWork CLI Init Prompt

Copy this prompt into an AI coding assistant that can run shell commands or edit files. Replace the values in brackets.

```text
You are initializing a RecoWork workflow template.

Repository:
https://github.com/recoluan/recowork

Template:
[general-ai-workflow | project-engineering | learning-engineering]

Target:
[chatgpt-chat | claude-chat | claude-code-project | kimi-doubao-chat | codex-project | cursor-project | notion-workspace | feishu-doc]

Locale:
[en | zh]

Destination:
[current project | ./folder-name]

Do this:
1. Prefer the CLI path. Run:
   npx recowork add <template> --target <target> --locale <locale> <destination>
2. If `npx` is unavailable, inspect the repository and use `templates/<template>/`, `templates/<template>/locales/<locale>/` when available, plus `targets/<target>/` to create the same files manually.
3. Do not regenerate the template from memory.
4. After initialization, show the file tree, explain what was created, and tell me the first step.
```
