# RecoWork

**让你已经在使用的 AI Agent，持续完成真实工作。**

RecoWork 是面向人和 AI Agent 的工作标准与项目事实层。它不替代 Agent runtime，不托管模型，不在后台替你运行任务，也不管理你的 API Key。

它把任务、专业标准、当前事实、验收方式和续接机制固定下来，让一次有价值的对话变成可以继续、检查和复用的工作。

[English](./README.md) · [网站](https://recoluan.github.io/recowork/) · [使用方式](https://recoluan.github.io/recowork/usage.html)

## 能解决什么工作

| 真实工作 | RecoWork 固定什么 | 当前模板 |
| --- | --- | --- |
| 推进一个项目 | 项目简报、未决问题、方案、决策、评审 | `project-engineering` |
| 用证据学习 | 诊断、路线、练习、项目实践、复盘 | `learning-engineering` |
| 把想法收敛成方向 | 问题定义、假设、验证、下一步决策 | `idea-engineering` |
| 提升网页交付质量 | 视觉方向、响应式规则、组件状态、自检 | `web-design-standard` |

网页设计规范是独立可复用的专业标准，当前单独验证，不把它包装成与项目工作流完全相同的场景。

## 两种使用环境

### 本地可执行 Agent

适合长期项目、代码、复杂学习，以及需要持续沉淀或可审查过程的工作。RecoWork 会在你选择的目录中初始化根目录 `AGENTS.md`、工作方法、适用的本地化工作空间和版本化清单。

### Chat / Mobile

适合快速开始、临时任务和轻量对话。它只提供启动指令、任务执行协议和续接/迁移摘要，不要求 Node.js、CLI、本地目录、自动保存、升级或文件级可追溯性。

聊天连续性由你管理：保存并在下一轮对话中粘贴续接摘要。当任务变成长期工作、多人协作、知识沉淀或可审计过程时，使用迁移包新建一个独立的本地工作流。

## 在本地初始化

在能够执行命令的本地 Agent 中，使用确定性的 CLI 初始化：

```bash
npx recowork add project --target local-agent-project --locale zh .
```

按需要换成其他工作场景或语言：

```bash
npx recowork list
npx recowork add learning --target local-agent-project --locale zh ./my-learning-work
npx recowork add idea --target local-agent-project --locale zh ./idea-work
```

安装后可使用 `rw` 命令；未全局安装时使用 `npx recowork`。

## 让本地 Agent 帮你开始

将下面指令发给能够执行命令的本地 Agent：

```text
请在当前目录初始化 RecoWork 项目工作流。

仓库地址：https://github.com/recoluan/recowork
执行：npx recowork add project --target local-agent-project --locale zh .

先检查 Node.js 和 npm。任一项缺失或版本过旧时，先说明阻塞原因，并向我确认后再安装最新版稳定版 Node.js。若根目录已有 AGENTS.md，保留既有内容，并确认 RecoWork 只新增带稳定标记的整合区块。完成后展示创建的文件，并说明第一步如何开始工作。
```

纯聊天或手机端请通过网站选择器生成可复制的聊天启动指令；不要在这类环境中运行 CLI 或模拟创建本地文件。

## 能力边界

- Agent 由你控制，RecoWork 不替你运行它。
- 本地项目文件保存在你选择的位置。
- AI 的产出、建议和修改仍需要人工审查。
- RecoWork 不承诺自动记忆、无限执行或无人值守完成。
- 未完成实际兼容性验证前，不将具体 Agent 产品描述为官方支持。

## 开发

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
```

产品和 target 约定见 [specs/requirements.md](./specs/requirements.md)、[specs/targets.md](./specs/targets.md) 与 [specs/decisions.md](./specs/decisions.md)。未发布和已发布变更见 [CHANGELOG.zh.md](./CHANGELOG.zh.md)。
