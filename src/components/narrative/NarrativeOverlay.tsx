'use client'

import NarrativeChapterCard from '@/components/narrative/NarrativeChapterCard'
import useChapter from '@/hooks/useChapter'

export default function NarrativeOverlay() {
  const { chapter } = useChapter()

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <NarrativeChapterCard chapter={chapter} />
    </div>
  )
}
