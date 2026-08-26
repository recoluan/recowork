import { existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { load as loadYaml } from 'js-yaml'
import os from 'node:os'
import path from 'node:path'

const MARKER_START = '# >>> RecoWork DSH setup >>>'
const MARKER_END = '# <<< RecoWork DSH setup <<<'
const DEFAULT_PROFILE = 'web'
const RECOWORK_PACKAGE = 'recowork@3.2.2'

function optionValue(argv, index, name) {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`)
  return value
}

export function parseSetupArgs(argv) {
  const options = { roots: [], profile: DEFAULT_PROFILE, dshHome: process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), adoptExisting: false }
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) return { help: true }
  if (argv[0] !== 'setup') throw new Error(`Unknown command: ${argv[0]}. Use \`recowork-dsh setup --root <absolute-directory>\`.`)

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--root') {
      options.roots.push(optionValue(argv, index, '--root'))
      index += 1
    } else if (argument === '--profile') {
      options.profile = optionValue(argv, index, '--profile')
      index += 1
    } else if (argument === '--dsh-home') {
      options.dshHome = optionValue(argv, index, '--dsh-home')
      index += 1
    } else if (argument === '--adopt-existing') {
      options.adoptExisting = true
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }

  if (options.roots.length === 0) throw new Error('At least one --root <absolute-directory> is required.')
  if (!/^[A-Za-z0-9_-]+$/.test(options.profile)) throw new Error('Profile may contain only letters, numbers, underscores, and hyphens.')
  return options
}

function canonicalRoot(root) {
  if (!path.isAbsolute(root)) throw new Error(`Allowed root must be absolute: ${root}`)
  if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`Allowed root does not exist or is not a directory: ${root}`)
  return realpathSync(root)
}

function removeManagedBlock(contents) {
  const start = contents.indexOf(MARKER_START)
  if (start === -1) return contents
  const end = contents.indexOf(MARKER_END, start)
  if (end === -1) throw new Error('The existing RecoWork setup block is incomplete. Restore or review the profile patch before running setup.')
  return `${contents.slice(0, start)}${contents.slice(end + MARKER_END.length)}`.replace(/\n{3,}/g, '\n\n').trimEnd()
}

function unmanagedRecoWorkEntryLines(contents) {
  const lines = contents.split('\n')
  const start = lines.findIndex((line) => line.trim() === '- id: recowork-dsh')
  if (start === -1) return null
  let end = start + 1
  while (end < lines.length && !/^\s*- id:\s+/.test(lines[end])) end += 1
  return { lines, start, end }
}

function removeUnmanagedRecoWorkEntry(contents) {
  const entry = unmanagedRecoWorkEntryLines(contents)
  if (!entry) return contents
  entry.lines.splice(entry.start, entry.end - entry.start)
  return entry.lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()
}

function parsePatch(contents, patchPath) {
  try {
    const parsed = loadYaml(contents)
    if (parsed === undefined || Array.isArray(parsed)) return parsed || []
    throw new Error('the top-level value must be a YAML array')
  } catch (cause) {
    throw new Error(`DSH profile patch is not a valid single YAML array: ${patchPath}. ${cause instanceof Error ? cause.message : String(cause)}`)
  }
}

function removeEmptyArrayPlaceholder(contents, parsed) {
  if (parsed.length !== 0) return contents
  return contents.replace(/^[ \t]*\[\][ \t]*(?:#.*)?(?:\r?\n|$)/m, '')
}

function validateWrittenPatch(contents, patchPath) {
  const entries = parsePatch(contents, patchPath)
  if (!entries.some((entry) => entry?.id === 'recowork-dsh')) throw new Error(`RecoWork configuration was not found after writing ${patchPath}.`)
}

export function renderManagedConfig(roots) {
  const rootLines = roots.map((root) => `      - ${JSON.stringify(root)}`).join('\n')
  return `${MARKER_START}\n- id: recowork-dsh\n  config:\n    allowedRoots:\n${rootLines}\n    recoworkPackage: ${RECOWORK_PACKAGE}\n${MARKER_END}\n`
}

export function configureProfile({ roots, profile = DEFAULT_PROFILE, dshHome, adoptExisting = false }) {
  const canonicalRoots = [...new Set(roots.map(canonicalRoot))]
  const resolvedHome = path.resolve(dshHome)
  const patchPath = path.join(resolvedHome, 'profiles', profile, 'cordis.patch.yml')
  if (!existsSync(patchPath)) throw new Error(`DSH profile patch not found: ${patchPath}. Start this DSH profile once before running setup.`)

  const original = readFileSync(patchPath, 'utf8')
  let withoutManaged = removeManagedBlock(original)
  const parsedBase = parsePatch(withoutManaged, patchPath)
  if (unmanagedRecoWorkEntryLines(withoutManaged)) {
    if (!adoptExisting) throw new Error('An existing RecoWork DSH configuration was found outside the managed setup block. Review it, then rerun with --adopt-existing to replace that entry after a backup is created.')
    withoutManaged = removeUnmanagedRecoWorkEntry(withoutManaged)
  }
  withoutManaged = removeEmptyArrayPlaceholder(withoutManaged, parsedBase)
  const next = `${withoutManaged.trimEnd()}${withoutManaged.trim().length ? '\n\n' : ''}${renderManagedConfig(canonicalRoots)}`
  validateWrittenPatch(next, patchPath)
  if (next === original) return { changed: false, patchPath, roots: canonicalRoots, backupPath: null }

  const backupDirectory = path.dirname(patchPath)
  mkdirSync(backupDirectory, { recursive: true })
  const backupPath = path.join(backupDirectory, `cordis.patch.yml.recowork-dsh.${Date.now()}.bak`)
  writeFileSync(backupPath, original)
  try {
    writeFileSync(patchPath, next)
    validateWrittenPatch(readFileSync(patchPath, 'utf8'), patchPath)
  } catch (cause) {
    writeFileSync(patchPath, original)
    throw new Error(`RecoWork setup could not validate the updated profile patch and restored the original file. ${cause instanceof Error ? cause.message : String(cause)}`)
  }
  return { changed: true, patchPath, roots: canonicalRoots, backupPath }
}

export function setupHelp() {
  return `RecoWork DSH setup\n\nUsage:\n  recowork-dsh setup --root <absolute-directory> [--root <absolute-directory>] [--profile web] [--dsh-home <directory>]\n\nThe command writes only a marker-bounded RecoWork configuration block, backs up the profile patch first, and requires every allowed root to already exist.\n\nIf you previously configured recowork-dsh by hand, review it and add --adopt-existing to replace only that old RecoWork entry.`
}
