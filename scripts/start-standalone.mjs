import { access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverPath = resolve(rootDirectory, '.next/standalone/server.js')
const portArgument = process.argv.indexOf('--port')
const port = portArgument === -1 ? (process.env.PORT ?? '3000') : process.argv[portArgument + 1]

if (!port || !/^\d+$/.test(port)) {
  throw new Error('Provide a numeric port with --port or the PORT environment variable.')
}

await access(serverPath)
process.env.HOSTNAME ??= '127.0.0.1'
process.env.PORT = port
await import(pathToFileURL(serverPath).href)
