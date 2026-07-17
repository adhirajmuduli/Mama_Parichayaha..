import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const child = spawn(npmCommand, ['run', 'build'], {
  env: { ...process.env, ANALYZE: 'true' },
  stdio: 'inherit',
})

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exitCode = code ?? 1
})
