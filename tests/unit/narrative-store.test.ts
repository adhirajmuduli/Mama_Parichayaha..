import { beforeEach, describe, expect, it } from 'vitest'

import { useNarrativeStore } from '@/stores/narrativeStore'

describe('narrative store', () => {
  beforeEach(() => {
    useNarrativeStore.setState({
      activeChapter: 'origins',
      direction: 0,
      selectedExhibit: null,
    })
  })

  it('updates only discrete chapter and active exhibit state', () => {
    useNarrativeStore.getState().setActiveChapter('research')
    useNarrativeStore.getState().selectExhibit('protein')

    expect(useNarrativeStore.getState()).toMatchObject({
      activeChapter: 'research',
      direction: 1,
      selectedExhibit: 'protein',
    })
  })

  it('rejects exhibits that are absent from the active chapter', () => {
    useNarrativeStore.getState().selectExhibit('protein')

    expect(useNarrativeStore.getState().selectedExhibit).toBeNull()
  })

  it('clears a selected exhibit when chapter navigation makes it unavailable', () => {
    useNarrativeStore.getState().setActiveChapter('research')
    useNarrativeStore.getState().selectExhibit('protein')
    useNarrativeStore.getState().setActiveChapter('computation')

    expect(useNarrativeStore.getState()).toMatchObject({
      activeChapter: 'computation',
      selectedExhibit: null,
    })
  })

  it('derives reverse navigation direction without changing selection', () => {
    useNarrativeStore.getState().setActiveChapter('future')
    useNarrativeStore.getState().setActiveChapter('interests')

    expect(useNarrativeStore.getState()).toMatchObject({
      activeChapter: 'interests',
      direction: -1,
      selectedExhibit: null,
    })
  })
})
