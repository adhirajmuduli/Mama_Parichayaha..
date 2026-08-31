'use client'

import ScenePoster from '@/components/scene/ScenePoster'
import CyclicJourneyController from '@/components/motion/CyclicJourneyController'
import CyclicChapterStage from '@/components/journey/CyclicChapterStage'
import SceneEnhancement from '@/components/scene/SceneEnhancement'
import { JourneyRuntimeProvider } from '@/lib/journeyRuntime'

export default function ImmersiveStage() {
  return (
    <main aria-label="Immersive portfolio journey" className="immersive-journey">
      <ScenePoster />
      <JourneyRuntimeProvider>
        <SceneEnhancement />
        <CyclicJourneyController>
          <CyclicChapterStage />
        </CyclicJourneyController>
      </JourneyRuntimeProvider>
    </main>
  )
}
