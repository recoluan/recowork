(function registerRecoWorkDashboard() {
  const loader = window.__ModuleLoader__
  if (!loader || typeof loader.load !== 'function') throw new Error('recowork-dsh requires the DSH Web module loader.')

  loader.load({ id: 'recowork-dsh', factory(require) {
    const React = require('react')
    const { createElement: h, useEffect, useState, useSyncExternalStore } = React
    const copy = {
      zh: {
        open: '打开 RecoWork', title: 'RecoWork', collapse: '收起', addWorkspace: '新建工作区', settings: '状态与设置', back: '返回项目',
        value: '跨会话接着做，不用重新解释项目', workspace: '项目工作区', noRoots: '尚未配置授权目录', noWorkspaces: '当前授权目录下没有 RecoWork 工作区',
        setupTitle: '先连接一个安全目录', setupBody: 'RecoWork 只会读取和创建你明确授权的目录。请先按安装说明运行 setup。', loading: '正在读取项目上下文…', reload: '重新读取', retry: '重新读取项目',
        continueLabel: '继续当前工作', continueGeneric: '读取项目规则与当前材料，确认最合适的下一步', continueDescription: 'RecoWork 会把工作区路径、当前状态、项目协议和本次目标一起交给当前会话。', continueAction: '带着完整上下文继续',
        copyTask: '复制任务包', copied: '任务包已复制。', sent: '任务已加入当前 DSH 会话队列。', sending: '发送中…', sentButton: '已发送', decisions: '需要你决定', blocking: '{count} 项正在阻塞', noBlocking: '当前没有从待确认问题中识别到阻塞决策。', decide: '和 Agent 一起决策', sourceQuestion: '待确认问题',
        progress: '项目推进', current: '当前：{stage}', unknownStage: '阶段尚未识别', stages: ['问题定义', '探索验证', '进入项目', '推进交付'], memory: '项目记忆', memoryHint: '来自项目简报的稳定条目', noMemory: '项目简报中还没有可提取的稳定共识。',
        review: '只读复核项目', details: '项目状态', root: '授权目录', template: '模板', language: '语言', documents: '当前文档', healthComplete: '基础文档完整', healthMissing: '缺少 {count} 份基础文档', modified: '{count} 项受管文件由用户修改',
        initTitle: '新建工作区', destination: '新工作区相对路径', confirmation: '我确认目标目录不存在或为空；初始化不会覆盖已有工作区。', confirmInit: '确认并初始化', initializing: '初始化中…', chooseDestination: '请选择授权目录并填写新工作区相对路径。', confirmationRequired: '请先确认初始化不会覆盖已有工作区。',
        idea: '从想法到落地', learning: '系统性学习', design: '网页设计规范', chinese: '中文', english: 'English', statusUnavailable: '无法读取项目状态。', initUnavailable: '无法初始化工作区。',
      },
      en: {
        open: 'Open RecoWork', title: 'RecoWork', collapse: 'Collapse', addWorkspace: 'New workspace', settings: 'Status & settings', back: 'Back to project',
        value: 'Resume across sessions without re-explaining the project', workspace: 'Project workspace', noRoots: 'No approved directory configured', noWorkspaces: 'No RecoWork workspace in this approved directory',
        setupTitle: 'Connect a safe directory first', setupBody: 'RecoWork only reads and creates inside directories you explicitly approve. Run setup from the installation guide first.', loading: 'Reading project context…', reload: 'Refresh', retry: 'Read project again',
        continueLabel: 'Continue current work', continueGeneric: 'Read the project rules and current material, then identify the best next step', continueDescription: 'RecoWork sends the workspace path, current status, project protocol, and this objective to the current session together.', continueAction: 'Continue with full context',
        copyTask: 'Copy task package', copied: 'Task package copied.', sent: 'Task added to the current DSH session queue.', sending: 'Sending…', sentButton: 'Sent', decisions: 'Needs your decision', blocking: '{count} blocking items', noBlocking: 'No blocking decision was identified in open questions.', decide: 'Decide with Agent', sourceQuestion: 'Open question',
        progress: 'Project progress', current: 'Current: {stage}', unknownStage: 'Stage not identified', stages: ['Problem', 'Explore', 'Project entry', 'Delivery'], memory: 'Project memory', memoryHint: 'Stable items from the project brief', noMemory: 'No stable agreement can be extracted from the project brief yet.',
        review: 'Review project read-only', details: 'Project status', root: 'Approved directory', template: 'Template', language: 'Language', documents: 'Current documents', healthComplete: 'Core documents complete', healthMissing: '{count} core documents missing', modified: '{count} managed files modified by the user',
        initTitle: 'New workspace', destination: 'New workspace relative path', confirmation: 'I confirm the destination does not exist or is empty; initialization will not overwrite an existing workspace.', confirmInit: 'Confirm and initialize', initializing: 'Initializing…', chooseDestination: 'Choose an approved directory and enter a new workspace relative path.', confirmationRequired: 'Confirm that initialization will not overwrite an existing workspace.',
        idea: 'Idea to project', learning: 'Learning engineering', design: 'Web design standard', chinese: 'Chinese', english: 'English', statusUnavailable: 'Unable to read project status.', initUnavailable: 'Unable to initialize workspace.',
      },
    }

    const format = (message, values) => message.replace(/\{(\w+)\}/g, (whole, key) => key in values ? String(values[key]) : whole)

    function makePrompt(action, status, root, destination) {
      const zh = status.manifest.locale === 'zh'
      const base = zh
        ? `继续处理 RecoWork 工作区：${status.destination}\n\n先调用 recowork_status（root：${root}，destination：${destination}），再读取项目根目录 AGENTS.md 及其中指定的本地化工作方法。工作区文档是唯一事实来源；不要建立第二套项目记录。`
        : `Continue the RecoWork workspace: ${status.destination}\n\nFirst call recowork_status (root: ${root}; destination: ${destination}), then read the root AGENTS.md and the localized working methods it names. Workspace documents are the only source of truth; do not create a second project record.`
      if (action.kind === 'orient') return `${base}\n\n${zh ? '说明当前阶段、已确认结论、待确认事项和一个建议的下一步；除非用户另行要求，不要修改文件。' : 'Report the current stage, confirmed conclusions, open questions, and one recommended next step. Do not modify files unless the user separately asks.'}`
      if (action.kind === 'resolve-question') return `${base}\n\n${zh ? `聚焦处理待确认事项：「${action.item}」。先检索相关当前材料，给出判断、依据和可选方案；涉及方向、范围或写入前，遵守 AGENTS.md 的确认规则。` : `Focus on this open question: “${action.item}”. Retrieve relevant current materials, then provide judgement, evidence, and options. Follow AGENTS.md confirmation rules before direction, scope, or file changes.`}`
      return `${base}\n\n${zh ? '只读检查项目健康度：确认当前文档、缺失项、用户修改的受管文件和下一步建议。不要自动修复、升级、移动或重写文件。' : 'Perform a read-only project-health review: confirm current documents, gaps, user-modified managed files, and the recommended next step. Do not automatically repair, upgrade, move, or rewrite files.'}`
    }

    function stageIndex(stage) {
      const value = String(stage || '').toLowerCase()
      if (/推进|交付|迭代|deliver|iteration|advance/.test(value)) return 3
      if (/进入项目|项目阶段|project entry|project phase/.test(value)) return 2
      if (/探索|验证|explor|validat/.test(value)) return 1
      return 0
    }

    function Dashboard({ localeService, dispatchPrompt }) {
      const activeLocale = useSyncExternalStore((listener) => localeService.subscribe(listener), () => localeService.getSnapshot().active, () => 'en')
      const text = copy[activeLocale === 'zh' ? 'zh' : 'en']
      const [open, setOpen] = useState(false)
      const [view, setView] = useState('dashboard')
      const [roots, setRoots] = useState([])
      const [root, setRoot] = useState('')
      const [workspaces, setWorkspaces] = useState([])
      const [destination, setDestination] = useState('')
      const [status, setStatus] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState('')
      const [notice, setNotice] = useState('')
      const [sentAction, setSentAction] = useState('')
      const [dispatchingAction, setDispatchingAction] = useState('')
      const [newDestination, setNewDestination] = useState('')
      const [template, setTemplate] = useState('idea-to-project')
      const [workspaceLocale, setWorkspaceLocale] = useState('zh')
      const [confirmed, setConfirmed] = useState(false)

      useEffect(() => {
        fetch('/api/recowork/roots').then((response) => response.json()).then((value) => {
          const next = Array.isArray(value.roots) ? value.roots : []
          setRoots(next)
          setRoot(next[0] || '')
        }).catch(() => setError(text.statusUnavailable))
      }, [])

      useEffect(() => {
        if (!root) {
          setWorkspaces([])
          setDestination('')
          setStatus(null)
          return
        }
        loadWorkspaces(root)
      }, [root])

      useEffect(() => {
        setStatus(null)
        setSentAction('')
        setNotice('')
        if (root && destination) refresh(destination)
      }, [root, destination])

      async function loadWorkspaces(selectedRoot, preferredDestination = '') {
        try {
          const response = await fetch(`/api/recowork/workspaces?${new URLSearchParams({ root: selectedRoot })}`)
          const value = await response.json()
          if (!response.ok) throw new Error(value.error || text.statusUnavailable)
          const next = Array.isArray(value.workspaces) ? value.workspaces : []
          setWorkspaces(next)
          setDestination((current) => {
            const preferred = preferredDestination || current
            return next.some((item) => item.destination === preferred) ? preferred : (next[0]?.destination || '')
          })
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : text.statusUnavailable)
        }
      }

      async function refresh(selectedDestination = destination) {
        if (!root || !selectedDestination) return
        setLoading(true)
        setError('')
        try {
          const response = await fetch(`/api/recowork/status?${new URLSearchParams({ root, destination: selectedDestination })}`)
          const value = await response.json()
          if (!response.ok) throw new Error(value.error || text.statusUnavailable)
          setStatus(value)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : text.statusUnavailable)
        } finally {
          setLoading(false)
        }
      }

      async function initialize() {
        if (!root || !newDestination) return setError(text.chooseDestination)
        if (!confirmed) return setError(text.confirmationRequired)
        setLoading(true)
        setError('')
        try {
          const response = await fetch('/api/recowork/init', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ root, destination: newDestination, template, locale: workspaceLocale, confirmed: true }),
          })
          const value = await response.json()
          if (!response.ok) throw new Error(value.error || text.initUnavailable)
          const initializedDestination = newDestination
          setConfirmed(false)
          setNewDestination('')
          setView('dashboard')
          await loadWorkspaces(root, initializedDestination)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : text.initUnavailable)
        } finally {
          setLoading(false)
        }
      }

      async function dispatch(action) {
        if (!status) return
        setDispatchingAction(action.id)
        setError('')
        setNotice('')
        try {
          await dispatchPrompt(makePrompt(action, status, root, destination))
          setSentAction(action.id)
          setNotice(text.sent)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : text.statusUnavailable)
        } finally {
          setDispatchingAction('')
        }
      }

      async function copyTask(action) {
        if (!status) return
        try {
          await navigator.clipboard.writeText(makePrompt(action, status, root, destination))
          setNotice(text.copied)
        } catch {
          setError(text.statusUnavailable)
        }
      }

      const theme = {
        panel: 'var(--dsw-alias-bg-layer-1, #1b1b20)', surface: 'var(--dsw-alias-bg-layer-2, #29292f)', elevated: 'var(--dsw-alias-bg-layer-3, #313138)',
        primary: 'var(--dsw-alias-label-primary, #f2f2f5)', secondary: 'var(--dsw-alias-label-secondary, #aaaab4)', border: 'var(--dsw-alias-border-l2, #494953)', divider: 'var(--dsw-alias-border-l1, #303038)',
        accent: 'var(--dsw-alias-button-ghost-active-fill, #55499a)', success: 'var(--dsw-alias-state-success-primary, #6fd397)', error: 'var(--dsw-alias-state-error-primary, #ffabab)', shadow: 'var(--dsw-shadow-lv3, 0 16px 48px rgba(0,0,0,.38))',
      }
      const baseButton = { border: 0, borderRadius: 8, color: theme.primary, cursor: 'pointer', fontWeight: 600 }
      const inputStyle = { width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 9, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.primary }
      const shellStyle = { position: 'fixed', right: 20, bottom: 20, zIndex: 1000, width: 408, height: 'min(700px, calc(100vh - 40px))', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', borderRadius: 16, background: theme.panel, color: theme.primary, boxShadow: theme.shadow, pointerEvents: 'auto', fontSize: 13 }

      if (!open) return h('button', { type: 'button', onClick: () => setOpen(true), 'aria-label': text.open, style: { ...baseButton, position: 'fixed', right: 20, bottom: 20, zIndex: 1000, padding: '11px 14px', background: theme.accent, boxShadow: theme.shadow } }, text.title)

      const manifest = status?.manifest
      const deck = status?.deck
      const actions = deck?.actions || []
      const primaryAction = actions.find((action) => action.id === deck?.primaryActionId) || actions[0]
      const decisions = actions.filter((action) => action.kind === 'resolve-question')
      const reviewAction = actions.find((action) => action.kind === 'review')
      const activeStage = stageIndex(deck?.stage)

      function header() {
        return h('header', { style: { flex: '0 0 auto', padding: '15px 16px 13px', borderBottom: `1px solid ${theme.divider}` } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
            h('strong', { style: { fontSize: 15 } }, text.title),
            h('div', { style: { display: 'flex', gap: 7 } },
              h('button', { type: 'button', onClick: () => { setView('init'); setError(''); setNotice('') }, 'aria-label': text.addWorkspace, style: { ...baseButton, width: 30, height: 30, background: 'transparent', border: `1px solid ${theme.border}`, color: theme.secondary } }, '+'),
              h('button', { type: 'button', onClick: () => setOpen(false), 'aria-label': text.collapse, style: { ...baseButton, padding: '5px 7px', background: 'transparent', color: theme.secondary } }, text.collapse))),
          view === 'dashboard' && workspaces.length > 0 ? h('select', { value: destination, onChange: (event) => setDestination(event.target.value), 'aria-label': text.workspace, style: { ...inputStyle, marginTop: 12, fontWeight: 600 } },
            workspaces.map((item) => h('option', { key: item.destination, value: item.destination }, `${item.destination} · ${item.template}`))) : null)
      }

      function setupView() {
        return h('div', { style: { padding: 16, lineHeight: 1.55 } }, h('strong', null, text.setupTitle), h('p', { style: { color: theme.secondary } }, text.setupBody))
      }

      function dashboardView() {
        if (roots.length === 0) return setupView()
        if (workspaces.length === 0) return h('div', { style: { padding: 16, color: theme.secondary } }, h('p', null, text.noWorkspaces), h('button', { type: 'button', onClick: () => setView('init'), style: { ...baseButton, padding: '9px 11px', background: theme.accent } }, text.addWorkspace))
        if (loading && !status) return h('p', { style: { padding: 16, color: theme.secondary } }, text.loading)
        if (!status) return h('div', { style: { padding: 16 } }, error ? h('p', { role: 'alert', style: { color: theme.error } }, error) : null, h('button', { type: 'button', onClick: () => refresh(), style: { ...baseButton, padding: '9px 11px', background: theme.accent } }, text.retry))

        return h('div', { style: { padding: '13px 16px 18px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 7, color: theme.secondary, fontSize: 11, marginBottom: 11 } }, h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: theme.success } }), text.value),
          primaryAction ? h('section', { style: { padding: 13, borderRadius: 11, background: theme.surface } },
            h('div', { style: { color: theme.secondary, fontSize: 10 } }, text.continueLabel),
            h('strong', { style: { display: 'block', marginTop: 5, fontSize: 15, lineHeight: 1.35 } }, primaryAction.item || text.continueGeneric),
            h('p', { style: { margin: '6px 0 11px', color: theme.secondary, fontSize: 11, lineHeight: 1.45 } }, text.continueDescription),
            h('button', { type: 'button', onClick: () => dispatch(primaryAction), disabled: dispatchingAction === primaryAction.id || sentAction === primaryAction.id, style: { ...baseButton, width: '100%', padding: '9px 10px', background: sentAction === primaryAction.id ? theme.elevated : theme.accent } }, sentAction === primaryAction.id ? text.sentButton : dispatchingAction === primaryAction.id ? text.sending : text.continueAction),
            h('button', { type: 'button', onClick: () => copyTask(primaryAction), style: { ...baseButton, width: '100%', marginTop: 6, padding: '7px 10px', background: 'transparent', color: theme.secondary } }, text.copyTask)) : null,
          notice ? h('p', { style: { color: theme.success, fontSize: 11, margin: '8px 1px 0' } }, notice) : null,
          error ? h('p', { role: 'alert', style: { color: theme.error, fontSize: 11 } }, error) : null,

          h('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '16px 1px 7px' } }, h('strong', { style: { fontSize: 12 } }, text.decisions), h('span', { style: { color: theme.secondary, fontSize: 10 } }, format(text.blocking, { count: deck?.blockingCount || 0 }))),
          decisions.length ? decisions.map((action) => h('article', { key: action.id, style: { padding: '10px 0', borderTop: `1px solid ${theme.divider}` } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 10 } }, h('strong', { style: { fontSize: 12, lineHeight: 1.4 } }, action.item), h('span', { style: { flex: '0 0 auto', padding: '3px 5px', borderRadius: 4, background: theme.surface, color: theme.secondary, fontSize: 9 } }, text.sourceQuestion)),
            h('button', { type: 'button', onClick: () => dispatch(action), style: { ...baseButton, padding: '6px 0 0', background: 'transparent', color: theme.secondary, fontSize: 10 } }, text.decide, ' →'))) : h('p', { style: { color: theme.secondary, fontSize: 11 } }, text.noBlocking),

          h('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '15px 1px 7px' } }, h('strong', { style: { fontSize: 12 } }, text.progress), h('span', { style: { color: theme.secondary, fontSize: 10 } }, format(text.current, { stage: deck?.stage || text.unknownStage }))),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 } }, text.stages.map((label, index) => h('span', { key: label, style: { height: 4, borderRadius: 3, background: index <= activeStage ? theme.accent : theme.elevated } }))),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6, color: theme.secondary, fontSize: 9 } }, text.stages.map((label, index) => h('span', { key: label, style: { color: index === activeStage ? theme.primary : theme.secondary } }, label))),

          h('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '16px 1px 7px' } }, h('strong', { style: { fontSize: 12 } }, text.memory), h('span', { style: { color: theme.secondary, fontSize: 10 } }, text.memoryHint)),
          deck?.memory?.length ? h('div', null, deck.memory.map((item) => h('div', { key: `${item.source}:${item.text}`, style: { display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8, marginTop: 7 } }, h('span', { style: { color: theme.secondary, fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.source.split('/').pop()), h('span', { style: { fontSize: 10, lineHeight: 1.4 } }, item.text)))) : h('p', { style: { color: theme.secondary, fontSize: 11 } }, text.noMemory),

          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${theme.divider}` } },
            reviewAction ? h('button', { type: 'button', onClick: () => dispatch(reviewAction), style: { ...baseButton, padding: 0, background: 'transparent', color: theme.secondary, fontSize: 10 } }, text.review) : h('span'),
            h('button', { type: 'button', onClick: () => setView('settings'), style: { ...baseButton, padding: 0, background: 'transparent', color: theme.secondary, fontSize: 10 } }, text.settings)))
      }

      function settingsView() {
        return h('div', { style: { padding: '14px 16px 18px' } },
          h('button', { type: 'button', onClick: () => setView('dashboard'), style: { ...baseButton, padding: 0, background: 'transparent', color: theme.secondary } }, '← ', text.back),
          h('h3', { style: { margin: '14px 0 0', fontSize: 15 } }, text.details),
          h('label', { style: { display: 'block', marginTop: 12 } }, text.root, h('select', { value: root, onChange: (event) => setRoot(event.target.value), style: inputStyle }, roots.map((item) => h('option', { key: item, value: item }, item)))),
          h('label', { style: { display: 'block', marginTop: 10 } }, text.workspace, h('select', { value: destination, onChange: (event) => setDestination(event.target.value), style: inputStyle }, workspaces.map((item) => h('option', { key: item.destination, value: item.destination }, item.destination)))),
          manifest ? h('div', { style: { marginTop: 14, padding: 11, borderRadius: 9, background: theme.surface, lineHeight: 1.6 } }, h('div', null, `${text.template}：${manifest.template}`), h('div', null, `${text.language}：${manifest.locale}`), h('div', null, deck?.progress?.complete ? text.healthComplete : format(text.healthMissing, { count: status.health?.missingDocuments?.length || 0 })), h('div', null, format(text.modified, { count: status.health?.modifiedManagedFiles || 0 }))) : null,
          status?.documents?.length ? h(React.Fragment, null, h('div', { style: { marginTop: 14, color: theme.secondary, fontSize: 11 } }, text.documents), h('ul', { style: { margin: '7px 0 0', padding: 0, listStyle: 'none' } }, status.documents.map((document) => h('li', { key: document.path, style: { marginTop: 5, padding: '7px 8px', borderRadius: 7, background: theme.surface, fontSize: 11 } }, document.path)))) : null,
          h('button', { type: 'button', onClick: () => refresh(), disabled: loading, style: { ...baseButton, marginTop: 14, padding: '9px 11px', background: theme.accent } }, loading ? text.loading : text.reload))
      }

      function initView() {
        return h('div', { style: { padding: '14px 16px 18px' } },
          h('button', { type: 'button', onClick: () => setView('dashboard'), style: { ...baseButton, padding: 0, background: 'transparent', color: theme.secondary } }, '← ', text.back),
          h('h3', { style: { margin: '14px 0 0', fontSize: 15 } }, text.initTitle),
          h('label', { style: { display: 'block', marginTop: 12 } }, text.root, h('select', { value: root, onChange: (event) => setRoot(event.target.value), style: inputStyle }, roots.map((item) => h('option', { key: item, value: item }, item)))),
          h('label', { style: { display: 'block', marginTop: 10 } }, text.destination, h('input', { value: newDestination, placeholder: 'demo-project', onChange: (event) => setNewDestination(event.target.value), style: inputStyle })),
          h('label', { style: { display: 'block', marginTop: 10 } }, text.template, h('select', { value: template, onChange: (event) => setTemplate(event.target.value), style: inputStyle }, h('option', { value: 'idea-to-project' }, text.idea), h('option', { value: 'learning-engineering' }, text.learning), h('option', { value: 'web-design-standard' }, text.design))),
          h('label', { style: { display: 'block', marginTop: 10 } }, text.language, h('select', { value: workspaceLocale, onChange: (event) => setWorkspaceLocale(event.target.value), style: inputStyle }, h('option', { value: 'zh' }, text.chinese), h('option', { value: 'en' }, text.english))),
          h('label', { style: { display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, color: theme.secondary, lineHeight: 1.45 } }, h('input', { type: 'checkbox', checked: confirmed, onChange: (event) => setConfirmed(event.target.checked), style: { marginTop: 2 } }), text.confirmation),
          h('button', { type: 'button', onClick: initialize, disabled: loading || !confirmed, style: { ...baseButton, marginTop: 13, padding: '9px 11px', background: confirmed ? theme.accent : theme.surface } }, loading ? text.initializing : text.confirmInit),
          error ? h('p', { role: 'alert', style: { color: theme.error } }, error) : null)
      }

      return h('section', { style: shellStyle, 'aria-label': text.title }, header(), h('div', { style: { minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' } }, view === 'dashboard' ? dashboardView() : view === 'settings' ? settingsView() : initView()))
    }

    function createDispatcher(ctx) {
      return async (prompt) => {
        const sessionId = ctx.sessions.list.getSnapshot().current
        if (!sessionId) throw new Error('Open a DSH session before dispatching a task.')
        const scope = ctx.sessions.scope(sessionId)
        const session = scope && ctx.sessions.sessionOf(scope)
        if (!session) throw new Error('The current DSH session is unavailable.')
        const result = await session.prompt([{ type: 'text', text: prompt }], 'queue')
        if (result && result.ok === false) throw new Error(result.error?.message || 'DSH did not accept the task.')
      }
    }

    return { inject: ['slots', 'locale', 'sessions'], apply(ctx) { ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'recowork-dashboard' }, () => h(Dashboard, { localeService: ctx.locale, dispatchPrompt: createDispatcher(ctx) }))) } }
  } })
})()
