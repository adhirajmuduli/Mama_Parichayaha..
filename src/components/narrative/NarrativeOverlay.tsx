"use client"

import OriginsCard from "@/components/cards/OriginsCard"
import InterestsCard from "@/components/cards/InterestsCard"
import ResearchCard from "@/components/cards/ResearchCard"
import useChapter from "@/hooks/useChapter"

export default function NarrativeOverlay() {
  const { chapter } = useChapter()

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {chapter === "origins" && <OriginsCard />}
      {chapter === "interests" && <InterestsCard />}
      {chapter === "research" && <ResearchCard />}
    </div>
  )
}