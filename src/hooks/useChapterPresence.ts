'use client'

import useChapter from '@/hooks/useChapter'

import type { Chapter } from '@/lib/chapters'
import { getChapterPresence } from '@/lib/chapterSelectors'

export default function useChapterPresence(chapter: Chapter) {
  const { chapter: current } = useChapter()

  return getChapterPresence(current, chapter)
}
