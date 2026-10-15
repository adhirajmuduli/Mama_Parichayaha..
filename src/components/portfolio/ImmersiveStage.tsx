'use client'

import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

import ScenePoster from '@/components/scene/ScenePoster'
import CyclicJourneyController from '@/components/motion/CyclicJourneyController'
import CyclicChapterStage from '@/components/journey/CyclicChapterStage'
import SceneEnhancement from '@/components/scene/SceneEnhancement'
import { JourneyRuntimeProvider } from '@/lib/journeyRuntime'

export default function ImmersiveStage() {
  const enhanced = useSceneInteractionStore((state) => state.rendererAvailable)
  return (
    <main
      aria-label="Immersive portfolio journey"
      className={enhanced ? 'immersive-journey' : 'portfolio-document'}
      data-journey-enhanced={enhanced}
    >
      <a href="#origins" className="skip-link">
        Skip to portfolio content
      </a>
      <ScenePoster />
      <JourneyRuntimeProvider>
        <CyclicJourneyController enabled={enhanced}>
          <SceneEnhancement />
          <CyclicChapterStage enhanced={enhanced} />
        </CyclicJourneyController>
      </JourneyRuntimeProvider>
    </main>
  )
}
