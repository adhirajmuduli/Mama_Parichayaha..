import type { ChapterId } from '@/content/portfolio'
import type { SceneQualityTier } from '@/lib/sceneRuntime'
import runtimeModelManifest from '../../public/models/runtime/manifest.json'

type RenderableSceneQualityTier = Exclude<SceneQualityTier, 'static'>
type AssetLoadPolicy = 'current' | 'adjacent' | 'none'
type MaterialOwnership = 'clone' | 'shared'
type GeometryCompression = 'draco' | 'none'

interface AssetCredit {
  author: string
  license: string
  sourceUrl: string
  title: string
}

interface AssetPolicy {
  availableTiers: readonly RenderableSceneQualityTier[]
  preload: AssetLoadPolicy
}

interface BaseSceneAsset {
  chapter: ChapterId
  id: ExhibitId
}

export interface ModelSceneAsset extends BaseSceneAsset {
  animationCount: number
  brotliBytes: number
  bytes: number
  compression: GeometryCompression
  credit: AssetCredit
  format: 'glb'
  geometry: {
    meshes: number
    triangles: number
  }
  gzipBytes: number
  kind: 'gltf'
  materialOwnership: MaterialOwnership
  normalization: {
    activeScale: number
    inactiveScale: number
    orientation: readonly [number, number, number]
    unitScale: number
  }
  policy: AssetPolicy
  sha256: string
  texture: {
    count: number
    maximumDimension: number
  }
  url: `/models/${string}.glb`
}

interface ProceduralSceneAsset extends BaseSceneAsset {
  credit: AssetCredit
  kind: 'procedural'
  policy: AssetPolicy
}

interface UnassignedSceneAsset extends BaseSceneAsset {
  kind: 'unassigned'
  reason: string
}

export interface UnassignedModelCandidate {
  bytes: number
  compression: GeometryCompression
  id: string
  url: `/models/${string}.glb`
}

export type SceneAsset = ModelSceneAsset | ProceduralSceneAsset | UnassignedSceneAsset

