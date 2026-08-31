import { readdir, readFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const contentRoots = ['src/content', 'src/components/narrative', 'src/components/sections']
const sourceExtensions = new Set(['.ts', '.tsx'])
const forbiddenImports = [
  { label: 'Three.js runtime', pattern: /from\s+['"](?:three|@react-three\/[^'"]+)['"]/ },
  { label: 'client-side store', pattern: /from\s+['"]@\/stores\// },
]

async function listSourceFiles(directory) {
  const entries = await readdir(resolve(rootDirectory, directory), { withFileTypes: true })
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(rootDirectory, directory, entry.name)
      if (entry.isDirectory()) {
        return listSourceFiles(relative(rootDirectory, entryPath))
      }

      return sourceExtensions.has(entry.name.slice(entry.name.lastIndexOf('.'))) ? [entryPath] : []
    }),
  )

  return nestedFiles.flat()
}

const violations = []

for (const directory of contentRoots) {
  for (const path of await listSourceFiles(directory)) {
    const source = await readFile(path, 'utf8')
    const sourcePath = relative(rootDirectory, path).replaceAll('\\', '/')

    for (const forbiddenImport of forbiddenImports) {
      if (forbiddenImport.pattern.test(source)) {
        violations.push(`${sourcePath}: ${forbiddenImport.label}`)
      }
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Server/content boundary violations:\n${violations.join('\n')}`)
}

console.log('Server/content boundaries: verified')
