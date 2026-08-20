# 通过 AI Agent 初始化 RecoWork

此 Prompt 只适用于具备命令执行能力的本地 Agent。

```text
请在 [destination] 初始化 RecoWork 模板 [idea-to-project | learning-engineering | web-design-standard]，使用 [local-agent-project] 环境和 [zh | en] 语言。

先检查 Node.js 与 npm 是否可用。如果缺失或版本过旧，请说明为什么需要它，并先征求我的确认，再安装最新稳定版 Node.js。确认后执行：

npx --yes recowork@latest add [template] --target local-agent-project --locale [locale] [destination]

该命令会临时获取 RecoWork，无需预先全局安装 `rw`。除非 RecoWork 已经全局安装，否则不要把它替换成 `rw`。

检查生成结果。不要创建平台专属 skill 或配置目录。先阅读 AGENTS.md，再由你在初始化后的项目根目录运行 `npx --yes recowork@latest view .`。它会自动识别工作空间并打开本地只读站点；报告站点地址，不要让我安装 RecoWork、查找工作空间目录或输入命令。然后告诉我开始有效工作前需要我确认的第一个决策。

只有在 `npx` 无法运行时，才将 https://github.com/recoluan/recowork 作为备用来源；先说明限制，再手动组合所选模板与 target。
```

网页或手机聊天应使用 `chat-mobile`：由另一台可运行 CLI 的机器初始化，或从仓库复制该 target 的对话材料。不要要求纯聊天环境安装 Node.js 或创建本地文件。
