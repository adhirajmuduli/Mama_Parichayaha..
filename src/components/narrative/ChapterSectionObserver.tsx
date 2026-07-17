'use client'

import { useEffect } from 'react'

import type { ChapterId } from '@/content/portfolio'
import { useNarrativeStore } from '@/stores/narrativeStore'

interface ChapterSectionObserverProps {
  chapter: ChapterId
  sectionId: string
}

export default function ChapterSectionObserver({
  chapter,
  sectionId,
}: ChapterSectionObserverProps) {
  const setActiveChapter = useNarrativeStore((state) => state.setActiveChapter)

  useEffect(() => {
    const section = document.getElementById(sectionId)

    if (!section) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveChapter(chapter)
        }
      },
      {
        rootMargin: '-35% 0px -45%',
        threshold: 0,
      },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [chapter, sectionId, setActiveChapter])

  return null
}
