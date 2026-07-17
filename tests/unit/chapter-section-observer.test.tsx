import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ChapterSectionObserver from '@/components/narrative/ChapterSectionObserver'
import { useNarrativeStore } from '@/stores/narrativeStore'

const callbacks: IntersectionObserverCallback[] = []

class TestIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn(() => [])
  unobserve = vi.fn()

  constructor(callback: IntersectionObserverCallback) {
    callbacks.push(callback)
  }
}

describe('ChapterSectionObserver', () => {
  beforeEach(() => {
    callbacks.length = 0
    useNarrativeStore.setState({
      activeChapter: 'origins',
      direction: 0,
      selectedExhibit: null,
    })
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('updates discrete active chapter state when its semantic section enters the reading band', () => {
    render(
      <section id="research">
        <ChapterSectionObserver chapter="research" sectionId="research" />
      </section>,
    )

    const callback = callbacks[0]

    if (!callback) {
      throw new Error(
        'Expected ChapterSectionObserver to register an IntersectionObserver callback.',
      )
    }

    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    expect(useNarrativeStore.getState()).toMatchObject({
      activeChapter: 'research',
      direction: 1,
    })
  })
})
