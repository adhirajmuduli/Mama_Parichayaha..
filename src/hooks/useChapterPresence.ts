'use client'

import useChapter from '@/hooks/useChapter'

import { chapterIndexMap, Chapter } from '@/lib/chapters'

export default function useChapterPresence(chapter: Chapter) {
  const { chapter: current } = useChapter()

  const distance = Math.abs(chapterIndexMap[current] - chapterIndexMap[chapter])

  return {
    active: distance === 0,

    nearby: distance <= 1,

    distance,
  }
}
