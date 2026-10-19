'use client'

import { FEATURES } from '@/config/flags'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

import ScenePoster from '@/components/scene/ScenePoster'
import CyclicJourneyController from '@/components/motion/CyclicJourneyController'
import CyclicChapterStage from '@/components/journey/CyclicChapterStage'
import SceneEnhancement from '@/components/scene/SceneEnhancement'
import { JourneyRuntimeProvider } from '@/lib/journeyRuntime'

// P0 legacy gate (new_plan.md §13 P0): the retired WebGL scene and its poster
// are frozen out by default while the DOM-first rewrite lands. Flip
// NEXT_PUBLIC_FEATURE_LEGACY_SCENE=true to compare against the old experience.
// Both the gate and everything it renders are deleted in the P6 wave.
export default function ImmersiveStage() {
  const enhanced = useSceneInteractionStore((state) => state.rendererAvailable)
  const legacySceneActive = FEATURES.legacyScene

  return (
    <main
      aria-label="Immersive portfolio journey"
      className={enhanced ? 'immersive-journey' : 'portfolio-document'}
      data-journey-enhanced={enhanced}
    >
      <a href="#origins" className="skip-link">
        Skip to portfolio content
      </a>
      {legacySceneActive ? <ScenePoster /> : null}
      <JourneyRuntimeProvider>
        <CyclicJourneyController enabled={enhanced}>
          {legacySceneActive ? <SceneEnhancement /> : null}
          <CyclicChapterStage enhanced={enhanced} />
        </CyclicJourneyController>
      </JourneyRuntimeProvider>
    </main>
  )
}
