import type { ChapterId } from '@/content/portfolio'
import type { ExhibitId } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'

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

const sceneAssetManifest = {
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
      unitScale: 0.0319078,
      activeScale: 7.5216,
      inactiveScale: 1.567,
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
  phages: {
    id: 'phages',
    kind: 'procedural',
    chapter: 'interests',
    policy: { availableTiers: ['low', 'medium', 'high'], preload: 'none' },
    credit: {
      title: 'Procedural bacteriophage study',
      author: 'Portfolio source',
      license: 'Original implementation',
      sourceUrl: 'https://github.com/adhirajmuduli',
    },
  },
  protein: {
    id: 'protein',
    kind: 'unassigned',
    chapter: 'research',
    reason: 'Awaiting owner-selected replacement model and verified provenance.',
  },
  tardigrade: {
    id: 'tardigrade',
    kind: 'unassigned',
    chapter: 'computation',
    reason: 'Awaiting owner-selected replacement model and verified provenance.',
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
    id: 'bacteriophage',
    url: '/models/bacteriophage_for_site.glb',
    bytes: 858_352,
    compression: 'draco',
  },
  {
    id: 'brain-point-cloud',
    url: '/models/brain_point_cloud_site.glb',
    bytes: 33_405_696,
    compression: 'none',
  },
  {
    id: 'diatom-campylodiscus',
    url: '/models/diatom_-_campylodiscus_hibernicus_for_site.glb',
    bytes: 16_119_120,
    compression: 'none',
  },
  {
    id: 'earth-animated',
    url: '/models/earth_animated_for_site.glb',
    bytes: 23_342_728,
    compression: 'none',
  },
  { id: 'earth', url: '/models/earth_site.glb', bytes: 8_546_092, compression: 'none' },
  {
    id: 'forest-clearing',
    url: '/models/forest_clearing_1_top_skybox_site.glb',
    bytes: 12_462_384,
    compression: 'none',
  },
  {
    id: 'hemoglobin-ribbon',
    url: '/models/hb_wohemo-ribbon-rainbow-vis-custom.glb',
    bytes: 7_619_240,
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

const sceneAssetIds = Object.keys(sceneAssetManifest) as ExhibitId[]
export const modelAssetIds = ['dna'] as const

export function getSceneAsset(assetId: ExhibitId): SceneAsset {
  return sceneAssetManifest[assetId]
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

  for (const assetId of sceneAssetIds) {
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
