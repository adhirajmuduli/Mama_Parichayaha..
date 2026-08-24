import { describe, expect, it } from 'vitest'

import {
  ChapterContentListSchema,
  ChapterContentSchema,
  ChapterIdSchema,
  PortfolioContentSchema,
  portfolioContent,
  type PortfolioContent,
} from '@/content/portfolio'
import {
  assertChapterRegistry,
  chapterIds,
  chapterRegistry,
  getCameraPose,
  getChapterContent,
  type ChapterRegistryEntry,
} from '@/lib/chapterRegistry'
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
      'dna',
      'helix',
      'lattice',
      'orbit',
      'phages',
    ])
  })

  it('selects responsive camera poses and adjacent chapters from one order', () => {
    expect(getCameraPose('origins', 1440)).toEqual(chapterRegistry[0]?.scene.camera.desktop)
    expect(getCameraPose('origins', 390)).toEqual(chapterRegistry[0]?.scene.camera.compact)
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
})
