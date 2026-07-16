import { cp, rm, stat } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const standaloneDirectory = resolve(rootDirectory, '.next/standalone')
const sources = [
  ['public', resolve(rootDirectory, 'public'), resolve(standaloneDirectory, 'public')],
  ['static', resolve(rootDirectory, '.next/static'), resolve(standaloneDirectory, '.next/static')],
]

await stat(standaloneDirectory)

for (const [name, source, destination] of sources) {
  await stat(source).catch(() => {
    throw new Error(`Missing ${name} build source: ${source}`)
  })

  const destinationRelativePath = relative(standaloneDirectory, destination)
  if (
    destinationRelativePath === '' ||
    destinationRelativePath.startsWith('..') ||
    isAbsolute(destinationRelativePath)
  ) {
    throw new Error(`Refusing to copy outside standalone output: ${destination}`)
  }

  await rm(destination, { force: true, recursive: true })
  await cp(source, destination, { force: true, recursive: true })
}
