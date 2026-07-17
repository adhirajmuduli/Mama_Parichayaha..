import type { ChapterId } from '@/content/portfolio'
import type { ExhibitId } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'

type RenderableSceneQualityTier = Exclude<SceneQualityTier, 'static'>

type AssetLoadPolicy = 'current' | 'adjacent' | 'none'
type MaterialOwnership = 'clone' | 'shared'

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
  credit: AssetCredit
  id: ExhibitId
  policy: AssetPolicy
}

export interface ModelSceneAsset extends BaseSceneAsset {
  animationCount: number
  brotliBytes: number
  bytes: number
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
  sha256: string
  texture: {
    count: number
    maximumDimension: number
  }
  url: `/models/${string}.glb`
}

interface ProceduralSceneAsset extends BaseSceneAsset {
  kind: 'procedural'
}

export type SceneAsset = ModelSceneAsset | ProceduralSceneAsset

const sceneAssetManifest = {
  dna: {
    id: 'dna',
    kind: 'gltf',
    chapter: 'origins',
    url: '/models/DNA/dna.glb',
    format: 'glb',
    bytes: 2_639_156,
    gzipBytes: 919_728,
    brotliBytes: 567_257,
    sha256: 'f2a9d7c99748de8a548605cd066f0768deb5ac323657519598bd2e3508dfdc24',
    geometry: { meshes: 2, triangles: 103_840 },
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
    kind: 'gltf',
    chapter: 'research',
    url: '/models/Proteins/GFP.glb',
    format: 'glb',
    bytes: 5_229_704,
    gzipBytes: 2_063_201,
    brotliBytes: 1_903_391,
    sha256: '17041a7a488a0f3b65ec73c82ca1cd75504891f5f3308680e7c0a6200055adb0',
    geometry: { meshes: 1, triangles: 156_024 },
    texture: { count: 0, maximumDimension: 0 },
    animationCount: 0,
    materialOwnership: 'clone',
    normalization: {
      unitScale: 0.0170106,
      activeScale: 3.459,
      inactiveScale: 3.459,
      orientation: [0.2, 0.5, 0.5],
    },
    policy: { availableTiers: ['medium', 'high'], preload: 'adjacent' },
    credit: {
      title: 'Structure of Green Fluorescent Protein (1GFL)',
      author: 'RCSB Protein Data Bank',
      license: 'CC0 1.0',
      sourceUrl: 'https://www.rcsb.org/structure/1GFL',
    },
  },
  tardigrade: {
    id: 'tardigrade',
    kind: 'gltf',
    chapter: 'computation',
    url: '/models/Tardigrade/water_bear_site.glb',
    format: 'glb',
    bytes: 21_943_424,
    gzipBytes: 14_317_907,
    brotliBytes: 10_124_706,
    sha256: 'ec5be496e12bd34fc5da233a5eff352dd060bf27ffc67e03b22f777972e5b23f',
    geometry: { meshes: 7, triangles: 683_396 },
    texture: { count: 1, maximumDimension: 1024 },
    animationCount: 0,
    materialOwnership: 'clone',
    normalization: {
      unitScale: 0.1760652,
      activeScale: 3.2,
      inactiveScale: 1.344,
      orientation: [0.16, 0.48, 0],
    },
    policy: { availableTiers: ['medium', 'high'], preload: 'none' },
    credit: {
      title: 'Water Bear',
      author: 'oneillbeck',
      license: 'CC BY',
      sourceUrl: 'https://sketchfab.com/3d-models/water-bear-6e0ecc9d43ad4cf9a17efab2900f72ee',
    },
  },
} as const satisfies Record<ExhibitId, SceneAsset>

const sceneAssetIds = Object.keys(sceneAssetManifest) as ExhibitId[]
export const modelAssetIds = sceneAssetIds.filter(
  (assetId): assetId is Extract<ExhibitId, 'dna' | 'protein' | 'tardigrade'> =>
    sceneAssetManifest[assetId].kind === 'gltf',
)

export function getSceneAsset(assetId: ExhibitId): SceneAsset {
  return sceneAssetManifest[assetId]
}

export function getModelAsset(assetId: ExhibitId): ModelSceneAsset {
  const asset = getSceneAsset(assetId)

  if (asset.kind !== 'gltf') {
    throw new Error(`Scene asset "${assetId}" is not a GLTF model.`)
  }

  return asset
}

export function isSceneAssetAvailable(
  assetId: ExhibitId,
  tier: RenderableSceneQualityTier,
): boolean {
  return getSceneAsset(assetId).policy.availableTiers.includes(tier)
}

export function assertSceneAssetManifest() {
  for (const assetId of sceneAssetIds) {
    const asset = getSceneAsset(assetId)

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
