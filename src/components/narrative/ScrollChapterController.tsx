'use client'

import { useEffect } from 'react'

import { getChapterAtProgress } from '@/lib/chapterSelectors'
import { useNarrativeStore } from '@/stores/narrativeStore'

export default function ScrollChapterController() {
  const setChapter = useNarrativeStore((state) => state.setActiveChapter)

  useEffect(() => {
    const updateChapter = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      if (maxScroll <= 0) return

      setChapter(getChapterAtProgress(window.scrollY / maxScroll))
    }

    updateChapter()
    window.addEventListener('scroll', updateChapter)

    return () => window.removeEventListener('scroll', updateChapter)
  }, [setChapter])

  return null
}
