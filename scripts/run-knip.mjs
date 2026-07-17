import { spawnSync } from 'node:child_process'

const executable = process.platform === 'win32' ? 'knip.cmd' : 'knip'
const args = process.argv.slice(2)
const result = spawnSync(executable, args.length > 0 ? args : ['--reporter', 'compact'], {
  env: { ...process.env, KNIP_DISABLE_RAW_TRANSFER: '1' },
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

process.exitCode = result.status ?? 1
