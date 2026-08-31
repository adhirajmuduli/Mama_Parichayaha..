import { describe, expect, it } from 'vitest'

import {
  chapterContentById,
  ChapterContentListSchema,
  ChapterContentSchema,
  ChapterIdSchema,
  portfolioContent,
  PortfolioContentSchema,
  type PortfolioContent,
} from '@/content/portfolio'
import {
  assertChapterRegistry,
  chapterIds,
  chapterRegistry,
  getChapterContent,
  getDwellCameraPose,
  type ChapterRegistryEntry,
} from '@/lib/chapterRegistry'
import { getModelCenter, getRadialBasis, ROUTE_CHORD, ROUTE_RADIUS } from '@/lib/closedRoute'
import {
  getAdjacentChapterIds,
  getChapterAtProgress,
  getChapterPresence,
} from '@/lib/chapterSelectors'
import { assertExhibitLoaders, exhibitLoaders } from '@/components/scene/exhibitLoaders'

describe('chapter registry', () => {
  it('maps each canonical chapter to verified content and serializable scene data', () => {
    assertChapterRegistry()
    assertExhibitLoaders()

    expect(chapterRegistry.map((chapter) => chapter.id)).toEqual(chapterIds)
    expect(chapterRegistry.map((chapter) => getChapterContent(chapter.id).id)).toEqual(chapterIds)
    expect(JSON.parse(JSON.stringify(chapterRegistry))).toEqual(chapterRegistry)
    expect(Object.keys(exhibitLoaders).sort()).toEqual([
      'bacteriophage',
      'brain-point-cloud',
      'dna',
      'dna-alt',
      'earth-animated',
      'hemoglobin-ribbon',
    ])
  })

  it('places every chapter on the closed route with the exact plan centers', () => {
    const expectedCenters: Array<readonly [number, number, number]> = [
      [0.0, 0.0, -22.0],
      [20.923, 2.4, -6.798],
      [12.931, -1.3, 17.798],
      [-12.931, 1.9, 17.798],
      [-20.923, 0.5, -6.798],
    ]

    chapterRegistry.forEach((chapter, index) => {
      expect(chapter.scene.center).toEqual(expectedCenters[index])
      expect(chapter.order).toBe(index)
      expect(chapter.scene.cardSide).toBe(index % 2 === 0 ? 'left' : 'right')
      expect(chapter.scene.targetDiameter).toBeGreaterThan(0)
    })
  })

  it('keeps adjacent planar chords at the 25.86-unit route chord including the seam', () => {
    for (let index = 0; index < chapterRegistry.length; index += 1) {
      const current = chapterRegistry[index]!.scene.center
      const next = chapterRegistry[(index + 1) % chapterRegistry.length]!.scene.center
      const chord = Math.hypot(next[0] - current[0], next[2] - current[2])

      expect(Math.abs(chord - ROUTE_CHORD)).toBeLessThanOrEqual(0.05)
      expect(ROUTE_CHORD).toBeCloseTo(25.86, 2)
      expect(ROUTE_RADIUS).toBe(22)
    }
  })

  it('derives unit radial bases and dwell anchors from the route', () => {
    chapterRegistry.forEach((chapter, index) => {
      const radial = getRadialBasis(index)

      expect(Math.hypot(radial[0], radial[2])).toBeCloseTo(1, 6)

      const pose = getDwellCameraPose(chapter.id)
      const center = getModelCenter(index)
      const planarDistance = Math.hypot(pose.position[0] - center[0], pose.position[2] - center[2])

      expect(planarDistance).toBeCloseTo(10.5, 3)
      expect(pose.position[1]).toBeCloseTo(center[1] + 2.6, 3)
      expect(pose.target[1]).toBeCloseTo(center[1] + chapter.scene.lookYOffset, 3)
    })
  })

  it('selects adjacent chapters from one order', () => {
    expect(getAdjacentChapterIds('origins')).toEqual(['interests'])
    expect(getAdjacentChapterIds('research')).toEqual(['interests', 'computation'])
    expect(getChapterAtProgress(0)).toBe('origins')
    expect(getChapterAtProgress(0.6)).toBe('computation')
    expect(getChapterAtProgress(1)).toBe('future')
    expect(getChapterPresence('research', 'interests')).toEqual({
      active: false,
      nearby: true,
      distance: 1,
    })
  })

  it('clamps scroll progress and handles chapter boundaries and exhibit ownership', () => {
    expect(getChapterAtProgress(-0.2)).toBe('origins')
    expect(getChapterAtProgress(1.2)).toBe('future')
    expect(getAdjacentChapterIds('origins')).toEqual(['interests'])
    expect(getAdjacentChapterIds('future')).toEqual(['computation'])
    expect(getChapterPresence('origins', 'future')).toEqual({
      active: false,
      nearby: false,
      distance: 4,
    })
    expect(getChapterPresence('computation', 'computation')).toEqual({
      active: true,
      nearby: true,
      distance: 0,
    })
  })

  it('rejects non-canonical registry mappings and unsafe scene values', () => {
    const copyRegistry = () => structuredClone(chapterRegistry) as unknown as ChapterRegistryEntry[]

    const nonCanonicalOrder = copyRegistry()
    nonCanonicalOrder[0]!.order = 1
    expect(() => assertChapterRegistry(nonCanonicalOrder)).toThrow('non-canonical order')

    const duplicateSection = copyRegistry()
    duplicateSection[1]!.sectionId = duplicateSection[0]!.sectionId
    expect(() => assertChapterRegistry(duplicateSection)).toThrow('Duplicate chapter mapping')

    const invalidFog = copyRegistry()
    invalidFog[0]!.scene.atmosphere.fog.far = invalidFog[0]!.scene.atmosphere.fog.near
    expect(() => assertChapterRegistry(invalidFog)).toThrow('invalid fog range')

    const invalidOpacity = copyRegistry()
    invalidOpacity[0]!.scene.atmosphere.particleOpacity = 1.1
    expect(() => assertChapterRegistry(invalidOpacity)).toThrow('invalid particle opacity')

    const invalidDiameter = copyRegistry()
    invalidDiameter[0]!.scene.targetDiameter = 0
    expect(() => assertChapterRegistry(invalidDiameter)).toThrow('invalid target diameter')

    const brokenChord = copyRegistry()
    brokenChord[1]!.scene.center = [
      brokenChord[1]!.scene.center[0],
      brokenChord[1]!.scene.center[1],
      0,
    ]
    expect(() => assertChapterRegistry(brokenChord)).toThrow('violate the route chord')

    const unknownExhibit = copyRegistry()
    unknownExhibit[0]!.scene.exhibits = [{ id: 'unknown' as never }]
    expect(() => assertChapterRegistry(unknownExhibit)).toThrow('unknown exhibit')
  })

  it('rejects duplicate or incomplete content ids', () => {
    const duplicateContent = [
      ...portfolioContent.chapters.slice(0, -1),
      portfolioContent.chapters[0],
    ]

    expect(ChapterContentListSchema.safeParse(duplicateContent).success).toBe(false)
  })

  it('validates the serializable content contract at each schema boundary', () => {
    const parsedContent: PortfolioContent = PortfolioContentSchema.parse(portfolioContent)

    expect(ChapterIdSchema.parse('origins')).toBe('origins')
    expect(ChapterContentSchema.parse(parsedContent.chapters[0])).toEqual(parsedContent.chapters[0])
  })

  it('resolves content through the registry only', () => {
    expect(chapterContentById.origins.id).toBe('origins')
    expect(getChapterContent('future').id).toBe('future')
  })
})
