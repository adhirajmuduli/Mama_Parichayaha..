'use client'

/**
 * Quality tiers + governor (new_plan.md §7.4).
 *
 * Tiers alter ONLY presentation budgets — the ASCII player's fps cap and the
 * optional dust particle count. They never change component identity, layout
 * or data (the tier-coupling regressions of the retired sceneRuntime are a
 * documented anti-pattern now).
 *
 * The governor passively observes scheduler frame deltas (it never keeps the
 * loop alive — sampling only happens while something genuinely animates) and
 * moves between tiers with deliberate asymmetry: downgrades are fast and
 * evidence-based, upgrades are slow and conservative.
 *
 * `static` mode (fpsCap 0) is not a tier: reduced motion / user pause is a
 * capability concern handled by the player, not a quality degradation.
 */

import { useSyncExternalStore } from 'react'

import { observeFrameDelta } from './scheduler'
import type { CapabilitySnapshot } from './capabilities'

export type QualityTier = 'low' | 'medium' | 'high'

export interface QualityProfile {
  tier: QualityTier
  /** ASCII playback rate cap (frames/sec). */
  fpsCap: number
  /** Background dust particle count (0 = off). */
  dust: number
}

export const QUALITY_TIERS: Record<QualityTier, QualityProfile> = Object.freeze({
  low: Object.freeze({ tier: 'low', fpsCap: 12, dust: 0 }),
  medium: Object.freeze({ tier: 'medium', fpsCap: 18, dust: 24 }),
  high: Object.freeze({ tier: 'high', fpsCap: 24, dust: 48 }),
})

// Governor tuning (new_plan.md §7.4): 45+ slow frames within a 120-frame
// window triggers a downgrade after a 600-frame cooldown; upgrades need 900
// consecutive fast frames.
const SLOW_FRAME_THRESHOLD_MS = 33.4
const FAST_FRAME_THRESHOLD_MS = 20.9
const SAMPLE_WINDOW = 120
const DOWNGRADE_SLOW_FRAMES = 45
const DOWNGRADE_COOLDOWN_FRAMES = 600
const UPGRADE_FAST_FRAMES = 900

const TIER_ORDER: QualityTier[] = ['low', 'medium', 'high']

function tierBelow(tier: QualityTier): QualityTier | null {
  const index = TIER_ORDER.indexOf(tier)
  return index > 0 ? (TIER_ORDER[index - 1] as QualityTier) : null
}

function tierAbove(tier: QualityTier): QualityTier | null {
  const index = TIER_ORDER.indexOf(tier)
  return index < TIER_ORDER.length - 1 ? (TIER_ORDER[index + 1] as QualityTier) : null
}

export function initialTier(capabilities: CapabilitySnapshot): QualityTier {
  if (capabilities.coarsePointer || capabilities.saveData || capabilities.deviceMemory < 4) {
    return 'low'
  }

  return 'high'
}

interface GovernorState {
  profile: QualityProfile
  ceiling: QualityTier
  ewmaDeltaMs: number
  slowFrameStreak: number
  windowSlowFrames: number
  windowFramesSeen: number
  fastFrameStreak: number
  framesSinceChange: number
  attached: boolean
}

const listeners = new Set<() => void>()

const governor: GovernorState = {
  profile: QUALITY_TIERS.high,
  ceiling: 'high',
  ewmaDeltaMs: 16.7,
  slowFrameStreak: 0,
  windowSlowFrames: 0,
  windowFramesSeen: 0,
  fastFrameStreak: 0,
  framesSinceChange: Number.MAX_SAFE_INTEGER,
  attached: false,
}

function notify(): void {
  for (const listener of listeners) listener()
}

function setTier(tier: QualityTier): void {
  if (governor.profile.tier === tier) return

  governor.profile = QUALITY_TIERS[tier]
  governor.framesSinceChange = 0
  governor.slowFrameStreak = 0
  governor.fastFrameStreak = 0
  notify()
}

function observeFrame(deltaMs: number): void {
  // A single > 250ms frame is a task stall (GC, tab jank), not evidence about
  // sustained rendering cost; skip it so budgets reflect steady state.
  if (deltaMs > 250 || deltaMs === 0) return

  governor.ewmaDeltaMs = governor.ewmaDeltaMs * 0.9 + deltaMs * 0.1
  governor.framesSinceChange += 1

  if (deltaMs > SLOW_FRAME_THRESHOLD_MS) {
    governor.slowFrameStreak += 1
    governor.fastFrameStreak = 0
    governor.windowSlowFrames += 1
  } else if (deltaMs < FAST_FRAME_THRESHOLD_MS) {
    governor.fastFrameStreak += 1
  } else {
    governor.fastFrameStreak = 0
  }

  governor.windowFramesSeen += 1

  if (governor.windowFramesSeen >= SAMPLE_WINDOW) {
    const slowRatio = governor.windowSlowFrames / governor.windowFramesSeen
    governor.windowFramesSeen = 0
    governor.windowSlowFrames = 0

    if (slowRatio > 0.2 && governor.slowFrameStreak >= 5) {
      const below = tierBelow(governor.profile.tier)
      if (below && governor.framesSinceChange >= DOWNGRADE_COOLDOWN_FRAMES / SAMPLE_WINDOW) {
        setTier(below)
        return
      }
    }
  }

  if (
    governor.fastFrameStreak >= UPGRADE_FAST_FRAMES &&
    governor.ewmaDeltaMs < FAST_FRAME_THRESHOLD_MS &&
    governor.framesSinceChange >= DOWNGRADE_COOLDOWN_FRAMES
  ) {
    const above = tierAbove(governor.profile.tier)

    if (above && TIER_ORDER.indexOf(above) <= TIER_ORDER.indexOf(governor.ceiling)) {
      setTier(above)
    }
  }
}

function ensureAttached(): void {
  if (governor.attached) return

  governor.attached = true
  observeFrameDelta(observeFrame)
}

/** Runs the governor against measured capabilities (client, once). */
export function primeQualityFromCapabilities(capabilities: CapabilitySnapshot): void {
  const tier = initialTier(capabilities)

  governor.ceiling = tier
  governor.profile = QUALITY_TIERS[tier]
  notify()
  ensureAttached()
}

export function getQualityProfile(): QualityProfile {
  return governor.profile
}

export function subscribeQuality(listener: () => void): () => void {
  ensureAttached()
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function useQualityProfile(): QualityProfile {
  return useSyncExternalStore(subscribeQuality, getQualityProfile, () => QUALITY_TIERS.high)
}
