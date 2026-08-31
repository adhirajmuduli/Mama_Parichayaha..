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
      exhibits: [{ id: 'dna-alt' }],
      atmosphere: {
        bloom: { intensity: 0.24, threshold: 0.66 },
        cloudDensity: 0.94,
        exposure: 0.9,
        fog: { near: 13, far: 54 },
        fogColor: '#07020f',
        keyLight: '#c084fc',
        lighting: {
          ambientIntensity: 0.24,
          key: { color: '#a78bfa', intensity: 3.2, offset: [4, 6, 7] },
          rim: { color: '#f59e0b', intensity: 4, offset: [-4, 1, 3] },
          fill: { color: '#4f46e5', intensity: 4.5, offset: [3, -2, -4] },
        },
        palette: ['#07020f', '#2e1065', '#f59e0b'],
        particleColor: '#c4b5fd',
        particleOpacity: 0.38,
      },
      haloColor: '#c084fc',
      environmentColor: '#07020f',
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
      exhibits: [{ id: 'bacteriophage' }],
      atmosphere: {
        bloom: { intensity: 0.18, threshold: 0.72 },
        cloudDensity: 0.82,
        exposure: 0.86,
        fog: { near: 13, far: 54 },
        fogColor: '#0b1020',
        keyLight: '#fb923c',
        lighting: {
          ambientIntensity: 0.2,
          key: { color: '#fb923c', intensity: 2.8, offset: [5, 5, 6] },
          rim: { color: '#2dd4bf', intensity: 8, offset: [-4, 2, 2] },
          fill: { color: '#7c3aed', intensity: 5, offset: [2, -2, -5] },
        },
        palette: ['#0b1020', '#115e59', '#fb923c'],
        particleColor: '#99f6e4',
        particleOpacity: 0.3,
      },
      haloColor: '#fb923c',
      environmentColor: '#0b1020',
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
      exhibits: [{ id: 'hemoglobin-ribbon' }],
      atmosphere: {
        bloom: { intensity: 0.28, threshold: 0.6 },
        cloudDensity: 1.02,
        exposure: 0.98,
        fog: { near: 13, far: 54 },
        fogColor: '#081827',
        keyLight: '#22d3ee',
        lighting: {
          ambientIntensity: 0.2,
          key: { color: '#22d3ee', intensity: 3.4, offset: [4, 6, 6] },
          rim: { color: '#34d399', intensity: 9, offset: [-3, 1, 3] },
          fill: { color: '#0e7490', intensity: 7, offset: [3, -2, -4] },
        },
        palette: ['#081827', '#164e63', '#67e8f9'],
        particleColor: '#a5f3fc',
        particleOpacity: 0.42,
      },
      haloColor: '#22d3ee',
      environmentColor: '#081827',
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
      exhibits: [{ id: 'brain-point-cloud' }],
      atmosphere: {
        bloom: { intensity: 0.2, threshold: 0.7 },
        cloudDensity: 0.88,
        exposure: 0.9,
        fog: { near: 13, far: 54 },
        fogColor: '#11111f',
        keyLight: '#818cf8',
        lighting: {
          ambientIntensity: 0.22,
          key: { color: '#818cf8', intensity: 3, offset: [4, 5, 6] },
          rim: { color: '#c084fc', intensity: 8, offset: [-4, 2, 2] },
          fill: { color: '#4338ca', intensity: 5, offset: [3, -2, -4] },
        },
        palette: ['#11111f', '#312e81', '#c084fc'],
        particleColor: '#c4b5fd',
        particleOpacity: 0.32,
      },
      haloColor: '#818cf8',
      environmentColor: '#11111f',
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
      exhibits: [{ id: 'earth-animated' }],
      atmosphere: {
        bloom: { intensity: 0.16, threshold: 0.74 },
        cloudDensity: 0.76,
        exposure: 0.84,
        fog: { near: 13, far: 54 },
        fogColor: '#0b1020',
        keyLight: '#c4b5fd',
        lighting: {
          ambientIntensity: 0.24,
          key: { color: '#c4b5fd', intensity: 2.6, offset: [4, 5, 6] },
          rim: { color: '#cbd5e1', intensity: 6, offset: [-4, 2, 2] },
          fill: { color: '#14b8a6', intensity: 4, offset: [3, -2, -4] },
        },
        palette: ['#0b1020', '#312e81', '#cbd5e1'],
        particleColor: '#ccfbf1',
        particleOpacity: 0.24,
      },
      haloColor: '#c4b5fd',
      environmentColor: '#0b1020',
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
      exhibits: [{ id: 'dna' }],
      atmosphere: {
        bloom: { intensity: 0.2, threshold: 0.7 },
        cloudDensity: 0.85,
        exposure: 0.88,
        fog: { near: 13, far: 54 },
        fogColor: '#0f0f1a',
        keyLight: '#a78bfa',
        lighting: {
          ambientIntensity: 0.22,
          key: { color: '#a78bfa', intensity: 3, offset: [4, 5, 6] },
          rim: { color: '#f472b6', intensity: 7, offset: [-4, 2, 2] },
          fill: { color: '#6366f1', intensity: 4.5, offset: [3, -2, -4] },
        },
        palette: ['#0f0f1a', '#4c1d95', '#f472b6'],
        particleColor: '#e9d5ff',
        particleOpacity: 0.3,
      },
      haloColor: '#a78bfa',
      environmentColor: '#0f0f1a',
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
      exhibits: [{ id: 'dna-alt' }],
      atmosphere: {
        bloom: { intensity: 0.22, threshold: 0.68 },
        cloudDensity: 0.9,
        exposure: 0.92,
        fog: { near: 13, far: 54 },
        fogColor: '#0d0d15',
        keyLight: '#8b5cf6',
        lighting: {
          ambientIntensity: 0.24,
          key: { color: '#8b5cf6', intensity: 3.2, offset: [4, 5, 6] },
          rim: { color: '#06b6d4', intensity: 7.5, offset: [-4, 2, 2] },
          fill: { color: '#7c3aed', intensity: 5, offset: [3, -2, -4] },
        },
        palette: ['#0d0d15', '#5b21b6', '#06b6d4'],
        particleColor: '#ddd6fe',
        particleOpacity: 0.35,
      },
      haloColor: '#8b5cf6',
      environmentColor: '#0d0d15',
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
