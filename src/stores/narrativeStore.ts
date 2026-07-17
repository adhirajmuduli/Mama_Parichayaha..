'use client'

import { create } from 'zustand'

import type { ChapterId } from '@/content/portfolio'
import { chapterIndexMap, type ExhibitId } from '@/lib/chapterRegistry'

type NavigationDirection = -1 | 0 | 1

interface NarrativeStore {
  activeChapter: ChapterId
  direction: NavigationDirection
  selectedExhibit: ExhibitId | null
  setActiveChapter: (chapter: ChapterId) => void
  selectExhibit: (exhibit: ExhibitId | null) => void
}

export const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  activeChapter: 'origins',
  direction: 0,
  selectedExhibit: null,
  setActiveChapter: (chapter) => {
    const previousChapter = get().activeChapter

    if (previousChapter === chapter) {
      return
    }

    set({
      activeChapter: chapter,
      direction: chapterIndexMap[chapter] > chapterIndexMap[previousChapter] ? 1 : -1,
    })
  },
  selectExhibit: (selectedExhibit) => set({ selectedExhibit }),
}))
