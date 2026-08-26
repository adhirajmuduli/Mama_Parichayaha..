import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))

const INSPECTION_TARGETS = [
  {
    id: 'dna-alt',
    chapterId: 'origins',
    role: 'canonical-runtime',
    path: 'public/models/dna_animated_alt_for_site.glb',
  },
  {
    id: 'bacteriophage',
    chapterId: 'interests',
    role: 'canonical-runtime',
    path: 'public/models/bacteriophage_for_site.glb',
  },
  {
    id: 'hemoglobin-ribbon',
    chapterId: 'research',
    role: 'canonical-runtime',
    path: 'public/models/6HHB-ribbon-secondary-vis_NIH3D.glb',
  },
  {
    id: 'brain-point-cloud',
    chapterId: 'computation',
    role: 'canonical-runtime',
    path: 'public/models/brain_point_cloud_site.glb',
  },
  {
    id: 'earth-animated',
    chapterId: 'future',
    role: 'canonical-runtime',
    path: 'public/models/earth_animated_for_site.glb',
  },
  {
    id: 'dna',
    chapterId: 'origins',
    role: 'rollback-only',
    path: 'public/models/dna_for_site.glb',
  },
]

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

function summarizeDocument(document) {
  const primitives = document.meshes.reduce((sum, mesh) => sum + mesh.primitives.length, 0)
  const positionAccessors = document.meshes.flatMap((mesh) =>
    mesh.primitives
      .map((primitive) => primitive.attributes?.POSITION)
      .filter((index) => typeof index === 'number')
      .map((index) => document.accessors[index]),
  )
  const vertexCount = positionAccessors.reduce((sum, accessor) => sum + (accessor?.count ?? 0), 0)

  const minimum = [
    Math.min(...positionAccessors.map((accessor) => Math.min(...(accessor?.min ?? [0])))),
  ]
  const maximum = [
    Math.max(...positionAccessors.map((accessor) => Math.max(...(accessor?.max ?? [0])))),
  ]

  for (const axis of [1, 2]) {
    minimum[axis] = Math.min(
      ...positionAccessors.map((accessor) => Math.min(...(accessor?.min ?? [0]))),
    )
    maximum[axis] = Math.max(
      ...positionAccessors.map((accessor) => Math.max(...(accessor?.max ?? [0]))),
    )
  }

  const animations = (document.animations ?? []).map((animation) => {
    const samplerInputMaxima = animation.samplers
      .map((sampler) => document.accessors[sampler.input]?.max?.[0])
      .filter((value) => typeof value === 'number')

    return {
      name: animation.name ?? '',
      channels: animation.channels.length,
      durationSeconds:
        samplerInputMaxima.length > 0 ? Number(Math.max(...samplerInputMaxima).toFixed(3)) : 0,
    }
  })

  return {
    meshes: document.meshes.length,
    primitives,
    vertices: vertexCount,
    materials: document.materials?.length ?? 0,
    textures: document.textures?.length ?? 0,
    images: document.images?.length ?? 0,
    skins: document.skins?.length ?? 0,
    animationCount: animations.length,
    animations,
    geometryBounds: {
      // Union of POSITION accessor min/max in geometry space, before node transforms.
      min: minimum.map((value) => Number(value.toFixed(4))),
      max: maximum.map((value) => Number(value.toFixed(4))),
    },
    extensionsRequired: document.extensionsRequired ?? [],
  }
}

async function inspectTarget(target) {
  let binary

  try {
    binary = await readFile(resolve(rootDirectory, target.path))
  } catch {
    return {
      ...target,
      present: false,
      sourceBytes: 0,
      sha256: null,
      inspection: null,
      intakeStatus: target.role === 'canonical-runtime' ? 'blocked-asset-not-supplied' : 'absent',
    }
  }

  const document = parseGlb(binary, target.path)

  return {
    ...target,
    present: true,
    sourceBytes: binary.byteLength,
    sha256: createHash('sha256').update(binary).digest('hex'),
    inspection: summarizeDocument(document),
    intakeStatus:
      target.id === 'dna-alt'
        ? document.animations?.length >= 1
          ? 'accepted'
          : 'rejected-no-animation'
        : 'ok',
  }
}

const args = process.argv.slice(2)
const manifestIndex = args.indexOf('--manifest')
const manifestPath =
  manifestIndex >= 0 ? resolve(rootDirectory, args[manifestIndex + 1] ?? '') : null

const results = []
for (const target of INSPECTION_TARGETS) {
  const result = await inspectTarget(target)
  results.push(result)

  const summary = result.present
    ? `${result.sourceBytes} B, meshes=${result.inspection.meshes}, primitives=${result.inspection.primitives}, vertices=${result.inspection.vertices}, textures=${result.inspection.textures}, skins=${result.inspection.skins}, animations=${result.inspection.animationCount}`
    : 'ABSENT'

  console.log(`${target.path} [${target.role}] -> ${summary}`)
}

if (manifestPath) {
  const manifest = {
    version: 1,
    note: 'Patch 0 baseline. Runtime loading consumes src/content/assets.ts; optimization derivatives are added by scripts/optimize-glb.mjs in a later patch.',
    assets: results,
  }

  await mkdir(resolve(manifestPath, '..'), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`manifest written: ${manifestPath}`)
}

const missingCanonical = results.filter(
  (result) => result.role === 'canonical-runtime' && !result.present,
)

if (missingCanonical.length > 0) {
  console.error(
    `BLOCKED: canonical runtime asset(s) absent: ${missingCanonical.map((entry) => entry.path).join(', ')}`,
  )
  process.exitCode = 1
}
