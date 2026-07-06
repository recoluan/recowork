# RecoWork

RecoWork 是一个把实用 AI 工作流打包成可复用、可落地、可跨平台使用的工具包。

它不是提示词集合。一个 RecoWork 工作流包会同时提供提示词、项目规则、知识库模板、续聊记忆卡和使用步骤，让用户能在不同 AI 工具里更稳定地完成任务。

## 为什么做

很多人已经能用到强大的 AI 工具，但真正用好 AI 仍然很难：

- 提示词分散，难以复用；
- AI 在不同会话之间容易忘记上下文；
- 不同工具需要不同格式；
- 项目知识很少被沉淀；
- 用户需要的是工作流，而不只是一段回答。

RecoWork 的目标是把可重复的 AI 工作变成工作流包，并根据用户正在使用的工具生成对应版本。

## 工作流包

首批三个工作流包：

| 包名 | 用途 | 典型用户 |
| --- | --- | --- |
| `general-ai-workflow` | 日常 AI 使用，包含初始化提示词、任务卡、续聊记忆和自审清单。 | ChatGPT Mobile、Claude Mobile、Kimi、豆包用户 |
| `project-engineering` | 项目级 AI 工作流，包含 `AGENTS.md`、skills、知识库目录和质量门禁。 | Codex、Cursor、Claude Code、开发者工作流 |
| `learning-engineering` | 学习工程化工作流，包含学习路线、章节、练习、反馈和进度追踪。 | 学习者、老师、培训场景 |

每个包描述一个工作场景，然后可以根据目标平台导出成 ChatGPT Mobile、Codex、Cursor、Notion / 飞书等版本。

## 支持的工具

当前支持的输出平台：

- `chatgpt-mobile`
- `claude-mobile`
- `kimi-doubao`
- `codex`
- `cursor`
- `notion-feishu`

同一个工作流包可以根据选择的平台生成不同文件。

## 两种使用方式

RecoWork 同时支持直接复制 prompt 的用户，也支持用 CLI 初始化项目文件的用户。

### 1. Prompt 初始化模式

不想运行 CLI 时使用这种方式。复制一段初始化 prompt 给 AI 编程助手或普通聊天 AI，然后告诉它你想初始化哪个包、面向哪个平台。

这段 prompt 需要包含来源仓库地址，让 AI 知道应该从哪里读取包内容。项目发布到 GitHub 后，把占位符替换成真实仓库地址。

Prompt 模板：

```text
prompts/init-package.zh.md
```

典型流程：

1. 打开 `prompts/init-package.zh.md`。
2. 替换来源仓库地址、工作流包、目标平台和目标位置。
3. 把 prompt 复制给 AI 助手。
4. AI 会生成需要的文件或可复制内容。
5. 检查生成的文件树，然后从生成的 README 开始使用。

Prompt 初始化模式适合不想本地安装工具、希望直接让 AI 帮忙生成工作流包的人。

如果 AI 助手无法访问 GitHub 仓库，就把 `packages/<pack>/` 里的相关文件粘贴给它，让它基于这些文件初始化。

### 2. CLI 初始化模式

当你希望 RecoWork 自动为项目或工作区生成文件时，使用 CLI 模式。它更适合 Codex、Cursor、Notion / 飞书，或者本地结构化工作流。

## 项目结构

```text
.
├── packages/
│   ├── general-ai-workflow/
│   ├── project-engineering/
│   └── learning-engineering/
├── cli/
│   └── recowork/
└── site/
    ├── index.html
    ├── styles.css
    └── app.js
```

包结构：

```text
packages/<pack>/
├── pack.yaml
├── README.md
├── core/
├── adapters/
└── examples/
```

- `pack.yaml` 描述这个包适合谁、解决什么问题、支持哪些工具。
- `core/` 保存这个场景的通用方法。
- `adapters/` 保存不同工具的使用版本。
- `examples/` 保存真实使用样例。

## CLI 用法

CLI 的 npm 包名是 `recowork`，可执行命令是 `rw`。

在当前仓库里可以直接这样运行：

```bash
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js platforms
node cli/recowork/bin/rw.js show project
```

初始化一个工作流包：

```bash
node cli/recowork/bin/rw.js init general --platform chatgpt-mobile ./my-ai-workflow
node cli/recowork/bin/rw.js init project --platform codex .
node cli/recowork/bin/rw.js init learning -p notion ./langchain-study
```

以后如果作为包安装，预期命令形式是：

```bash
rw list
rw platforms
rw init project --platform codex .
```

## 网站

静态网站放在 `site/`，用于 GitHub Pages 展示。

本地直接打开：

```text
site/index.html
```

网站介绍了项目定位、三个首批工作流包、支持工具和 CLI 使用方式。网站支持英文和中文切换。

## 开发校验

当前校验命令：

```bash
node --check cli/recowork/bin/rw.js
node --check site/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js platforms
```

初始化测试：

```bash
node cli/recowork/bin/rw.js init project --platform codex /private/tmp/recowork-project-test
node cli/recowork/bin/rw.js init learning -p notion /private/tmp/recowork-learning-test
```

## License

MIT
