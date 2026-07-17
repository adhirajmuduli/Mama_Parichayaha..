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
} from '@/lib/chapterRegistry'
import {
  getAdjacentChapterIds,
  getChapterAtProgress,
  getChapterPresence,
} from '@/lib/chapterSelectors'

describe('chapter registry', () => {
  it('maps each canonical chapter to verified content and serializable scene data', () => {
    assertChapterRegistry()

    expect(chapterRegistry.map((chapter) => chapter.id)).toEqual(chapterIds)
    expect(chapterRegistry.map((chapter) => getChapterContent(chapter.id).id)).toEqual(chapterIds)
    expect(JSON.parse(JSON.stringify(chapterRegistry))).toEqual(chapterRegistry)
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

  it('rejects duplicate or incomplete content ids', () => {
    const duplicateContent = [
      ...portfolioContent.chapters.slice(0, -1),
      portfolioContent.chapters[0],
    ]

    expect(ChapterContentListSchema.safeParse(duplicateContent).success).toBe(false)
  })
})
