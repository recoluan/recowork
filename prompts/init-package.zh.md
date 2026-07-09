# RecoWork 智能体初始化 Prompt

把下面这段 prompt 复制到 Codex、Cursor、Claude Code 等能执行命令或创建文件的 AI 智能体里。替换方括号里的值。

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
1. 先确认当前环境能执行命令，运行 `node --version` 和 `npm --version`。
2. 如果 Node.js 或 npm 缺失、不可用或版本过旧，先说明情况，并向我确认是否安装最新版稳定版 Node.js。只有在我确认后才安装，然后再次验证两个版本。
3. 运行：
   npx recowork add <模板> --target <target> --locale <语言> <目标位置>
4. 不要凭记忆重写模板，也不要擅自改用手机端聊天流程。
5. 初始化后展示文件树，说明创建了什么，并告诉我第一步怎么用。
```
