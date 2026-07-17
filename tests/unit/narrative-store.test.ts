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

  it('updates only discrete chapter and exhibit state', () => {
    useNarrativeStore.getState().setActiveChapter('research')
    useNarrativeStore.getState().selectExhibit('protein')

    expect(useNarrativeStore.getState()).toMatchObject({
      activeChapter: 'research',
      direction: 1,
      selectedExhibit: 'protein',
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
