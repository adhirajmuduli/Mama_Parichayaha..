'use client'

/**
 * ImmersiveStage (new_plan.md §7.6) — the client composition root.
 *
 * Wraps everything in the NEW journey runtime (topology injected from
 * ClientContent), attaches the input coordinator to the stage host once the
 * boot script has confirmed immersive mode, and lays out the background,
 * document deck, progress rail, cursor blob and diagnostics overlay.
 *
 * Hydration order: SSR ships document-mode DOM; the boot script sets
 * data-experience="immersive" pre-paint; StageDocument marks data-hydrated
 * after mount so CSS switches from the stacked document to the fixed stage
 * exactly once — no flash, no hydration mismatch.
 */

import { useEffect, useRef, useState } from 'react'

import type { ClientContent } from '@/types/experience'
import { FEATURES } from '@/config/flags'
import { JourneyRuntimeProvider, useJourneyRuntime } from '@/runtime/journeyRuntime'
import { useJourneyInput } from '@/runtime/input/coordinator'
import { useNarrativeStore } from '@/runtime/stores/narrative'
import { useCapabilities } from '@/runtime/capabilities'
import { primeQualityFromCapabilities } from '@/runtime/quality'
import { registerDiagnostics } from '@/runtime/diagnostics'
import { observeLongTasks } from '@/runtime/diagnostics/metrics'

import { StageDocument } from './StageDocument'
import { ProgressRail } from './ProgressRail'
import { StageBackground } from '@/ui/background/StageBackground'
import { BlobCursor } from '@/ui/fx/BlobCursor'
import { DiagnosticsOverlay } from '@/runtime/diagnostics/overlay'

export interface ImmersiveStageProps {
  content: ClientContent
}

function readImmersiveMode(): boolean {
  return (
    typeof document !== 'undefined' && document.documentElement.dataset.experience === 'immersive'
  )
}

function StageBody({ content }: { content: ClientContent }) {
  const runtime = useJourneyRuntime()
  const capabilities = useCapabilities()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [immersive, setImmersive] = useState(false)

  // The boot script decides the mode pre-paint; read it once after mount and
  // keep listeners gated on it (no-JS never reaches this code).
  useEffect(() => {
    setImmersive(readImmersiveMode())
  }, [])

  useJourneyInput({ runtime, enabled: immersive, hostRef })

  // Quality tiers prime from measured capabilities exactly once per session.
  useEffect(() => {
    primeQualityFromCapabilities(capabilities)
  }, [capabilities])

  // Diagnostics sources (flag-gated; zero production cost).
  useEffect(() => {
    if (!FEATURES.diagnostics) return

    observeLongTasks()

    return registerDiagnostics('runtime', () => ({
      units: Number(runtime.getUnits().toFixed(3)),
      input: Number(runtime.getInputUnits().toFixed(3)),
      moving: runtime.isMoving(),
      paused: runtime.isPaused(),
    }))
  }, [runtime])

  useEffect(() => {
    if (!FEATURES.diagnostics) return

    return registerDiagnostics('narrative', () => {
      const state = useNarrativeStore.getState()

      return {
        settled: state.settledChapterId,
        travelMode: state.travelMode,
        loop: state.loopCount,
        window: state.visibleChapterIds.join(','),
        focusable: state.focusableChapterId,
      }
    })
  }, [])

  return (
    <>
      <StageBackground chapters={content.chapters} />
      <StageDocument content={content} immersive={immersive} hostRef={hostRef} />
      <ProgressRail content={content} immersive={immersive} />
      <BlobCursor />
      {FEATURES.diagnostics ? <DiagnosticsOverlay /> : null}
    </>
  )
}

export default function ImmersiveStage({ content }: ImmersiveStageProps) {
  const chapterIds = content.chapters.map((chapter) => chapter.id)

  return (
    <JourneyRuntimeProvider chapterIds={chapterIds}>
      <StageBody content={content} />
    </JourneyRuntimeProvider>
  )
}
