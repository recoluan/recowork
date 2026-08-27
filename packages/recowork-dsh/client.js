(function registerRecoWorkDashboard() {
  const loader = window.__ModuleLoader__
  if (!loader || typeof loader.load !== 'function') {
    throw new Error('recowork-dsh requires the DSH Web module loader.')
  }

  loader.load({
    id: 'recowork-dsh',
    factory(require) {
      const React = require('react')
      const { createElement, useEffect, useState, useSyncExternalStore } = React
      const copy = {
        zh: {
          open: '打开 RecoWork 工作区状态', launcher: 'RecoWork 工作区', status: '只读工作区状态', initialize: '受控初始化', collapse: '收起 RecoWork 工作区状态', collapseLabel: '收起', operations: 'RecoWork 操作', statusTab: '查看状态', initTab: '新建工作区', root: '授权目录', noRoots: '未配置授权目录', destination: '新工作区相对路径', existing: '已有工作区', noWorkspaces: '当前授权目录下没有可查看的工作区', unknownTemplate: '未知模板', unknownLocale: '未知语言', template: '模板', language: '语言', confirm: '我确认目标目录不存在或为空；初始化不会覆盖已有工作区。', initializing: '初始化中…', confirmInit: '确认并初始化', loading: '读取中…', read: '读取状态', stage: '当前阶段', unknownStage: '未识别；请查看工作区索引', documents: '当前文档 · {count} 份', attention: '需要关注', noActions: '未从待确认问题中识别到具体行动。', health: '工作区健康度', manifest: 'Manifest：v{version} · 已验证', currentDocuments: '当前文档：{recognized}/{expected}', missing: '缺少：{documents}', complete: '必需当前文档：完整', modified: '受管文件用户修改：{count}', rootsUnavailable: '无法读取授权目录。', workspacesUnavailable: '无法读取可查看的工作区。', chooseWorkspace: '请选择授权目录和已有工作区。', chooseDestination: '请选择授权目录并填写新工作区的相对路径。', confirmationRequired: '请确认目标目录不存在或为空，且不会覆盖已有工作区。', statusUnavailable: '无法读取工作区状态。', initUnavailable: '无法初始化工作区。', idea: '从想法到落地', learning: '系统性学习', design: '网页设计规范', chinese: '中文', english: 'English', workspaceStatus: 'RecoWork 工作区状态',
        },
        en: {
          open: 'Open RecoWork workspace status', launcher: 'RecoWork workspace', status: 'Read-only workspace status', initialize: 'Guarded initialization', collapse: 'Collapse RecoWork workspace status', collapseLabel: 'Collapse', operations: 'RecoWork actions', statusTab: 'Status', initTab: 'New workspace', root: 'Approved directory', noRoots: 'No approved directory configured', destination: 'New workspace relative path', existing: 'Existing workspace', noWorkspaces: 'No viewable workspace in this approved directory', unknownTemplate: 'Unknown template', unknownLocale: 'Unknown locale', template: 'Template', language: 'Language', confirm: 'I confirm that the destination does not exist or is empty; initialization will not overwrite an existing workspace.', initializing: 'Initializing…', confirmInit: 'Confirm and initialize', loading: 'Loading…', read: 'Read status', stage: 'Current stage', unknownStage: 'Not identified; review the workspace index.', documents: 'Current documents · {count}', attention: 'Needs attention', noActions: 'No actionable item was found in open questions.', health: 'Workspace health', manifest: 'Manifest: v{version} · verified', currentDocuments: 'Current documents: {recognized}/{expected}', missing: 'Missing: {documents}', complete: 'Required current documents: complete', modified: 'Managed files modified by user: {count}', rootsUnavailable: 'Unable to read approved directories.', workspacesUnavailable: 'Unable to read viewable workspaces.', chooseWorkspace: 'Choose an approved directory and an existing workspace.', chooseDestination: 'Choose an approved directory and enter a new workspace relative path.', confirmationRequired: 'Confirm that the destination does not exist or is empty and will not overwrite an existing workspace.', statusUnavailable: 'Unable to read workspace status.', initUnavailable: 'Unable to initialize workspace.', idea: 'Idea to project', learning: 'Learning engineering', design: 'Web design standard', chinese: 'Chinese', english: 'English', workspaceStatus: 'RecoWork workspace status',
        },
      }

      function format(message, values) {
        return message.replace(/\{(\w+)\}/g, (whole, key) => key in values ? String(values[key]) : whole)
      }

      function Dashboard({ localeService }) {
        const activeLocale = useSyncExternalStore(
          (listener) => localeService.subscribe(listener),
          () => localeService.getSnapshot().active,
          () => 'en',
        )
        const text = copy[activeLocale === 'zh' ? 'zh' : 'en']
        const [open, setOpen] = useState(false)
        const [mode, setMode] = useState('status')
        const [roots, setRoots] = useState([])
        const [workspaces, setWorkspaces] = useState([])
        const [root, setRoot] = useState('')
        const [workspaceDestination, setWorkspaceDestination] = useState('')
        const [newDestination, setNewDestination] = useState('')
        const [template, setTemplate] = useState('idea-to-project')
        const [locale, setLocale] = useState('zh')
        const [confirmed, setConfirmed] = useState(false)
        const [status, setStatus] = useState(null)
        const [error, setError] = useState('')
        const [loading, setLoading] = useState(false)

        useEffect(() => {
          fetch('/api/recowork/roots')
            .then((response) => response.json())
            .then((value) => {
              const nextRoots = Array.isArray(value.roots) ? value.roots : []
              setRoots(nextRoots)
              setRoot(nextRoots[0] || '')
            })
            .catch(() => setError(text.rootsUnavailable))
        }, [])

        useEffect(() => {
          if (!root) {
            setWorkspaces([])
            setWorkspaceDestination('')
            return
          }
          fetch(`/api/recowork/workspaces?${new URLSearchParams({ root })}`)
            .then((response) => response.json())
            .then((value) => {
              const nextWorkspaces = Array.isArray(value.workspaces) ? value.workspaces : []
              setWorkspaces(nextWorkspaces)
              setWorkspaceDestination((current) => nextWorkspaces.some((item) => item.destination === current) ? current : (nextWorkspaces[0]?.destination || ''))
            })
            .catch(() => setError(text.workspacesUnavailable))
        }, [root])

        async function refresh(selectedDestination = workspaceDestination) {
          if (!root || !selectedDestination) {
            setError(text.chooseWorkspace)
            return
          }
          setLoading(true)
          setError('')
          setStatus(null)
          try {
            const query = new URLSearchParams({ root, destination: selectedDestination })
            const response = await fetch(`/api/recowork/status?${query}`)
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
          if (!root || !newDestination) {
            setError(text.chooseDestination)
            return
          }
          if (!confirmed) {
            setError(text.confirmationRequired)
            return
          }
          setLoading(true)
          setError('')
          setStatus(null)
          try {
            const response = await fetch('/api/recowork/init', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ root, destination: newDestination, template, locale, confirmed: true }),
            })
            const value = await response.json()
            if (!response.ok) throw new Error(value.error || text.initUnavailable)
            setConfirmed(false)
            setWorkspaceDestination(newDestination)
            setMode('status')
            await refresh(newDestination)
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : text.initUnavailable)
          } finally {
            setLoading(false)
          }
        }

        // DSH exposes its resolved light/dark palette as --dsw-alias-* tokens.
        // Keeping every surface on those tokens means this overlay follows the
        // host theme immediately, including when the user changes it in Settings.
        const theme = {
          panel: 'var(--dsw-alias-bg-layer-1, rgba(24, 24, 30, .98))',
          surface: 'var(--dsw-alias-bg-layer-2, #24242c)',
          primary: 'var(--dsw-alias-label-primary, #f5f5f7)',
          secondary: 'var(--dsw-alias-label-secondary, #b8b8c3)',
          border: 'var(--dsw-alias-border-l2, #51515e)',
          divider: 'var(--dsw-alias-border-l1, #40404d)',
          // DSH's button-primary is deliberately inverted (white in dark mode).
          // The dashboard action buttons stay in the panel's own color family.
          accent: 'var(--dsw-alias-button-ghost-active-fill, #403b73)',
          accentDisabled: 'var(--dsw-alias-bg-layer-2, #24242c)',
          selected: 'var(--dsw-alias-button-ghost-active-fill, #403b73)',
          error: 'var(--dsw-alias-state-error-primary, #ffabab)',
          shadow: 'var(--dsw-shadow-lv3, 0 16px 48px rgba(0, 0, 0, .38))',
        }
        const style = {
          position: 'fixed', right: 20, bottom: 20, zIndex: 1000, width: 348,
          padding: 16, borderRadius: 16, background: theme.panel, color: theme.primary,
          height: 'min(600px, calc(100vh - 40px))', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: theme.shadow, pointerEvents: 'auto', fontSize: 13,
        }
        const inputStyle = { width: '100%', boxSizing: 'border-box', marginTop: 6, padding: 9, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: 'inherit' }
        const manifest = status && status.manifest
        const buttonStyle = { border: 0, borderRadius: 8, color: theme.primary, cursor: 'pointer', fontWeight: 600 }
        const compactStyle = { ...style, width: 'auto', height: 'auto', padding: 0, overflow: 'hidden' }
        const documentRows = status?.documents || []
        const workflow = status?.workflow
        const health = status?.health
        const tabStyle = (selected) => ({ ...buttonStyle, flex: 1, padding: '7px 8px', background: selected ? theme.selected : 'transparent', color: selected ? theme.primary : theme.secondary })

        if (!open) {
          return createElement('button', {
            type: 'button', onClick: () => setOpen(true), style: { ...compactStyle, ...buttonStyle, padding: '11px 14px', background: theme.accent },
            'aria-label': text.open,
          }, text.launcher)
        }

        return createElement('section', { style, 'aria-label': text.workspaceStatus },
          createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
            createElement('div', null,
              createElement('strong', { style: { display: 'block', fontSize: 15 } }, 'RecoWork'),
              createElement('span', { style: { color: theme.secondary, fontSize: 12 } }, mode === 'init' ? text.initialize : text.status)),
            createElement('button', { type: 'button', onClick: () => setOpen(false), style: { ...buttonStyle, padding: '5px 8px', background: 'transparent', color: theme.secondary }, 'aria-label': text.collapse }, text.collapseLabel)),
          createElement('div', { role: 'tablist', 'aria-label': text.operations, style: { display: 'flex', marginTop: 14, padding: 3, gap: 3, borderRadius: 10, background: theme.surface } },
            createElement('button', { type: 'button', role: 'tab', 'aria-selected': mode === 'status', onClick: () => { setMode('status'); setError('') }, style: tabStyle(mode === 'status') }, text.statusTab),
            createElement('button', { type: 'button', role: 'tab', 'aria-selected': mode === 'init', onClick: () => { setMode('init'); setError('') }, style: tabStyle(mode === 'init') }, text.initTab)),
          createElement('div', { style: { minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', paddingRight: 2 } },
          createElement('label', { style: { display: 'block', marginTop: 14 } }, text.root, createElement('select', { value: root, onChange: (event) => setRoot(event.target.value), style: inputStyle },
            roots.length === 0 ? createElement('option', { value: '' }, text.noRoots) : roots.map((item) => createElement('option', { key: item, value: item }, item)))),
          mode === 'init' ? createElement('label', { style: { display: 'block', marginTop: 10 } }, text.destination, createElement('input', { value: newDestination, placeholder: 'demo-project', onChange: (event) => setNewDestination(event.target.value), style: inputStyle })) :
            createElement('label', { style: { display: 'block', marginTop: 10 } }, text.existing, createElement('select', { value: workspaceDestination, onChange: (event) => setWorkspaceDestination(event.target.value), style: inputStyle },
              workspaces.length === 0 ? createElement('option', { value: '' }, text.noWorkspaces) : workspaces.map((item) => createElement('option', { key: item.destination, value: item.destination }, `${item.destination} · ${item.template || text.unknownTemplate} · ${item.locale || text.unknownLocale}`)))),
          mode === 'init' ? createElement('div', null,
            createElement('label', { style: { display: 'block', marginTop: 10 } }, text.template, createElement('select', { value: template, onChange: (event) => setTemplate(event.target.value), style: inputStyle },
              createElement('option', { value: 'idea-to-project' }, text.idea),
              createElement('option', { value: 'learning-engineering' }, text.learning),
              createElement('option', { value: 'web-design-standard' }, text.design))),
            createElement('label', { style: { display: 'block', marginTop: 10 } }, text.language, createElement('select', { value: locale, onChange: (event) => setLocale(event.target.value), style: inputStyle },
              createElement('option', { value: 'zh' }, text.chinese), createElement('option', { value: 'en' }, text.english))),
            createElement('label', { style: { display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, lineHeight: 1.45, color: theme.secondary } },
              createElement('input', { type: 'checkbox', checked: confirmed, onChange: (event) => setConfirmed(event.target.checked), style: { marginTop: 2 } }),
              text.confirm),
            createElement('button', { type: 'button', onClick: initialize, disabled: loading || !confirmed, style: { ...buttonStyle, marginTop: 12, padding: '9px 12px', background: loading || !confirmed ? theme.accentDisabled : theme.accent } }, loading ? text.initializing : text.confirmInit)) :
            createElement('button', { type: 'button', onClick: () => refresh(), disabled: loading, style: { ...buttonStyle, marginTop: 12, padding: '9px 12px', background: loading ? theme.accentDisabled : theme.accent } }, loading ? text.loading : text.read),
          error ? createElement('p', { role: 'alert', style: { color: theme.error, margin: '12px 0 0' } }, error) : null,
          mode === 'status' && manifest ? createElement('div', { style: { marginTop: 14, borderTop: `1px solid ${theme.divider}`, paddingTop: 12 } },
            createElement('div', { style: { padding: '9px 10px', borderRadius: 9, background: theme.surface } },
              createElement('div', { style: { color: theme.secondary, fontSize: 12 } }, text.stage),
              createElement('strong', { style: { display: 'block', marginTop: 4 } }, workflow?.stage || text.unknownStage)),
            createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 12 } },
              createElement('span', { style: { color: theme.secondary } }, text.template), createElement('strong', null, manifest.template || text.unknownTemplate)),
            createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6 } },
              createElement('span', { style: { color: theme.secondary } }, text.language), createElement('strong', null, manifest.locale || text.unknownLocale)),
            createElement('div', { style: { marginTop: 12, color: theme.secondary, fontSize: 12 } }, format(text.documents, { count: documentRows.length })),
            documentRows.length > 0 ? createElement('ul', { style: { margin: '7px 0 0', padding: 0, listStyle: 'none' } },
              documentRows.map((document) => createElement('li', { key: document.path, style: { padding: '6px 8px', marginTop: 4, borderRadius: 7, background: theme.surface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, document.path))) : null,
            createElement('div', { style: { marginTop: 14, color: theme.secondary, fontSize: 12 } }, text.attention),
            workflow?.nextActions?.length ? createElement('ul', { style: { margin: '7px 0 0', paddingLeft: 18, lineHeight: 1.5 } },
              workflow.nextActions.map((item) => createElement('li', { key: item, style: { marginTop: 4 } }, item))) :
              createElement('p', { style: { margin: '7px 0 0', color: theme.secondary } }, text.noActions),
            createElement('div', { style: { marginTop: 14, color: theme.secondary, fontSize: 12 } }, text.health),
            createElement('div', { style: { marginTop: 7, padding: '8px 10px', borderRadius: 9, background: theme.surface, lineHeight: 1.55 } },
              createElement('div', null, format(text.manifest, { version: health?.schemaVersion || text.unknownLocale })),
              createElement('div', null, format(text.currentDocuments, { recognized: health?.recognizedDocuments ?? 0, expected: health?.expectedDocuments ?? 0 })),
              createElement('div', null, health?.missingDocuments?.length ? format(text.missing, { documents: health.missingDocuments.join(activeLocale === 'zh' ? '、' : ', ') }) : text.complete),
              createElement('div', null, format(text.modified, { count: health?.modifiedManagedFiles ?? 0 })))) : null))
      }

      return {
        inject: ['slots', 'locale'],
        apply(ctx) {
          ctx.slots.inject('shell.overlay', () => ctx.slots.register({
            name: 'shell.overlay',
            id: 'recowork-dashboard',
          }, () => createElement(Dashboard, { localeService: ctx.locale })))
        },
      }
    },
  })
})()
