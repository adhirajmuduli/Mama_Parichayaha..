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

interface AtmosphereDefinition {
  fogColor: string
  keyLight: string
  palette: readonly [string, string, string]
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
        fogColor: '#07020f',
        keyLight: '#c084fc',
        palette: ['#07020f', '#2e1065', '#f59e0b'],
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
        fogColor: '#0b1020',
        keyLight: '#fb923c',
        palette: ['#0b1020', '#115e59', '#fb923c'],
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
        fogColor: '#081827',
        keyLight: '#22d3ee',
        palette: ['#081827', '#164e63', '#67e8f9'],
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
        fogColor: '#11111f',
        keyLight: '#818cf8',
        palette: ['#11111f', '#312e81', '#c084fc'],
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
        fogColor: '#0b1020',
        keyLight: '#c4b5fd',
        palette: ['#0b1020', '#312e81', '#cbd5e1'],
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
