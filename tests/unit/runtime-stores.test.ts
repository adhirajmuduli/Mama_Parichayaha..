import { describe, expect, it } from 'vitest'

import { useExhibitsStore } from '@/runtime/stores/exhibits'
import { useNarrativeStore } from '@/runtime/stores/narrative'

describe('narrative store', () => {
  it('applies settles atomically and dedupes identical publications', () => {
    const store = useNarrativeStore.getState()
    store.applySettled({ chapterId: 'research', index: 2, loopCount: 1, direction: 1 })

    const settled = useNarrativeStore.getState()
    expect(settled.settledChapterId).toBe('research')
    expect(settled.settledIndex).toBe(2)
    expect(settled.loopCount).toBe(1)
    expect(settled.direction).toBe(1)
    expect(settled.travelMode).toBe('dwell')
    expect(settled.visibleChapterIds).toEqual(['research'])
    expect(settled.focusableChapterId).toBe('research')

    // Identical publication must not produce a new state identity signal.
    useNarrativeStore
      .getState()
      .applySettled({ chapterId: 'research', index: 2, loopCount: 1, direction: 1 })

    expect(useNarrativeStore.getState().settledIndex).toBe(2)
  })

  it('carries direction across the seam without inference (index 6 → 0)', () => {
    useNarrativeStore
      .getState()
      .applySettled({ chapterId: 'contact', index: 6, loopCount: 0, direction: 1 })
    useNarrativeStore
      .getState()
      .applySettled({ chapterId: 'origins', index: 0, loopCount: 1, direction: 1 })

    const state = useNarrativeStore.getState()
    expect(state.direction).toBe(1)
    expect(state.loopCount).toBe(1)
    expect(state.settledChapterId).toBe('origins')
  })

  it('publishes transition pairs with focus handoff', () => {
    useNarrativeStore.getState().applyVisiblePair('origins', 'interests', 'origins')

    let state = useNarrativeStore.getState()
    expect(state.travelMode).toBe('transition')
    expect(state.visibleChapterIds).toEqual(['origins', 'interests'])
    expect(state.focusableChapterId).toBe('origins')

    useNarrativeStore.getState().applyVisiblePair('origins', 'interests', 'interests')

    state = useNarrativeStore.getState()
    expect(state.focusableChapterId).toBe('interests')

    // Same pair + same focus dedupes.
    const before = state.visibleChapterIds
    useNarrativeStore.getState().applyVisiblePair('origins', 'interests', 'interests')
    expect(useNarrativeStore.getState().visibleChapterIds).toBe(before)
  })

  it('applies visible windows and dedupes them', () => {
    useNarrativeStore.getState().applyWindow(['interests', 'research', 'computation'])

    let state = useNarrativeStore.getState()
    expect(state.visibleChapterIds).toEqual(['interests', 'research', 'computation'])
    expect(state.travelMode).toBe('dwell')

    const windowBefore = state.visibleChapterIds
    useNarrativeStore.getState().applyWindow(['interests', 'research', 'computation'])
    expect(useNarrativeStore.getState().visibleChapterIds).toBe(windowBefore)

    useNarrativeStore.getState().applyWindow(['research'])
    state = useNarrativeStore.getState()
    expect(state.visibleChapterIds).toEqual(['research'])
  })

  it('bumps the keyboard focus token and manages overlays', () => {
    const before = useNarrativeStore.getState().keyboardFocusToken

    useNarrativeStore.getState().requestKeyboardFocus()
    expect(useNarrativeStore.getState().keyboardFocusToken).toBe(before + 1)

    useNarrativeStore.getState().setOverlay('contact')
    expect(useNarrativeStore.getState().overlay).toBe('contact')

    useNarrativeStore.getState().setOverlay(null)
    expect(useNarrativeStore.getState().overlay).toBeNull()
  })
})

describe('exhibits store', () => {
  it('transitions availability and playback with change-detection', () => {
    useExhibitsStore.getState().applyAvailability('dna', 'placeholder')
    useExhibitsStore.getState().applyAvailability('dna', 'ready')
    expect(useExhibitsStore.getState().availability['dna']).toBe('ready')

    useExhibitsStore.getState().applyPlayback('dna', 'playing')
    expect(useExhibitsStore.getState().playback['dna']).toBe('playing')

    useExhibitsStore.getState().applyPlayback('dna', 'static')
    expect(useExhibitsStore.getState().playback['dna']).toBe('static')

    // Re-applying the same value must not churn state.
    const availabilityBefore = useExhibitsStore.getState().availability
    useExhibitsStore.getState().applyAvailability('dna', 'ready')
    expect(useExhibitsStore.getState().availability).toBe(availabilityBefore)

    const playbackBefore = useExhibitsStore.getState().playback
    useExhibitsStore.getState().applyPlayback('dna', 'static')
    expect(useExhibitsStore.getState().playback).toBe(playbackBefore)
  })
})
