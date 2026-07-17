import { gzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const initialRouteBudget = 180 * 1024
const sceneChunkBudget = 350 * 1024

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(rootDirectory, relativePath), 'utf8'))
}

async function gzipSize(relativePath) {
  const source = await readFile(resolve(rootDirectory, '.next', relativePath))
  return gzipSync(source, { level: 9 }).byteLength
}

async function totalGzipSize(files) {
  const uniqueFiles = [...new Set(files.filter((file) => file.endsWith('.js')))]
  return Promise.all(uniqueFiles.map(gzipSize)).then((sizes) =>
    sizes.reduce((total, size) => total + size, 0),
  )
}

const [appBuildManifest, buildManifest, loadableManifest] = await Promise.all([
  readJson('.next/app-build-manifest.json'),
  readJson('.next/build-manifest.json'),
  readJson('.next/react-loadable-manifest.json'),
])
const pageFiles = appBuildManifest.pages['/page']

if (!pageFiles) {
  throw new Error('The production build does not contain the portfolio route manifest.')
}

const runtimeFiles = new Set(buildManifest.rootMainFiles)
const initialRouteFiles = pageFiles.filter((file) => !runtimeFiles.has(file))
const sceneManifestEntry = Object.entries(loadableManifest).find(([entry]) =>
  entry.includes('components\\scene\\SceneClient.tsx -> ./Experience'),
)

if (!sceneManifestEntry) {
  throw new Error('The production build does not expose the dynamically imported Experience chunk.')
}

const initialRouteGzipBytes = await totalGzipSize(initialRouteFiles)
const sceneChunkGzipBytes = await totalGzipSize(sceneManifestEntry[1].files)

console.log(`Initial portfolio route JavaScript: ${initialRouteGzipBytes} B gzip`)
console.log(`Initial WebGL Experience chunk: ${sceneChunkGzipBytes} B gzip`)

if (initialRouteGzipBytes > initialRouteBudget) {
  throw new Error(`Initial portfolio route exceeds its ${initialRouteBudget} B gzip budget.`)
}

if (sceneChunkGzipBytes > sceneChunkBudget) {
  throw new Error(`WebGL Experience exceeds its ${sceneChunkBudget} B gzip budget.`)
}
