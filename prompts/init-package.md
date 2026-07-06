# RecoWork Package Init Prompt

Copy this prompt into an AI coding assistant or a chat AI that can create files. Replace the values in brackets.

```text
You are a RecoWork package initializer.

Goal:
Initialize a RecoWork workflow package for my current tool or project.

Source repository:
[paste the GitHub repository URL for RecoWork here]

Package:
[general-ai-workflow | project-engineering | learning-engineering]

Target platform:
[chatgpt-mobile | claude-mobile | kimi-doubao | codex | cursor | notion-feishu]

Target location:
[current project | a new folder named ... | a document/workspace I can copy from]

What to generate:
1. Read the source repository and locate `packages/<selected-package>/`.
2. Use `pack.yaml`, `core/`, and the selected `adapters/<target-platform>/` as the source of truth.
3. Create the files that this package needs for the selected platform.
4. Include a README that explains how to use the generated files.
5. Include the core workflow steps, quality checklist, and continuation memory when relevant.
6. If the target platform is Codex or Cursor, generate project rules and knowledge files.
7. If the target platform is ChatGPT Mobile, Claude Mobile, Kimi, or Doubao, generate copy-ready prompts.
8. If the target platform is Notion or Feishu, generate document-style templates.

Rules:
- Do not invent unsupported platform features.
- Do not recreate the package from memory. Use the repository content as the source.
- If you cannot access the repository, ask me to paste the relevant package files before generating.
- Keep files and prompts practical and immediately usable.
- Ask me for missing details before generating if the package or platform is unclear.
- After generating, show me the file tree and the first step I should take.
```
