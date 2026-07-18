import { spawnSync } from 'node:child_process'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const argumentsByName = new Map([
  ['dna', 'public/models/dna_for_site.glb'],
  ['bacteriophage', 'public/models/bacteriophage_for_site.glb'],
  ['adenosine-a2a-receptor', 'public/models/adenosine_A2A_receptor_site.glb'],
  ['ibuprofen', 'public/models/ibuprofen_model_for_site.glb'],
])
const requestedAsset = process.argv.at(2)

if (!requestedAsset || !argumentsByName.has(requestedAsset)) {
  throw new Error(`Usage: npm run asset:optimize -- <${[...argumentsByName.keys()].join('|')}>`)
}

const inputPath = resolve(rootDirectory, argumentsByName.get(requestedAsset))
const outputDirectory = resolve(rootDirectory, 'artifacts/phase5/meshopt')
const outputPath = resolve(outputDirectory, `${requestedAsset}.meshopt.glb`)
await mkdir(outputDirectory, { recursive: true })

const result = spawnSync(
  command,
  ['gltf-transform', 'meshopt', inputPath, outputPath, '--level', 'high'],
  {
    cwd: rootDirectory,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  },
)

if (result.error) {
  throw result.error
}

if (result.status !== 0) {
  process.exitCode = result.status ?? 1
} else {
  const [input, output, inputStats, outputStats] = await Promise.all([
    readFile(inputPath),
    readFile(outputPath),
    stat(inputPath),
    stat(outputPath),
  ])
  const compress = (source) => ({
    brotli: brotliCompressSync(source, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).byteLength,
    gzip: gzipSync(source, { level: 9 }).byteLength,
  })
  const inputTransfer = compress(input)
  const outputTransfer = compress(output)
  const percent = (value, baseline) => ((1 - value / baseline) * 100).toFixed(2)

  console.log(`Candidate: ${outputPath}`)
  console.log(
    `Raw bytes: ${inputStats.size} -> ${outputStats.size} (${percent(outputStats.size, inputStats.size)}% reduction)`,
  )
  console.log(
    `Gzip bytes: ${inputTransfer.gzip} -> ${outputTransfer.gzip} (${percent(outputTransfer.gzip, inputTransfer.gzip)}% reduction)`,
  )
  console.log(
    `Brotli bytes: ${inputTransfer.brotli} -> ${outputTransfer.brotli} (${percent(outputTransfer.brotli, inputTransfer.brotli)}% reduction)`,
  )
  console.log(
    'Candidate is not deployed. Validate its visual and scientific fidelity before changing the manifest.',
  )
}
