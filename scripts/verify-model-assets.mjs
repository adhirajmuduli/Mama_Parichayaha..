import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const assets = [
  {
    path: 'public/models/DNA/dna.glb',
    bytes: 2_639_156,
    hash: 'f2a9d7c99748de8a548605cd066f0768deb5ac323657519598bd2e3508dfdc24',
  },
  {
    path: 'public/models/Proteins/GFP.glb',
    bytes: 5_229_704,
    hash: '17041a7a488a0f3b65ec73c82ca1cd75504891f5f3308680e7c0a6200055adb0',
  },
  {
    path: 'public/models/Tardigrade/water_bear_site.glb',
    bytes: 21_943_424,
    hash: 'ec5be496e12bd34fc5da233a5eff352dd060bf27ffc67e03b22f777972e5b23f',
  },
]

for (const assetPolicy of assets) {
  const asset = await readFile(resolve(rootDirectory, assetPolicy.path))
  const hash = createHash('sha256').update(asset).digest('hex')

  if (asset.readUInt32LE(0) !== 0x46546c67 || asset.readUInt32LE(4) !== 2) {
    throw new Error(`${assetPolicy.path} is not a GLB 2.0 binary.`)
  }

  if (asset.byteLength !== assetPolicy.bytes) {
    throw new Error(`${assetPolicy.path} byte size does not match the approved asset inventory.`)
  }

  if (hash !== assetPolicy.hash) {
    throw new Error(`${assetPolicy.path} hash does not match the approved asset inventory.`)
  }

  console.log(`${assetPolicy.path}: ${asset.byteLength} bytes, SHA-256 verified`)
}
