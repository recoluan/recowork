#!/usr/bin/env node
import { configureProfile, parseSetupArgs, setupHelp } from '../src/setup.js'

try {
  const options = parseSetupArgs(process.argv.slice(2))
  if (options.help) {
    console.log(setupHelp())
  } else {
    const result = configureProfile(options)
    console.log(result.changed ? 'RecoWork DSH configuration updated.' : 'RecoWork DSH configuration is already current.')
    console.log(`Profile patch: ${result.patchPath}`)
    console.log(`Allowed roots: ${result.roots.join(', ')}`)
    if (result.backupPath) console.log(`Backup: ${result.backupPath}`)
    console.log(`Restart the profile to apply it: dsh ${options.profile === 'web' ? 'web' : `--profile ${options.profile}`}`)
  }
} catch (error) {
  console.error(`recowork-dsh setup failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
