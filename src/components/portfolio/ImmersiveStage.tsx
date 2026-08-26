'use client'

import ScenePoster from '@/components/scene/ScenePoster'
import CyclicJourneyController from '@/components/motion/CyclicJourneyController'
import CyclicChapterStage from '@/components/narrative/CyclicChapterStage'
import { JourneyRuntimeProvider } from '@/lib/journeyRuntime'

export default function ImmersiveStage() {
  return (
    <main aria-label="Immersive portfolio journey" className="immersive-journey">
      <ScenePoster />
      <JourneyRuntimeProvider>
        <CyclicJourneyController>
          <CyclicChapterStage />
        </CyclicJourneyController>
      </JourneyRuntimeProvider>
    </main>
  )
}
