# 通过 AI Agent 初始化 RecoWork

此 Prompt 只适用于具备命令执行能力的本地 Agent。

```text
请在 [destination] 初始化 RecoWork 模板 [general-ai-workflow | idea-engineering | learning-engineering | project-engineering]，使用 [local-agent-project] 环境和 [zh | en] 语言。

先检查 Node.js 与 npm 是否可用。如果缺失或版本过旧，请说明为什么需要它，并先征求我的确认，再安装最新稳定版 Node.js。确认后执行：

npx recowork add [template] --target local-agent-project --locale [locale] [destination]

检查生成结果。不要创建平台专属 skill 或配置目录。先阅读 AGENTS.md，再告诉我开始有效工作前需要我确认的第一个决策。

仓库地址：https://github.com/reco-dev/recowork
```

网页或手机聊天应使用 `chat-mobile`：由另一台可运行 CLI 的机器初始化，或从仓库复制该 target 的对话材料。不要要求纯聊天环境安装 Node.js 或创建本地文件。
