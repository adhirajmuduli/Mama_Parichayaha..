import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const assets = [
  {
    path: 'public/models/dna_for_site.glb',
    bytes: 2_663_212,
    hash: '72e4e4f4e39e95755bffd7e95864572f3cefb30bad4c65f5c28d8d620362e32c',
    requiresDraco: true,
  },
]

for (const assetPolicy of assets) {
  const asset = await readFile(resolve(rootDirectory, assetPolicy.path))
  const hash = createHash('sha256').update(asset).digest('hex')

  if (asset.readUInt32LE(0) !== 0x46546c67 || asset.readUInt32LE(4) !== 2) {
    throw new Error(`${assetPolicy.path} is not a GLB 2.0 binary.`)
  }

  const jsonLength = asset.readUInt32LE(12)
  const document = JSON.parse(
    asset
      .subarray(20, 20 + jsonLength)
      .toString('utf8')
      .trim(),
  )
  const requiresDraco = document.extensionsRequired?.includes('KHR_draco_mesh_compression') ?? false

  if (asset.byteLength !== assetPolicy.bytes || hash !== assetPolicy.hash) {
    throw new Error(`${assetPolicy.path} does not match the approved compressed asset inventory.`)
  }

  if (requiresDraco !== assetPolicy.requiresDraco) {
    throw new Error(`${assetPolicy.path} has an unexpected Draco compression state.`)
  }

  console.log(`${assetPolicy.path}: ${asset.byteLength} bytes, SHA-256 verified`)
}
