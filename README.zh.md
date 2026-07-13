# RecoWork

RecoWork 把实用 AI 工作流做成可复用模板，并初始化到用户真实使用的工具和环境里。

它不是提示词合集。RecoWork 的模板负责描述工作场景，target 负责描述这个工作流要输出到哪里、应该生成哪些文件或 prompt，locale 负责描述生成语言和用户可见路径。CLI 会把三者组合成真实产物。

## 为什么做

很多人用不好 AI，不只是提示词问题，更是工程化问题：

- 提示词分散，难以复用；
- AI 在不同会话之间容易忘记上下文；
- 不同平台需要不同文件或 prompt 格式；
- 项目知识很少被沉淀；
- 用户需要的是可重复工作流，而不是一次性回答。

RecoWork 把工作流方法和输出目标拆开，让场景可以复用，目标格式也可以复用。

## 架构

```text
.
├── templates/        # 场景模板
├── targets/          # 可复用输出目标
├── cli/              # rw 命令实现
├── prompts/          # 让 AI 调用 CLI 的短 prompt
├── docs/             # GitHub Pages 静态站点
├── specs/            # 产品和工程规范
├── AGENTS.md         # AI 协作入口
└── package.json
```

模板描述工作场景：

| 模板 | 用途 |
| --- | --- |
| `general-ai-workflow` | 日常 AI 使用，包含角色设定、任务上下文、续聊记忆、自审和复盘沉淀。 |
| `project-engineering` | 项目级 AI 工作流，包含规则、文档规范、按需获取、知识沉淀和质量门禁。 |
| `learning-engineering` | 学习工程化，包含学习诊断、课程路线、章节、练习、项目实践、反馈和知识沉淀。 |

下一版架构标准把这层定义为 target。Target 描述具体使用环境：

- `chatgpt-chat`
- `claude-chat`
- `claude-code-project`
- `codex-project`
- `cursor-project`
- `notion-workspace`
- `feishu-doc`

Target 标准记录在 `specs/targets.md`。

## CLI 用法

npm 包名是 `recowork`，可执行命令是 `rw`。

通过 `npx` 使用：

```bash
npx recowork list
npx recowork targets
npx recowork add project --target codex-project --locale zh .
npx recowork add project --target claude-code-project --locale en .
npx recowork add general --target chatgpt-chat --locale zh ./my-ai-workflow
npx recowork add learning --target chatgpt-chat --locale zh ./my-learning-workflow
```

在当前仓库里运行：

```bash
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
node cli/recowork/bin/rw.js add project --target codex-project --locale zh .
```

`rw init` 会保留为 `rw add` 的别名。

当模板支持多语言时，可以通过 `--locale zh` 或 `--locale en` 选择生成语言。locale 同时决定用户可见的模板和 target 文件路径，例如中文 `知识库/` 与英文 `knowledge/`。不传时使用模板默认语言。

## 更新已有工作流

新初始化的工作流会包含带版本的 `rw-manifest.json`，让 RecoWork 能识别生成文件的变化，同时不接管用户的项目内容。

```bash
npx recowork status .
npx recowork upgrade --check .
npx recowork upgrade --plan .
npx recowork upgrade --apply .
```

`--check` 和 `--plan` 都是只读操作，并会遵循 `--scope`。`--apply` 只更新未被用户改动的工作方法和 target 文件。工作空间文档始终归用户所有，RecoWork 不会覆盖、移动、删除或恢复它们。若要补齐新版新增且当前缺失的工作空间模板，必须显式执行下面命令；它会在 `.recowork/upgrade-reports/` 生成一份供人工处理的升级报告，不会改动工作空间。

```bash
npx recowork upgrade --apply --scope workspace --add-missing .
```

旧项目使用的是旧版清单，需要先建立基线，且不会改动项目文件：

```bash
npx recowork upgrade --adopt .
```

## Prompt 用法

Prompt 模式不应该让 AI 在聊天里重写完整模板，而是优先让 AI 安装或运行 CLI：

```text
请为当前项目初始化 RecoWork 模板 `project-engineering`，target 是 `codex-project`。
请运行：
npx recowork add project-engineering --target codex-project --locale zh .

如果当前环境不能使用 npx，请使用：
https://github.com/recoluan/recowork
templates/project-engineering/
targets/codex-project/
```

完整 prompt 模板：

- `prompts/init-package.md`
- `prompts/init-package.zh.md`

## 开发

产品和工程规范放在 `specs/`：

- `specs/targets.md`
- `specs/requirements.md`
- `specs/decisions.md`

## 更新日志

发布记录见 [CHANGELOG.md](./CHANGELOG.md) 和 [CHANGELOG.zh.md](./CHANGELOG.zh.md)。站点同步提供[中英文发布记录](https://recoluan.github.io/recowork/releases.html)。

校验命令：

```bash
node --check cli/recowork/bin/rw.js
node --check docs/app.js
node cli/recowork/bin/rw.js list
node cli/recowork/bin/rw.js targets
node cli/recowork/bin/rw.js add project --target codex-project --locale zh /private/tmp/recowork-project-test
```

## License

MIT
