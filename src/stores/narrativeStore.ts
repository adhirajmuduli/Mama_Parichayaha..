'use client'

import { create } from 'zustand'

import type { ChapterId } from '@/content/portfolio'
import { chapterIndexMap, chapterIds, type ExhibitId } from '@/lib/chapterRegistry'
import { chapterHasExhibit } from '@/lib/chapterSelectors'
import type { JourneyDirection, TravelMode } from '@/lib/journeyTimeline'

export type OverlayKind = null | 'contact' | 'information'

interface NarrativeStore {
  activeChapter: ChapterId
  direction: JourneyDirection
  selectedExhibit: ExhibitId | null
  settledChapterId: ChapterId
  visibleChapterIds: ChapterId[]
  focusableChapterId: ChapterId | null
  travelMode: TravelMode
  loopCount: number
  overlay: OverlayKind
  keyboardFocusToken: number
  setActiveChapter: (chapter: ChapterId) => void
  selectExhibit: (exhibit: ExhibitId | null) => void
  publishSettledState: (state: {
    settledIndex: number
    loopCount: number
    direction: JourneyDirection
  }) => void
  setVisiblePair: (outgoingIndex: number, incomingIndex: number, focusIndex: number) => void
  setTravelMode: (travelMode: TravelMode) => void
  setOverlay: (overlay: OverlayKind) => void
  requestKeyboardFocus: () => void
}

function chapterIdForIndex(index: number): ChapterId {
  const id = chapterIds[index]

  if (!id) {
    throw new Error(`No chapter is registered for cyclic index ${index}.`)
  }

  return id
}

export const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  activeChapter: 'origins',
  direction: 0,
  selectedExhibit: null,
  settledChapterId: 'origins',
  visibleChapterIds: ['origins'],
  focusableChapterId: 'origins',
  travelMode: 'dwell',
  loopCount: 0,
  overlay: null,
  keyboardFocusToken: 0,
  setActiveChapter: (chapter) => {
    const { activeChapter: previousChapter, selectedExhibit } = get()

    if (previousChapter === chapter) {
      return
    }

    set({
      activeChapter: chapter,
      direction: chapterIndexMap[chapter] > chapterIndexMap[previousChapter] ? 1 : -1,
      selectedExhibit:
        selectedExhibit && chapterHasExhibit(chapter, selectedExhibit) ? selectedExhibit : null,
    })
  },
  selectExhibit: (selectedExhibit) => {
    if (selectedExhibit && !chapterHasExhibit(get().activeChapter, selectedExhibit)) {
      return
    }

    set({ selectedExhibit })
  },
  publishSettledState: ({ settledIndex, loopCount, direction }) => {
    const settledChapterId = chapterIdForIndex(settledIndex)
    const current = get()

    if (
      current.settledChapterId === settledChapterId &&
      current.loopCount === loopCount &&
      current.direction === direction &&
      current.travelMode === 'dwell'
    ) {
      return
    }

    set({
      settledChapterId,
      loopCount,
      direction,
      travelMode: 'dwell',
      visibleChapterIds: [settledChapterId],
      focusableChapterId: settledChapterId,
      ...(selectedExhibitGuard(current.selectedExhibit, settledChapterId)
        ? {}
        : { selectedExhibit: null }),
    })
  },
  setVisiblePair: (outgoingIndex, incomingIndex, focusIndex) => {
    const outgoing = chapterIdForIndex(outgoingIndex)
    const incoming = chapterIdForIndex(incomingIndex)

    if (outgoing === incoming) {
      return
    }

    const focusableChapterId = chapterIdForIndex(focusIndex)
    const previous = get().visibleChapterIds

    if (
      previous.length === 2 &&
      previous[0] === outgoing &&
      previous[1] === incoming &&
      get().focusableChapterId === focusableChapterId
    ) {
      return
    }

    set({ visibleChapterIds: [outgoing, incoming], focusableChapterId, travelMode: 'transition' })
  },
  setTravelMode: (travelMode) => {
    if (get().travelMode === travelMode) {
      return
    }

    set({ travelMode })
  },
  setOverlay: (overlay) => {
    if (get().overlay === overlay) {
      return
    }

    set({ overlay })
  },
  requestKeyboardFocus: () => {
    set({ keyboardFocusToken: get().keyboardFocusToken + 1 })
  },
}))

function selectedExhibitGuard(
  selectedExhibit: ExhibitId | null,
  settledChapterId: ChapterId,
): boolean {
  return selectedExhibit === null || chapterHasExhibit(settledChapterId, selectedExhibit)
}
