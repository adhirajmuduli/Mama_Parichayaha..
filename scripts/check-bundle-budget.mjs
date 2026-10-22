import { gzipSync } from 'node:zlib'
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Bundle budget + architecture assertion (new_plan.md §11.3, R11).
 *
 * Rules:
 *   1. The initial `/` route's JavaScript stays within its gzip budget.
 *   2. The Lanyard island must load as its own lazy chunk (react-loadable
 *      manifest entry produced by the next/dynamic import in LanyardIsland).
 *   3. three.js is CONFINED to that chunk: a distinctive three runtime
 *      string may appear in exactly one client chunk — the lanyard one.
 *      A single leaked WebGL surface anywhere else fails the build.
 *   4. The lanyard chunk itself stays within its own gzip budget.
 */

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))

const initialRouteBudget = 180 * 1024
const lanyardChunkBudget = 260 * 1024

/** Minifier-stable three runtime strings (error message literals). */
const THREE_MARKER = /WebGLRenderer|WebGLProgram/

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

// --- Rule 1: initial route budget ------------------------------------------
const initialRouteGzipBytes = await totalGzipSize(initialRouteFiles)

console.log(`Initial portfolio route JavaScript: ${initialRouteGzipBytes} B gzip`)

if (initialRouteGzipBytes > initialRouteBudget) {
  throw new Error(`Initial portfolio route exceeds its ${initialRouteBudget} B gzip budget.`)
}

// --- Rule 2: the lanyard lazy chunk exists ----------------------------------
const lanyardEntry = Object.entries(loadableManifest).find(([entry]) =>
  entry.replaceAll('\\', '/').includes('ui/fx/lanyard/LanyardIsland.tsx -> ./Lanyard'),
)

if (!lanyardEntry) {
  throw new Error(
    'The Lanyard island is not exposed as a lazy chunk (expected a next/dynamic entry).',
  )
}

const lanyardFiles = lanyardEntry[1].files
const lanyardFileSet = new Set(lanyardFiles.map((file) => file.replaceAll('\\', '/')))
const lanyardGzipBytes = await totalGzipSize(lanyardFiles)

console.log(
  `Lanyard lazy chunk JavaScript: ${lanyardGzipBytes} B gzip (${lanyardFiles.length} file(s))`,
)

// --- Rule 4: lanyard chunk budget -------------------------------------------
if (lanyardGzipBytes > lanyardChunkBudget) {
  throw new Error(`The Lanyard chunk exceeds its ${lanyardChunkBudget} B gzip budget.`)
}

// --- Rule 3: three confinement ----------------------------------------------
const chunksDirectory = resolve(rootDirectory, '.next', 'static', 'chunks')
const chunkFiles = await readdir(chunksDirectory)

const chunksContainingThree = []

for (const chunkFile of chunkFiles) {
  if (!chunkFile.endsWith('.js')) continue

  const source = await readFile(join(chunksDirectory, chunkFile), 'utf8')

  if (THREE_MARKER.test(source)) {
    chunksContainingThree.push(chunkFile)
  }
}

console.log(`Client chunks containing three.js markers: ${chunksContainingThree.length}`)

if (chunksContainingThree.length !== 1) {
  throw new Error(
    `Expected exactly ONE three.js chunk (the lanyard island); found ${chunksContainingThree.length}: ${chunksContainingThree.join(', ')}.`,
  )
}

const leakedChunk = chunksContainingThree[0]

if (!lanyardFileSet.has(`static/chunks/${leakedChunk}`)) {
  throw new Error(
    `three.js leaked outside the lanyard chunk: "${leakedChunk}" is not part of the lazy island set (${[...lanyardFileSet].join(', ')}).`,
  )
}

console.log('Bundle check passed: budgets hold and three.js is confined to the lanyard island.')
