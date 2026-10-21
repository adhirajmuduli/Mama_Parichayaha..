'use client'

/**
 * Exhibit playback gating (new_plan.md §10.4 state machine, §7.5) — derives
 * per-exhibit playback from capability, quality, focus and visibility inputs
 * and publishes discrete state to the exhibits store.
 *
 * static: no animation possible (reduced motion, fpsCap 0, unanimated source).
 * playing: visible window + nothing suspending.
 * paused: user paused (persists while the chapter stays visible).
 * idle: chapter outside the visible window.
 */

import { useEffect, useState } from 'react'

import type { ExhibitPlayback } from '@/types/experience'
import { FEATURES } from '@/config/flags'
import { useCapabilities } from '@/runtime/capabilities'
import { useQualityProfile } from '@/runtime/quality'
import { useExhibitsStore } from '@/runtime/stores/exhibits'

export interface ExhibitPlaybackInputs {
  exhibitId: string
  /** Chapter settled or transitioning. */
  active: boolean
  /** The source can animate (real frames + flag on). */
  animated: boolean
}

export interface ExhibitPlaybackState {
  playback: ExhibitPlayback
  /** User pause persisted across chapter visits for this exhibit. */
  userPaused: boolean
  setUserPaused(next: boolean): void
  /** True when a restart was just requested (consumed by the player). */
  restartToken: number
  requestRestart(): void
}

export function useExhibitPlayback({
  exhibitId,
  active,
  animated,
}: ExhibitPlaybackInputs): ExhibitPlaybackState {
  const capabilities = useCapabilities()
  const quality = useQualityProfile()
  const [userPaused, setUserPaused] = useState(false)
  const [restartToken, setRestartToken] = useState(0)
  const [documentHidden, setDocumentHidden] = useState(false)
  const applyPlayback = useExhibitsStore((state) => state.applyPlayback)

  // Track tab visibility locally; the scheduler already stops, but playback
  // state must reflect suspension too (controls + diagnostics read it).
  useEffect(() => {
    const sync = () => {
      setDocumentHidden(document.visibilityState === 'hidden')
    }

    sync()
    document.addEventListener('visibilitychange', sync)

    return () => {
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  const canAnimate =
    FEATURES.exhibits &&
    animated &&
    !capabilities.reducedMotion &&
    quality.fpsCap > 0 &&
    !capabilities.saveData

  let playback: ExhibitPlayback = 'idle'

  if (!active) {
    playback = 'idle'
  } else if (!canAnimate) {
    playback = 'static'
  } else if (documentHidden) {
    playback = 'paused'
  } else if (userPaused) {
    playback = 'paused'
  } else {
    playback = 'playing'
  }

  // Publish discrete changes once (the store dedupes identical writes).
  useEffect(() => {
    applyPlayback(exhibitId, playback)
  }, [applyPlayback, exhibitId, playback])

  return {
    playback,
    userPaused,
    setUserPaused,
    restartToken,
    requestRestart: () => setRestartToken((token) => token + 1),
  }
}
