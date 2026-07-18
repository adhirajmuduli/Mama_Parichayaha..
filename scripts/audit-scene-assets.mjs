import { createHash } from 'node:crypto'
import { access, readdir, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const children = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? listFiles(path) : [path]
    }),
  )

  return children.flat()
}

function parseGlb(binary, relativePath) {
  if (binary.readUInt32LE(0) !== 0x46546c67 || binary.readUInt32LE(4) !== 2) {
    throw new Error(`${relativePath} is not a GLB 2.0 binary.`)
  }

  const jsonLength = binary.readUInt32LE(12)
  const jsonType = binary.readUInt32LE(16)

  if (jsonType !== 0x4e4f534a) {
    throw new Error(`${relativePath} does not begin with a JSON GLB chunk.`)
  }

  return JSON.parse(
    binary
      .subarray(20, 20 + jsonLength)
      .toString('utf8')
      .trim(),
  )
}

const modelDirectory = resolve(rootDirectory, 'public/models')
const discoveredModels = (await listFiles(modelDirectory))
  .filter((path) => path.endsWith('.glb'))
  .map((path) => relative(rootDirectory, path).replaceAll('\\', '/'))
  .sort()

if (!discoveredModels.length) {
  throw new Error('No local GLB models were discovered.')
}

for (const relativePath of discoveredModels) {
  if (relativePath.slice('public/models/'.length).includes('/')) {
    throw new Error(`${relativePath} is not in the flat public/models inventory.`)
  }

  const binary = await readFile(resolve(rootDirectory, relativePath))
  const document = parseGlb(binary, relativePath)
  const requiresDraco = document.extensionsRequired?.includes('KHR_draco_mesh_compression') ?? false

  if (requiresDraco) {
    await Promise.all([
      access(resolve(rootDirectory, 'public/draco/draco_decoder.js'), constants.R_OK),
      access(resolve(rootDirectory, 'public/draco/draco_decoder.wasm'), constants.R_OK),
    ])
  }

  console.log(
    `${relativePath}: ${binary.byteLength} B, Draco ${requiresDraco ? 'required' : 'not required'}, SHA-256 ${createHash('sha256').update(binary).digest('hex')}`,
  )
}

const sourceFiles = (await listFiles(resolve(rootDirectory, 'src'))).filter((path) =>
  /\.(ts|tsx)$/.test(path),
)
const rawModelPathFiles = []
const remoteSceneOrFontFiles = []

for (const path of sourceFiles) {
  const content = await readFile(path, 'utf8')
  const sourcePath = relative(rootDirectory, path).replaceAll('\\', '/')

  if (sourcePath !== 'src/content/assets.ts' && /['"]\/models\//.test(content)) {
    rawModelPathFiles.push(sourcePath)
  }

  if (/next\/font|fonts\.google|<Environment\b|preset=['"]city['"]/.test(content)) {
    remoteSceneOrFontFiles.push(sourcePath)
  }
}

if (rawModelPathFiles.length || remoteSceneOrFontFiles.length) {
  throw new Error(
    `Scene asset policy violation: raw model paths [${rawModelPathFiles.join(', ')}], remote scene/font imports [${remoteSceneOrFontFiles.join(', ')}].`,
  )
}

console.log('Scene asset manifest policy: verified')
