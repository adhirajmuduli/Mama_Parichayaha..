import { resolveRuntimeExhibitId } from '@/content/assets'
import type { ChapterId } from '@/content/portfolio'

import {
  chapterIndexMap,
  chapterRegistry,
  getChapterEntry,
  type ExhibitId,
} from '@/lib/chapterRegistry'

export function getChapterAtProgress(progress: number): ChapterId {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1)
  const index = Math.min(
    Math.floor(normalizedProgress * chapterRegistry.length),
    chapterRegistry.length - 1,
  )
  const chapter = chapterRegistry[index]

  if (!chapter) {
    throw new Error('Chapter registry is empty.')
  }

  return chapter.id
}

function getChapterDistance(activeChapter: ChapterId, chapter: ChapterId) {
  const distance = Math.abs(chapterIndexMap[activeChapter] - chapterIndexMap[chapter])
  return Math.min(distance, chapterRegistry.length - distance)
}

export function getAdjacentChapterIds(chapter: ChapterId) {
  const index = chapterIndexMap[chapter]
  const previous =
    chapterRegistry[(index - 1 + chapterRegistry.length) % chapterRegistry.length]?.id
  const next = chapterRegistry[(index + 1) % chapterRegistry.length]?.id

  return [previous, next].filter((chapterId): chapterId is ChapterId => chapterId !== undefined)
}

export function getChapterPresence(activeChapter: ChapterId, chapter: ChapterId) {
  const distance = getChapterDistance(activeChapter, chapter)

  return {
    active: distance === 0,
    nearby: distance <= 1,
    distance,
  }
}

export function chapterHasExhibit(chapter: ChapterId, exhibit: ExhibitId) {
  const exhibits = getChapterEntry(chapter).scene.exhibits
  if (exhibits.length === 0) {
    return false
  }
  return exhibits.some(
    (candidate) => candidate.id === exhibit || resolveRuntimeExhibitId(candidate.id) === exhibit,
  )
}
