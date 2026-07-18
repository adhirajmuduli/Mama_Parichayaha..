import {
  chapterContentById,
  chapterIds,
  type ChapterContent,
  type ChapterId,
} from '@/content/portfolio'

export { chapterIds }

export const exhibitIds = ['dna', 'phages', 'protein', 'tardigrade'] as const

export type ExhibitId = (typeof exhibitIds)[number]
export type Vector3Tuple = readonly [number, number, number]

interface CameraPose {
  position: Vector3Tuple
  target: Vector3Tuple
}

interface ResponsiveCamera {
  desktop: CameraPose
  compact: CameraPose
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
    center: Vector3Tuple
    camera: ResponsiveCamera
    atmosphere: AtmosphereDefinition
    exhibits: readonly ExhibitDefinition[]
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
      center: [0, 0, 4],
      camera: {
        desktop: { position: [0, 2, 12], target: [0, 0, 4] },
        compact: { position: [0, 1.5, 14], target: [0, 0, 4] },
      },
      atmosphere: {
        bloom: { intensity: 0.24, threshold: 0.66 },
        cloudDensity: 0.94,
        exposure: 0.9,
        fog: { near: 11, far: 39 },
        fogColor: '#07020f',
        keyLight: '#c084fc',
        lighting: {
          ambientIntensity: 0.24,
          key: { color: '#a78bfa', intensity: 3.2, offset: [4, 6, 7] },
          rim: { color: '#f59e0b', intensity: 10, offset: [-4, 1, 3] },
          fill: { color: '#4f46e5', intensity: 6, offset: [3, -2, -4] },
        },
        palette: ['#07020f', '#2e1065', '#f59e0b'],
        particleColor: '#c4b5fd',
        particleOpacity: 0.38,
      },
      exhibits: [{ id: 'dna' }],
    },
  },
  {
    id: 'interests',
    order: 1,
    sectionId: 'interests',
    navigationLabel: 'Interests',
    contentId: 'interests',
    scene: {
      center: [18, 2.152, 3.301],
      camera: {
        desktop: { position: [18, 4.152, 11.301], target: [18, 2.152, 3.301] },
        compact: { position: [18, 3.652, 13.301], target: [18, 2.152, 3.301] },
      },
      atmosphere: {
        bloom: { intensity: 0.18, threshold: 0.72 },
        cloudDensity: 0.82,
        exposure: 0.86,
        fog: { near: 12, far: 42 },
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
      exhibits: [{ id: 'phages' }],
    },
  },
  {
    id: 'research',
    order: 2,
    sectionId: 'research',
    navigationLabel: 'Research',
    contentId: 'research',
    scene: {
      center: [36, 2.999, 1.449],
      camera: {
        desktop: { position: [36, 4.999, 9.449], target: [36, 2.999, 1.449] },
        compact: { position: [36, 4.499, 11.449], target: [36, 2.999, 1.449] },
      },
      atmosphere: {
        bloom: { intensity: 0.28, threshold: 0.6 },
        cloudDensity: 1.02,
        exposure: 0.98,
        fog: { near: 10, far: 38 },
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
      exhibits: [{ id: 'protein' }],
    },
  },
  {
    id: 'computation',
    order: 3,
    sectionId: 'computation',
    navigationLabel: 'Computation',
    contentId: 'computation',
    scene: {
      center: [54, 2.026, -0.909],
      camera: {
        desktop: { position: [54, 4.026, 7.091], target: [54, 2.026, -0.909] },
        compact: { position: [54, 3.526, 9.091], target: [54, 2.026, -0.909] },
      },
      atmosphere: {
        bloom: { intensity: 0.2, threshold: 0.7 },
        cloudDensity: 0.88,
        exposure: 0.9,
        fog: { near: 11, far: 40 },
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
      exhibits: [{ id: 'tardigrade' }],
    },
  },
  {
    id: 'future',
    order: 4,
    sectionId: 'future',
    navigationLabel: 'Future',
    contentId: 'future',
    scene: {
      center: [72, -0.175, -2.949],
      camera: {
        desktop: { position: [72, 1.825, 5.051], target: [72, -0.175, -2.949] },
        compact: { position: [72, 1.325, 7.051], target: [72, -0.175, -2.949] },
      },
      atmosphere: {
        bloom: { intensity: 0.16, threshold: 0.74 },
        cloudDensity: 0.76,
        exposure: 0.84,
        fog: { near: 12, far: 43 },
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
      exhibits: [],
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

export function getCameraPose(chapterId: ChapterId, viewportWidth: number) {
  const camera = getChapterEntry(chapterId).scene.camera
  return viewportWidth < 768 ? camera.compact : camera.desktop
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
    assertFiniteVector(chapter.scene.camera.desktop.position, `${chapter.id} desktop position`)
    assertFiniteVector(chapter.scene.camera.desktop.target, `${chapter.id} desktop target`)
    assertFiniteVector(chapter.scene.camera.compact.position, `${chapter.id} compact position`)
    assertFiniteVector(chapter.scene.camera.compact.target, `${chapter.id} compact target`)
    assertAtmosphere(chapter.scene.atmosphere, chapter.id)

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
}

assertChapterRegistry()
