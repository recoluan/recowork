# RecoWork Agent Initialization Prompt

Copy this prompt into a command-capable AI agent such as Codex, Cursor, or Claude Code. Replace the values in brackets.

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
1. Confirm this environment can execute commands. Run `node --version` and `npm --version` first.
2. If Node.js or npm is missing, unavailable, or outdated, explain the situation and ask for my confirmation before installing the latest stable Node.js. Only install after I confirm, then verify both versions again.
3. Run:
   npx recowork add <template> --target <target> --locale <locale> <destination>
4. Do not regenerate the template from memory or silently substitute a mobile-chat workflow.
5. If the CLI cannot run, read `templates/<template>/locales/<locale>/`, shared `targets/<target>/files/`, and `targets/<target>/locales/<locale>/files/` from the repository before manually composing equivalent output.
6. After initialization, show the file tree, explain what was created, and tell me the first step.
```
