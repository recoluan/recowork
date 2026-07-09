# RecoWork CLI 初始化 Prompt

把下面这段 prompt 复制到能执行命令或创建文件的 AI 编程助手里。替换方括号里的值。

```text
你正在为我初始化一个 RecoWork 工作流模板。

仓库地址：
https://github.com/recoluan/recowork

模板：
[general-ai-workflow | project-engineering | learning-engineering]

Target：
[chatgpt-chat | claude-chat | claude-code-project | kimi-doubao-chat | codex-project | cursor-project | notion-workspace | feishu-doc]

语言：
[zh | en]

目标位置：
[当前项目 | ./folder-name]

请这样做：
1. 优先使用 CLI。运行：
   npx recowork add <模板> --target <target> --locale <语言> <目标位置>
2. 如果当前环境不能使用 `npx`，再读取仓库内容，用 `templates/<模板>/`、可用时使用 `templates/<模板>/locales/<语言>/`，并结合 `targets/<target>/` 手动创建同等文件。
3. 不要凭记忆重写模板。
4. 初始化后展示文件树，说明创建了什么，并告诉我第一步怎么用。
```
