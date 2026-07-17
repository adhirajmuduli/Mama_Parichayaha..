import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const retainedModels = new Map([
  ['public/models/DNA/dna.glb', { bytes: 2_639_156, maximumTextureDimension: 0 }],
  ['public/models/Proteins/GFP.glb', { bytes: 5_229_704, maximumTextureDimension: 0 }],
  [
    'public/models/Tardigrade/water_bear_site.glb',
    { bytes: 21_943_424, maximumTextureDimension: 1024 },
  ],
])

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

  const binaryChunkHeader = 20 + jsonLength
  const binaryChunkLength = binary.readUInt32LE(binaryChunkHeader)
  const binaryChunkType = binary.readUInt32LE(binaryChunkHeader + 4)

  if (binaryChunkType !== 0x004e4942) {
    throw new Error(`${relativePath} has no binary GLB chunk.`)
  }

  return {
    binaryChunk: binary.subarray(binaryChunkHeader + 8, binaryChunkHeader + 8 + binaryChunkLength),
    document: JSON.parse(
      binary
        .subarray(20, 20 + jsonLength)
        .toString('utf8')
        .trim(),
    ),
  }
}

function getImageMaximumDimension(document, binaryChunk, relativePath) {
  const dimensions = (document.images ?? []).map((image) => {
    if (image.mimeType !== 'image/png' || image.bufferView === undefined) {
      throw new Error(`${relativePath} contains an unsupported embedded image format.`)
    }

    const bufferView = document.bufferViews?.[image.bufferView]

    if (!bufferView) {
      throw new Error(`${relativePath} image references a missing buffer view.`)
    }

    const offset = bufferView.byteOffset ?? 0
    const pngSignature = binaryChunk.subarray(offset, offset + 8).toString('hex')

    if (pngSignature !== '89504e470d0a1a0a') {
      throw new Error(`${relativePath} embedded image is not a PNG.`)
    }

    return Math.max(binaryChunk.readUInt32BE(offset + 16), binaryChunk.readUInt32BE(offset + 20))
  })

  return Math.max(0, ...dimensions)
}

const modelDirectory = resolve(rootDirectory, 'public/models')
const discoveredModels = (await listFiles(modelDirectory))
  .filter((path) => path.endsWith('.glb'))
  .map((path) => relative(rootDirectory, path).replaceAll('\\', '/'))
  .sort()
const expectedModels = [...retainedModels.keys()].sort()

if (JSON.stringify(discoveredModels) !== JSON.stringify(expectedModels)) {
  throw new Error(`Unexpected deployed GLB set: ${discoveredModels.join(', ')}`)
}

for (const [relativePath, policy] of retainedModels) {
  const binary = await readFile(resolve(rootDirectory, relativePath))
  const { binaryChunk, document } = parseGlb(binary, relativePath)
  const maximumTextureDimension = getImageMaximumDimension(document, binaryChunk, relativePath)

  if (binary.byteLength !== policy.bytes) {
    throw new Error(`${relativePath} byte size does not match the approved manifest baseline.`)
  }

  if (
    maximumTextureDimension !== policy.maximumTextureDimension ||
    maximumTextureDimension > 2048
  ) {
    throw new Error(`${relativePath} violates the approved texture dimension policy.`)
  }

  console.log(
    `${relativePath}: ${binary.byteLength} B, maximum texture ${maximumTextureDimension}px, SHA-256 ${createHash('sha256').update(binary).digest('hex')}`,
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
