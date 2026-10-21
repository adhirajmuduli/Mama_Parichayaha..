'use client'

/**
 * Narrative store (new_plan.md §7.4) — discrete, low-frequency journey state.
 *
 * Differences from the retired `stores/narrativeStore.ts`:
 *   - Id-agnostic: chapter ids are strings injected by the runtime; no
 *     content import, no fixed roster, no index→id literals.
 *   - Direction/loop arrive ONLY via `applySettled` (single writer: the
 *     journey runtime). The legacy `setActiveChapter` inferred direction by
 *     comparing numeric indices — wrong across the cyclic seam — and that
 *     path is gone.
 *   - Frame-level data (units, transforms) never lives here.
 *
 * `overlay` keeps the legacy kinds ('contact' | 'information') so supplement
 * surfaces port without churn; P10 may revisit.
 */

import { create } from 'zustand'

import type { JourneyDirection, TravelMode } from '@/types/experience'

export type OverlayKind = null | 'contact' | 'information'

export interface SettledInfo {
  chapterId: string
  index: number
  loopCount: number
  direction: JourneyDirection
}

interface NarrativeState {
  settledChapterId: string
  settledIndex: number
  direction: JourneyDirection
  travelMode: TravelMode
  loopCount: number
  /** Chapters whose stage surfaces may be visible (settled pair or window). */
  visibleChapterIds: readonly string[]
  /** The chapter that should receive keyboard focus during a transition. */
  focusableChapterId: string
  overlay: OverlayKind
  /** Monotonic token; consumers focus the settled card when it changes. */
  keyboardFocusToken: number

  /** Atomic settle publication. The runtime is the only writer. */
  applySettled: (info: SettledInfo) => void
  /** Publish the visible pair during a transition (ordered outgoing→incoming). */
  applyVisiblePair: (outgoingId: string, incomingId: string, focusableId: string) => void
  /** Publish the visible window at rest (settled ± neighbors). */
  applyWindow: (chapterIds: readonly string[]) => void
  setOverlay: (overlay: OverlayKind) => void
  requestKeyboardFocus: () => void
}

export const useNarrativeStore = create<NarrativeState>((set, get) => ({
  settledChapterId: '',
  settledIndex: -1,
  direction: 0,
  travelMode: 'dwell',
  loopCount: 0,
  visibleChapterIds: [],
  focusableChapterId: '',
  overlay: null,
  keyboardFocusToken: 0,

  applySettled: (info) => {
    const current = get()

    if (
      current.settledChapterId === info.chapterId &&
      current.settledIndex === info.index &&
      current.loopCount === info.loopCount &&
      current.direction === info.direction &&
      current.travelMode === 'dwell'
    ) {
      // Identical publication — swallow to keep renders at one per arrival.
      return
    }

    set({
      settledChapterId: info.chapterId,
      settledIndex: info.index,
      loopCount: info.loopCount,
      direction: info.direction,
      travelMode: 'dwell',
      visibleChapterIds: [info.chapterId],
      focusableChapterId: info.chapterId,
    })
  },

  applyVisiblePair: (outgoingId, incomingId, focusableId) => {
    if (outgoingId === incomingId) return

    const current = get()
    const currentVisible = current.visibleChapterIds

    if (
      currentVisible.length === 2 &&
      currentVisible[0] === outgoingId &&
      currentVisible[1] === incomingId &&
      current.focusableChapterId === focusableId &&
      current.travelMode === 'transition'
    ) {
      return
    }

    set({
      visibleChapterIds: [outgoingId, incomingId],
      focusableChapterId: focusableId,
      travelMode: 'transition',
    })
  },

  applyWindow: (chapterIds) => {
    const current = get()
    const currentVisible = current.visibleChapterIds

    if (
      current.travelMode === 'dwell' &&
      currentVisible.length === chapterIds.length &&
      chapterIds.every((id, index) => currentVisible[index] === id)
    ) {
      return
    }

    set({ visibleChapterIds: chapterIds, travelMode: 'dwell' })
  },

  setOverlay: (overlay) => {
    if (get().overlay === overlay) return

    set({ overlay })
  },

  requestKeyboardFocus: () => {
    set({ keyboardFocusToken: get().keyboardFocusToken + 1 })
  },
}))
