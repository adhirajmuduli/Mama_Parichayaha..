'use client'

import { useEffect } from 'react'

import { useNarrative } from '@/context/NarrativeContext'

export default function ScrollChapterController() {
  const { setChapter } = useNarrative()

  useEffect(() => {
    const updateChapter = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      if (maxScroll <= 0) return

      const progress = window.scrollY / maxScroll

      if (progress < 0.2) {
        setChapter('origins')
      } else if (progress < 0.4) {
        setChapter('interests')
      } else if (progress < 0.6) {
        setChapter('research')
      } else if (progress < 0.8) {
        setChapter('computation')
      } else {
        setChapter('future')
      }
    }

    updateChapter()

    window.addEventListener('scroll', updateChapter)

    return () => {
      window.removeEventListener('scroll', updateChapter)
    }
  }, [setChapter])

  return null
}