const sceneAssetManifest: Record<ExhibitId, SceneAsset> = {
  'dna-alt': {
    id: 'dna-alt',
    kind: 'gltf',
    chapter: 'origins',
    url: '/models/dna_animated_alt_for_site.glb',
    format: 'glb',
    compression: 'draco',
    bytes: 0,
    gzipBytes: 0,
    brotliBytes: 0,
    sha256: '',
    geometry: { meshes: 0, triangles: 0 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 0,
    materialOwnership: 'clone',
    normalization: {
      unitScale: 0,
      activeScale: 5.4,
      inactiveScale: 3.2,
      orientation: [0.35, -0.45, 0.15],
    },
    policy: { availableTiers: ['medium', 'high'], preload: 'current' },
    credit: {
      title: 'DNA VR Interactive Animation (Alternate)',
      author: 'nilantunes',
      license: 'CC BY',
      sourceUrl:
        'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
    },
  },
  bacteriophage: {
    id: 'bacteriophage',
    kind: 'gltf',
    chapter: 'interests',
    url: '/models/bacteriophage_for_site.glb',
    format: 'glb',
    compression: 'draco',
    bytes: 858_352,
    gzipBytes: 0,
    brotliBytes: 0,
    sha256: '45b33e4912016ade8129d80cab56ddb157b060c4f9c46cbdd79848c42ac9520e',
    geometry: { meshes: 12, triangles: 180_754 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 0,
    materialOwnership: 'clone',
    normalization: {
      unitScale: 1,
      activeScale: 1,
      inactiveScale: 0.1,
      orientation: [0, 0, 0],
    },
    policy: { availableTiers: ['low', 'medium', 'high'], preload: 'current' },
    credit: {
      title: 'Procedural bacteriophage study',
      author: 'Portfolio source',
      license: 'Original implementation',
      sourceUrl: 'https://github.com/adhirajmuduli',
    },
  },
  'hemoglobin-ribbon': {
    id: 'hemoglobin-ribbon',
    kind: 'gltf',
    chapter: 'research',
    url: '/models/6HHB-ribbon-secondary-vis_NIH3D.glb',
    format: 'glb',
    compression: 'none',
    bytes: 10_890_316,
    gzipBytes: 0,
    brotliBytes: 0,
    sha256: '5b363993e0c1abc3741a8a0f71bb19c32716c87873bf3ab2562b35c2330d3f41',
    geometry: { meshes: 4, triangles: 221_844 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 0,
    materialOwnership: 'shared',
    normalization: {
      unitScale: 1,
      activeScale: 1,
      inactiveScale: 0.55,
      orientation: [0, 0, 0],
    },
    policy: { availableTiers: ['high'], preload: 'current' },
    credit: {
      title: 'Hemoglobin Ribbon (6HHB)',
      author: 'NIH 3D Print Exchange',
      license: 'CC0',
      sourceUrl: 'https://3d.nih.gov/',
    },
  },
  'brain-point-cloud': {
    id: 'brain-point-cloud',
    kind: 'gltf',
    chapter: 'computation',
    url: '/models/brain_point_cloud_site.glb',
    format: 'glb',
    compression: 'none',
    bytes: 33_405_696,
    gzipBytes: 0,
    brotliBytes: 0,
    sha256: '86fb8cfcb35d116ffe9e76c8d2016233d2da9018db288ecd4d10ce76c6538e8f',
    geometry: { meshes: 19, triangles: 1_192_673 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 0,
    materialOwnership: 'shared',
    normalization: {
      unitScale: 1,
      activeScale: 1,
      inactiveScale: 0.55,
      orientation: [0, 0, 0],
    },
    policy: { availableTiers: ['high'], preload: 'current' },
    credit: {
      title: 'Brain Point Cloud',
      author: 'Human Cell Atlas / EBI',
      license: 'CC BY',
      sourceUrl: 'https://www.ebi.ac.uk/',
    },
  },
  'earth-animated': {
    id: 'earth-animated',
    kind: 'gltf',
    chapter: 'future',
    url: '/models/earth_animated_for_site.glb',
    format: 'glb',
    compression: 'none',
    bytes: 23_342_728,
    gzipBytes: 0,
    brotliBytes: 0,
    sha256: 'dd5410548408a08beeb1e9bf9da10b3347d5aadb8d156f07159aac19bbbe611d',
    geometry: { meshes: 2, triangles: 48_766 },
    texture: { count: 1, maximumDimension: 2048 },
    animationCount: 1,
    materialOwnership: 'shared',
    normalization: {
      unitScale: 1,
      activeScale: 1,
      inactiveScale: 0.1,
      orientation: [0, 0, 0],
    },
    policy: { availableTiers: ['high'], preload: 'current' },
    credit: {
      title: 'Animated Earth',
      author: 'NASA Visible Earth',
      license: 'Public Domain',
      sourceUrl: 'https://visibleearth.nasa.gov/',
    },
  },
  dna: {
    id: 'dna',
    kind: 'gltf',
    chapter: 'origins',
    url: '/models/dna_for_site.glb',
    format: 'glb',
    compression: 'draco',
    bytes: 2_663_212,
    gzipBytes: 1_913_583,
    brotliBytes: 1_899_076,
    sha256: '72e4e4f4e39e95755bffd7e95864572f3cefb30bad4c65f5c28d8d620362e32c',
    geometry: { meshes: 8, triangles: 299_520 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 1,
    materialOwnership: 'clone',
    normalization: {
      unitScale: 0.031_907_8,
      activeScale: 5.4,
      inactiveScale: 3.2,
      orientation: [0.35, -0.45, 0.15],
    },
    policy: { availableTiers: ['low', 'medium', 'high'], preload: 'current' },
    credit: {
      title: 'DNA VR Interactive Animation',
      author: 'nilantunes',
      license: 'CC BY',
      sourceUrl:
        'https://sketchfab.com/3d-models/dna-vr-interactive-animation-c9a926f139044470ad3fb053c66ad71e',
    },
  },
} as const satisfies Record<ExhibitId, SceneAsset>

export const unassignedModelCandidates = [
  {
    id: 'hemoglobin-6hhb',
    url: '/models/6HHB-ribbon-secondary-vis_NIH3D.glb',
    bytes: 10_890_316,
    compression: 'none',
  },
  {
    id: 'adenosine-a2a-receptor',
    url: '/models/adenosine_A2A_receptor_site.glb',
    bytes: 451_028,
    compression: 'draco',
  },
  {
    id: 'diatom-campylodiscus',
    url: '/models/diatom_-_campylodiscus_hibernicus_for_site.glb',
    bytes: 16_119_120,
    compression: 'none',
  },
  {
    id: 'earth',
    url: '/models/earth_site.glb',
    bytes: 8_546_092,
    compression: 'none',
  },
  {
    id: 'forest-clearing',
    url: '/models/forest_clearing_1_top_skybox_site.glb',
    bytes: 12_462_384,
    compression: 'none',
  },
  {
    id: 'ibuprofen',
    url: '/models/ibuprofen_model_for_site.glb',
    bytes: 247_624,
    compression: 'draco',
  },
  {
    id: 'mitochondrion-cross-section',
    url: '/models/mitochondrion_cross-section_wip_for_site.glb',
    bytes: 7_690_392,
    compression: 'none',
  },
  {
    id: 'tropical-plants',
    url: '/models/tropical_plants_pack_m02p_site.glb',
    bytes: 16_137_500,
    compression: 'none',
  },
] as const satisfies readonly UnassignedModelCandidate[]

export const exhibitIds = [
  'dna-alt',
  'bacteriophage',
  'hemoglobin-ribbon',
  'brain-point-cloud',
  'earth-animated',
  'dna',
] as const

export type ExhibitId =
  'dna-alt' | 'bacteriophage' | 'hemoglobin-ribbon' | 'brain-point-cloud' | 'earth-animated' | 'dna'

export const modelAssetIds = [
  'dna',
  'bacteriophage',
  'hemoglobin-ribbon',
  'brain-point-cloud',
  'earth-animated',
  'dna-alt',
] as const

export function getSceneAsset(assetId: ExhibitId): SceneAsset {
  return sceneAssetManifest[assetId]
}

export function isRuntimeIntakePresent(assetId: ExhibitId): boolean {
  return runtimeModelManifest.assets.some((asset) => asset.id === assetId && asset.present)
}

export function resolveRuntimeExhibitId(exhibitId: ExhibitId): ExhibitId {
  if (exhibitId === 'dna-alt' && !isRuntimeIntakePresent('dna-alt')) {
    return 'dna'
  }

  return exhibitId
}

export function getModelAsset(assetId: ExhibitId): ModelSceneAsset {
  const asset = getSceneAsset(assetId)

  if (asset.kind !== 'gltf') {
    throw new Error(`Scene asset "${assetId}" is not an assigned GLTF model.`)
  }

  return asset
}

export function getModelDracoDecoderPath(asset: ModelSceneAsset): false | '/draco/' {
  return asset.compression === 'draco' ? '/draco/' : false
}

export function isSceneAssetAvailable(
  assetId: ExhibitId,
  tier: RenderableSceneQualityTier,
): boolean {
  const asset = getSceneAsset(assetId)
  return asset.kind !== 'unassigned' && asset.policy.availableTiers.includes(tier)
}

export function isRuntimeExhibitAvailable(
  exhibitId: ExhibitId,
  tier: RenderableSceneQualityTier,
): boolean {
  const runtimeExhibitId = resolveRuntimeExhibitId(exhibitId)
  const asset = getSceneAsset(runtimeExhibitId)

  return (
    asset.kind === 'gltf' &&
    asset.bytes > 0 &&
    asset.sha256.length === 64 &&
    isSceneAssetAvailable(runtimeExhibitId, tier)
  )
}

export function assertSceneAssetManifest() {
  const candidateUrls = new Set<string>()

  for (const candidate of unassignedModelCandidates) {
    if (
      !candidate.url.startsWith('/models/') ||
      candidateUrls.has(candidate.url) ||
      candidate.bytes <= 0
    ) {
      throw new Error(`Invalid unassigned model candidate "${candidate.id}".`)
    }

    candidateUrls.add(candidate.url)
  }

  for (const assetId of Object.keys(sceneAssetManifest) as ExhibitId[]) {
    const asset = getSceneAsset(assetId)

    if (asset.kind === 'unassigned') {
      continue
    }

    if (!asset.policy.availableTiers.length) {
      throw new Error(`Scene asset "${assetId}" has no available quality tier.`)
    }

    if (
      asset.kind === 'gltf' &&
      (!asset.url.startsWith('/models/') || asset.texture.maximumDimension > 2048)
    ) {
      throw new Error(`Scene model "${assetId}" violates the local asset policy.`)
    }
  }
}

assertSceneAssetManifest()
