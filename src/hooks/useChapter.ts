'use client'

import { useNarrativeStore } from '@/stores/narrativeStore'

export default function useChapter() {
  const chapter = useNarrativeStore((state) => state.activeChapter)
  const setChapter = useNarrativeStore((state) => state.setActiveChapter)

  return { chapter, setChapter }
}
