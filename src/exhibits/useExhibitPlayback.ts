'use client'

/**
 * Exhibit playback gating (new_plan.md §10.4, P11) — derives per-exhibit
 * playback from capability, quality, focus and visibility inputs and
 * publishes discrete state to the exhibits store.
 *
 * P11 simplification: with the user controls removed as redundant,
 * playback is automatic:
 *   static — no animation possible (reduced motion, fpsCap 0, unanimated
 *            source, save-data, or the feature flag off);
 *   playing — chapter visible + animatable;
 *   idle — chapter outside the visible window.
 */

import { useEffect, useState } from 'react'

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
  playback: 'idle' | 'playing' | 'static'
}

export function useExhibitPlayback({
  exhibitId,
  active,
  animated,
}: ExhibitPlaybackInputs): ExhibitPlaybackState {
  const capabilities = useCapabilities()
  const quality = useQualityProfile()
  const [documentHidden, setDocumentHidden] = useState(false)
  const applyPlayback = useExhibitsStore((state) => state.applyPlayback)

  // Track tab visibility locally; the scheduler already stops, but playback
  // state must reflect suspension too (diagnostics read it).
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
    !capabilities.saveData &&
    !documentHidden

  const playback: ExhibitPlaybackState['playback'] = !active
    ? 'idle'
    : canAnimate
      ? 'playing'
      : 'static'

  // Publish discrete changes once (the store dedupes identical writes).
  useEffect(() => {
    applyPlayback(exhibitId, playback)
  }, [applyPlayback, exhibitId, playback])

  return { playback }
}
