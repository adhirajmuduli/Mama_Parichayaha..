import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputPath = resolve(rootDirectory, 'artifacts/licenses/package-licenses.json')
const lockfile = JSON.parse(await readFile(resolve(rootDirectory, 'package-lock.json'), 'utf8'))
const licenseOverrides = new Map([['webgl-constants@1.1.1', 'MIT']])

const packages = Object.entries(lockfile.packages ?? {})
  .filter(([path]) => path.startsWith('node_modules/'))
  .map(([path, details]) => ({
    name: path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
    version: details.version ?? 'unknown',
    license:
      details.license ??
      licenseOverrides.get(
        `${path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length)}@${details.version}`,
      ) ??
      'UNKNOWN',
    resolved: details.resolved ?? null,
  }))
  .sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
  )

const unknownLicenses = packages.filter((packageRecord) => packageRecord.license === 'UNKNOWN')
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), packages, unknownLicenses }, null, 2)}\n`,
)

console.log(`Wrote ${packages.length} package licenses to ${outputPath}`)
if (unknownLicenses.length > 0) {
  throw new Error(`License metadata is missing for ${unknownLicenses.length} package(s).`)
}
