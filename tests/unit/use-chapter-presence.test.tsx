import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import useChapterPresence from '@/hooks/useChapterPresence'
import { useNarrativeStore } from '@/stores/narrativeStore'

describe('useChapterPresence', () => {
  beforeEach(() => {
    useNarrativeStore.setState({ activeChapter: 'origins', direction: 0, selectedExhibit: null })
  })

  it('derives active and adjacent chapter presence from the canonical store', () => {
    const { result, rerender } = renderHook(({ chapter }) => useChapterPresence(chapter), {
      initialProps: { chapter: 'origins' as const },
    })

    expect(result.current).toMatchObject({ active: true, distance: 0, nearby: true })

    useNarrativeStore.getState().setActiveChapter('interests')
    rerender({ chapter: 'origins' })

    expect(result.current).toMatchObject({ active: false, distance: 1, nearby: true })
  })
})
