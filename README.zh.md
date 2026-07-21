# RecoWork

RecoWork 将可重复的 AI 使用方式沉淀为可复用、可持续的工程化工作流。它提供日常任务、想法探索、学习和项目四类模板，内置确认、自审、产物保鲜与从对话迁移到本地工作的机制。

English: [README.md](./README.md) | 网站：[RecoWork](https://recowork.recoluan.com)

## 两种使用环境

| 使用环境 | 适用情况 | 交付内容 |
| --- | --- | --- |
| `local-agent-project` | 工作需要持续推进、沉淀、评审或升级 | `AGENTS.md`、工作方法、带索引的工作空间、中间产物与 `rw-manifest.json`。 |
| `chat-mobile` | 希望在任意网页、App 或手机聊天中快速开始 | 启动指令、任务执行协议，以及需要手动保存的续接/迁移摘要。 |

本地工作流是工具中立的，可由 Codex、Claude Code、Cursor 等具备命令执行能力的 Agent 使用；它刻意不生成平台专属 skill 或配置目录。

对话连续性需要手动维护：保存摘要并粘贴到下一轮对话。任务变为长期、多人、知识密集或需要审计时，使用迁移包进入本地 Agent。

## 模板

| 模板 | 适用场景 |
| --- | --- |
| `general-ai-workflow`（`general`） | 需要上下文、自审与续接的日常任务。 |
| `idea-engineering`（`idea`） | 脑暴、方向归纳、假设验证和确认下一步。 |
| `learning-engineering`（`learning`） | 学习诊断、路线、章节、练习与复盘。 |
| `project-engineering`（`project`） | 有工作方法、文档规范、工作空间记录与质量门禁的 AI 辅助项目。 |

## 用 CLI 初始化

```bash
npx recowork add project --target local-agent-project --locale zh .
npx recowork add learning --target local-agent-project --locale zh ./langchain-study
npx recowork add idea --target chat-mobile --locale zh ./idea-chat-kit
```

安装后的命令是 `rw`。使用 `rw list` 和 `rw targets` 查看模板与使用环境。

## 让 AI 初始化

在具备命令执行能力的本地 Agent 中粘贴：

```text
请在当前目录初始化 RecoWork 的 `project-engineering` 模板，使用 `local-agent-project` 环境和中文。

先检查 Node.js 与 npm 是否可用。如缺失或版本过旧，请说明情况并先征求我的确认，再安装最新稳定版 Node.js。确认后执行：

npx recowork add project-engineering --target local-agent-project --locale zh .

然后检查生成结果，并告诉我你需要我确认的第一个项目决策。仓库地址：https://github.com/recoluan/recowork
```

在网页或手机聊天中，初始化 `chat-mobile`，将其中的“启动指令”粘贴到对话即可。不需要 Node.js、CLI 或本地文件。

## 长期沉淀

RecoWork 不再创建独立知识库。已验证结论应写入工作空间中对应的权威文档，并更新受影响的 `index.md`。这样 Agent 能从索引按需读取，而不是一次加载所有内容。

## 升级

如果目录已经存在 `rw-manifest.json`，`rw add` 会拒绝覆盖；请使用 `rw status <目录>` 与 `rw upgrade --check <目录>` 查看既有工作流。`rw upgrade --apply` 只更新未被修改的工作方法或 target 文件，绝不会覆盖、移动或删除用户自己的工作空间文件。旧 Chat 工作流会得到迁移指引，在单独目录创建本地工作流。

完整约定见 [specs/targets.md](./specs/targets.md)、[specs/requirements.md](./specs/requirements.md) 与 [CHANGELOG.zh.md](./CHANGELOG.zh.md)。
