import {
  chapterContentById,
  chapterIds,
  type ChapterContent,
  type ChapterId,
} from '@/content/portfolio'

import {
  getDwellCameraAnchor,
  getDwellLookTarget,
  getModelCenter,
  getInteriorYaw,
  getRingTangentBasis,
  getScreenRightBasis,
  ROUTE_CHORD,
  type RouteVector,
} from '@/lib/closedRoute'

export { chapterIds }

export const exhibitIds = [
  'dna',
  'dna-alt',
  'bacteriophage',
  'hemoglobin-ribbon',
  'brain-point-cloud',
  'earth-animated',
] as const

export type ExhibitId = (typeof exhibitIds)[number]
export type Vector3Tuple = readonly [number, number, number]
export type CardSide = 'left' | 'right'

interface CameraPose {
  position: Vector3Tuple
  target: Vector3Tuple
}

interface AtmosphereLightDefinition {
  color: string
  intensity: number
  offset: Vector3Tuple
}

export interface AtmosphereDefinition {
  bloom: {
    intensity: number
    threshold: number
  }
  cloudDensity: number
  exposure: number
  fog: {
    far: number
    near: number
  }
  fogColor: string
  keyLight: string
  lighting: {
    ambientIntensity: number
    fill: AtmosphereLightDefinition
    key: AtmosphereLightDefinition
    rim: AtmosphereLightDefinition
  }
  palette: readonly [string, string, string]
  particleColor: string
  particleOpacity: number
}

interface ExhibitDefinition {
  id: ExhibitId
}

export interface ChapterRegistryEntry {
  id: ChapterId
  order: number
  sectionId: string
  navigationLabel: string
  contentId: ChapterId
  scene: {
    center: RouteVector
    exhibits: readonly ExhibitDefinition[]
    atmosphere: AtmosphereDefinition
    modelRotation: Vector3Tuple
    modelOffset: RouteVector
    targetDiameter: number
    lookYOffset: number
    cardSide: CardSide
    cardRestYawDeg: number
    haloColor: string
    environmentColor: string
  }
}

export const chapterLookYOffsets = [0, 0.3, -0.1, 0.2, 0.1, 0, 0] as const

const modelYawCorrections = [0, 0, 0.4, -0.3, 0.2, 0, 0] as const
const targetDiameters = [3.4, 2.8, 3.2, 3.6, 3.2, 3.2, 3.2] as const
const modelOffsetDistances = [2.2, 2.2, 2.4, 2.4, 2.2, 2.2, 2.2] as const

function buildRouteScene(order: number) {
  const center = getModelCenter(order)
  const cardSide: CardSide = order % 2 === 0 ? 'left' : 'right'
  const screenRight = getScreenRightBasis(order)
  const offsetSign = cardSide === 'left' ? 1 : -1
  const offsetDistance = modelOffsetDistances[order] ?? 2.2

  return {
    center,
    cardSide,
    modelRotation: [
      0,
      Number((getInteriorYaw(order) + (modelYawCorrections[order] ?? 0)).toFixed(4)),
      0,
    ] as Vector3Tuple,
    modelOffset: [
      Number((screenRight[0] * offsetDistance * offsetSign).toFixed(3)),
      0,
      Number((screenRight[2] * offsetDistance * offsetSign).toFixed(3)),
    ] as RouteVector,
    targetDiameter: targetDiameters[order] ?? 3.2,
    lookYOffset: chapterLookYOffsets[order] ?? 0,
    cardRestYawDeg: cardSide === 'left' ? 2.5 : -2.5,
  }
}

