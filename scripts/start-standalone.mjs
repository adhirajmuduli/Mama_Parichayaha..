import { access } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverPath = resolve(rootDirectory, '.next/standalone/server.js')

// Port resolution accepts every shape the toolchain throws at us:
//   node scripts/start-standalone.mjs --port 3100
//   node scripts/start-standalone.mjs 3100
//   PORT=3100 node scripts/start-standalone.mjs
// npm's argument forwarding (`npm run x -- --port 3100`) reaches the script
// as a bare "3100" on some npm versions, which previously silently started
// the server on 3000 while the caller waited on 3100.
const portFlagIndex = process.argv.indexOf('--port')
const portFlagValue = portFlagIndex === -1 ? null : process.argv[portFlagIndex + 1]
const barePort = process.argv.slice(2).find((argument) => /^\d+$/.test(argument))
const port = portFlagValue ?? barePort ?? process.env.PORT ?? '3000'

if (!port || !/^\d+$/.test(port)) {
  throw new Error('Provide a numeric port with --port or the PORT environment variable.')
}

await access(serverPath)
process.env.HOSTNAME ??= '127.0.0.1'
process.env.PORT = port
await import(pathToFileURL(serverPath).href)