export const chapterRegistry = [
  {
    id: 'origins',
    order: 0,
    sectionId: 'origins',
    navigationLabel: 'Origins',
    contentId: 'origins',
    scene: {
      ...buildRouteScene(0),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.18, threshold: 0.88 },
        cloudDensity: 0.85,
        exposure: 1.05,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#C17A3A',
        lighting: {
          ambientIntensity: 0.72,
          key: { color: '#C17A3A', intensity: 1.8, offset: [4, 6, 7] },
          rim: { color: '#D4A574', intensity: 2.2, offset: [-4, 1, 3] },
          fill: { color: '#E8DDD0', intensity: 3.2, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#F7F2E8', '#C17A3A'],
        particleColor: '#E8DDD0',
        particleOpacity: 0.28,
      },
      haloColor: '#C17A3A',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'interests',
    order: 1,
    sectionId: 'interests',
    navigationLabel: 'Interests',
    contentId: 'interests',
    scene: {
      ...buildRouteScene(1),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.16, threshold: 0.88 },
        cloudDensity: 0.78,
        exposure: 1.08,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#A08B6F',
        lighting: {
          ambientIntensity: 0.74,
          key: { color: '#A08B6F', intensity: 1.6, offset: [5, 5, 6] },
          rim: { color: '#C9B99A', intensity: 1.8, offset: [-4, 2, 2] },
          fill: { color: '#F0E6D8', intensity: 3, offset: [2, -2, -5] },
        },
        palette: ['#FDFCF8', '#EDE8E0', '#A08B6F'],
        particleColor: '#EDE8E0',
        particleOpacity: 0.22,
      },
      haloColor: '#A08B6F',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'research',
    order: 2,
    sectionId: 'research',
    navigationLabel: 'Research',
    contentId: 'research',
    scene: {
      ...buildRouteScene(2),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.15, threshold: 0.9 },
        cloudDensity: 0.88,
        exposure: 1.1,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#7A9B8E',
        lighting: {
          ambientIntensity: 0.76,
          key: { color: '#7A9B8E', intensity: 1.7, offset: [4, 6, 6] },
          rim: { color: '#B8C9C0', intensity: 1.9, offset: [-3, 1, 3] },
          fill: { color: '#F0EDE8', intensity: 3.1, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#E8F0EC', '#7A9B8E'],
        particleColor: '#E8F0EC',
        particleOpacity: 0.2,
      },
      haloColor: '#7A9B8E',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'computation',
    order: 3,
    sectionId: 'computation',
    navigationLabel: 'Computation',
    contentId: 'computation',
    scene: {
      ...buildRouteScene(3),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.14, threshold: 0.9 },
        cloudDensity: 0.82,
        exposure: 1.06,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#8B7AA8',
        lighting: {
          ambientIntensity: 0.74,
          key: { color: '#8B7AA8', intensity: 1.5, offset: [4, 5, 6] },
          rim: { color: '#C5B8D8', intensity: 1.7, offset: [-4, 2, 2] },
          fill: { color: '#F2EEF5', intensity: 2.9, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#EFEBF5', '#8B7AA8'],
        particleColor: '#EFEBF5',
        particleOpacity: 0.18,
      },
      haloColor: '#8B7AA8',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'future',
    order: 4,
    sectionId: 'future',
    navigationLabel: 'Future',
    contentId: 'future',
    scene: {
      ...buildRouteScene(4),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.12, threshold: 0.92 },
        cloudDensity: 0.72,
        exposure: 1.04,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#C9A86A',
        lighting: {
          ambientIntensity: 0.75,
          key: { color: '#C9A86A', intensity: 1.6, offset: [4, 5, 6] },
          rim: { color: '#E2D5B8', intensity: 1.8, offset: [-4, 2, 2] },
          fill: { color: '#FDF6E8', intensity: 3, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#FDF6E8', '#C9A86A'],
        particleColor: '#FDF6E8',
        particleOpacity: 0.2,
      },
      haloColor: '#C9A86A',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'publications',
    order: 5,
    sectionId: 'publications',
    navigationLabel: 'Publications',
    contentId: 'publications',
    scene: {
      ...buildRouteScene(5),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.13, threshold: 0.9 },
        cloudDensity: 0.78,
        exposure: 1.05,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#9B8EC4',
        lighting: {
          ambientIntensity: 0.74,
          key: { color: '#9B8EC4', intensity: 1.5, offset: [4, 5, 6] },
          rim: { color: '#D4CCE8', intensity: 1.7, offset: [-4, 2, 2] },
          fill: { color: '#F5F0FF', intensity: 2.9, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#F5F0FF', '#9B8EC4'],
        particleColor: '#F5F0FF',
        particleOpacity: 0.18,
      },
      haloColor: '#9B8EC4',
      environmentColor: '#FDFCF8',
    },
  },
  {
    id: 'contact',
    order: 6,
    sectionId: 'contact',
    navigationLabel: 'Contact',
    contentId: 'contact',
    scene: {
      ...buildRouteScene(6),
      exhibits: [] as readonly ExhibitDefinition[],
      atmosphere: {
        bloom: { intensity: 0.12, threshold: 0.92 },
        cloudDensity: 0.8,
        exposure: 1.06,
        fog: { near: 14, far: 58 },
        fogColor: '#FDFCF8',
        keyLight: '#7BAFA5',
        lighting: {
          ambientIntensity: 0.76,
          key: { color: '#7BAFA5', intensity: 1.6, offset: [4, 5, 6] },
          rim: { color: '#C2DDD6', intensity: 1.8, offset: [-4, 2, 2] },
          fill: { color: '#EEF6F3', intensity: 3, offset: [3, -2, -4] },
        },
        palette: ['#FDFCF8', '#EEF6F3', '#7BAFA5'],
        particleColor: '#EEF6F3',
        particleOpacity: 0.2,
      },
      haloColor: '#7BAFA5',
      environmentColor: '#FDFCF8',
    },
  },
] as const satisfies readonly ChapterRegistryEntry[]

export const chapterCount = chapterRegistry.length

export const chapterIndexMap = chapterRegistry.reduce<Record<ChapterId, number>>(
  (indexByChapter, chapter) => {
    indexByChapter[chapter.id] = chapter.order
    return indexByChapter
  },
  {} as Record<ChapterId, number>,
)

export function getChapterEntry(chapterId: ChapterId) {
  const chapter = chapterRegistry[chapterIndexMap[chapterId]]

  if (!chapter) {
    throw new Error(`Missing chapter registry entry: ${chapterId}.`)
  }

  return chapter
}

export function getChapterContent(chapterId: ChapterId): ChapterContent {
  return chapterContentById[getChapterEntry(chapterId).contentId]
}

export function getDwellCameraPose(chapterId: ChapterId): CameraPose {
  const chapter = getChapterEntry(chapterId)

  return {
    position: getDwellCameraAnchor(chapter.order, chapter.scene.lookYOffset),
    target: getDwellLookTarget(chapter.order, chapter.scene.lookYOffset),
  }
}

function assertFiniteVector(vector: Vector3Tuple, label: string) {
  if (vector.length !== 3 || vector.some((value) => !Number.isFinite(value))) {
    throw new Error(`Invalid ${label} vector.`)
  }
}

function assertAtmosphere(atmosphere: AtmosphereDefinition, chapterId: ChapterId) {
  const scalarValues = [
    atmosphere.bloom.intensity,
    atmosphere.bloom.threshold,
    atmosphere.cloudDensity,
    atmosphere.exposure,
    atmosphere.fog.near,
    atmosphere.fog.far,
    atmosphere.lighting.ambientIntensity,
    atmosphere.lighting.fill.intensity,
    atmosphere.lighting.key.intensity,
    atmosphere.lighting.rim.intensity,
    atmosphere.particleOpacity,
  ]

  if (scalarValues.some((value) => !Number.isFinite(value))) {
    throw new Error(`Chapter ${chapterId} has a non-finite atmosphere scalar.`)
  }

  if (atmosphere.fog.near < 0 || atmosphere.fog.far <= atmosphere.fog.near) {
    throw new Error(`Chapter ${chapterId} has an invalid fog range.`)
  }

  if (atmosphere.particleOpacity < 0 || atmosphere.particleOpacity > 1) {
    throw new Error(`Chapter ${chapterId} has an invalid particle opacity.`)
  }

  assertFiniteVector(atmosphere.lighting.key.offset, `${chapterId} key light offset`)
  assertFiniteVector(atmosphere.lighting.rim.offset, `${chapterId} rim light offset`)
  assertFiniteVector(atmosphere.lighting.fill.offset, `${chapterId} fill light offset`)
}

export function assertChapterRegistry(
  registry: readonly ChapterRegistryEntry[] = chapterRegistry,
  contentById: Readonly<Record<ChapterId, ChapterContent>> = chapterContentById,
) {
  if (registry.length !== chapterIds.length) {
    throw new Error(`Expected ${chapterIds.length} chapters, received ${registry.length}.`)
  }

  const ids = new Set<ChapterId>()
  const sectionIds = new Set<string>()

  registry.forEach((chapter, index) => {
    if (chapter.order !== index) {
      throw new Error(`Chapter ${chapter.id} has a non-canonical order.`)
    }

    if (ids.has(chapter.id) || sectionIds.has(chapter.sectionId)) {
      throw new Error(`Duplicate chapter mapping for ${chapter.id}.`)
    }

    if (!contentById[chapter.contentId]) {
      throw new Error(`Chapter ${chapter.id} has no verified content record.`)
    }

    assertFiniteVector(chapter.scene.center, `${chapter.id} center`)
    assertFiniteVector(chapter.scene.modelRotation, `${chapter.id} model rotation`)
    assertFiniteVector(chapter.scene.modelOffset, `${chapter.id} model offset`)
    assertAtmosphere(chapter.scene.atmosphere, chapter.id)

    if (!Number.isFinite(chapter.scene.targetDiameter) || chapter.scene.targetDiameter <= 0) {
      throw new Error(`Chapter ${chapter.id} has an invalid target diameter.`)
    }

    if (chapter.scene.cardSide !== 'left' && chapter.scene.cardSide !== 'right') {
      throw new Error(`Chapter ${chapter.id} has an invalid card side.`)
    }

    chapter.scene.exhibits.forEach((exhibit) => {
      if (!exhibitIds.includes(exhibit.id)) {
        throw new Error(`Chapter ${chapter.id} references an unknown exhibit.`)
      }
    })

    ids.add(chapter.id)
    sectionIds.add(chapter.sectionId)
  })

  chapterIds.forEach((chapterId) => {
    if (!ids.has(chapterId)) {
      throw new Error(`Missing chapter registry entry: ${chapterId}.`)
    }
  })

  for (let index = 0; index < registry.length; index += 1) {
    const current = registry[index]!.scene.center
    const next = registry[(index + 1) % registry.length]!.scene.center
    const chord = Math.hypot(next[0] - current[0], next[2] - current[2])

    if (Math.abs(chord - ROUTE_CHORD) > 0.05) {
      throw new Error(
        `Chapters ${index} and ${(index + 1) % registry.length} violate the route chord.`,
      )
    }
  }
}

assertChapterRegistry()
