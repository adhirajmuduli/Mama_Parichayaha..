/**
 * Journey timeline — pure, framework-free, count-parameterized (new_plan.md
 * §7.3). Ported from the retired `lib/journeyTimeline.ts`, whose unit model
 * and seam math were verified by years of e2e contracts:
 *
 *   - The ring is divided into slots of 50 units: 5 entry | 40 dwell | 5 exit.
 *   - A chapter's dwell center sits at ordinal*50 + 25.
 *   - Transitions occupy the 10-unit seam around each slot boundary.
 *   - Units are unbounded and signed; ordinals map to cyclic indices via
 *     positive modulo, so the journey wraps both directions forever.
 *
 * The ONLY change from the legacy module: every count-dependent function
 * takes `chapterCount` as a parameter. Nothing in this file may import
 * React, Motion, stores, or content.
 */

import type { JourneyDirection, JourneySample, TransitionJourneySample } from './types'

// ---------------------------------------------------------------------------
// Unit geometry constants (count-independent)
// ---------------------------------------------------------------------------

export const ENTRY_UNITS = 5
export const DWELL_UNITS = 40
export const EXIT_UNITS = 5
export const SLOT_UNITS = 50
export const TRANSITION_UNITS = EXIT_UNITS + ENTRY_UNITS

/** Center offset inside a slot: dwell begins at 5 and lasts 40 → center 25. */
export const DWELL_CENTER_OFFSET = ENTRY_UNITS + DWELL_UNITS / 2

// ---------------------------------------------------------------------------
// Magnetic-settling constants (count-independent; consumed by the runtime)
// ---------------------------------------------------------------------------

export const MAGNETIC_VELOCITY_THRESHOLD = 18
export const MAGNETIC_HYSTERESIS_UNITS = 6
export const SETTLE_POSITION_EPSILON = 0.02
export const SETTLE_VELOCITY_EPSILON = 0.02

// ---------------------------------------------------------------------------
// Count-parameterized geometry
// ---------------------------------------------------------------------------

export function cycleUnits(chapterCount: number): number {
  assertValidCount(chapterCount)

  return chapterCount * SLOT_UNITS
}

export function initialUnits(chapterCount: number): number {
  // First chapter's dwell center: 0*50 + 25.
  return DWELL_CENTER_OFFSET
}

export function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

export function smootherstep01(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10)
}

export function assertValidCount(chapterCount: number): void {
  if (!Number.isInteger(chapterCount) || chapterCount < 3 || chapterCount > 12) {
    throw new Error(
      `Journey timeline requires an integer chapter count in [3, 12]; received ${chapterCount}.`,
    )
  }
}

export function getCyclicChapterIndex(ordinal: number, chapterCount: number): number {
  assertValidCount(chapterCount)

  return positiveModulo(ordinal, chapterCount)
}

export function getDwellCenter(ordinal: number): number {
  return ordinal * SLOT_UNITS + DWELL_CENTER_OFFSET
}

export function nearestDwellCenter(units: number): number {
  return Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS) * SLOT_UNITS + DWELL_CENTER_OFFSET
}

/**
 * Absolute (non-cyclic) ordinal that reaches `index` with minimal travel from
 * the current unit position.
 */
export function getNearestOrdinalForIndex(
  units: number,
  index: number,
  chapterCount: number,
): number {
  assertValidCount(chapterCount)

  const base = Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS)
  const forward = base + positiveModulo(index - positiveModulo(base, chapterCount), chapterCount)
  const backward = forward - chapterCount

  return Math.abs(forward - base) <= Math.abs(backward - base) ? forward : backward
}

function nextDwellCenterAbove(units: number): number {
  const candidate = nearestDwellCenter(units)
  return candidate > units ? candidate : candidate + SLOT_UNITS
}

function nextDwellCenterBelow(units: number): number {
  const candidate = nearestDwellCenter(units)
  return candidate < units ? candidate : candidate - SLOT_UNITS
}

/**
 * Continuous chapter position: `ordinal + dwell progress`. Monotonic in
 * `units`, count-independent, used by card/background choreography fades.
 */
export function getIndexFloat(units: number): number {
  return (units - DWELL_CENTER_OFFSET) / SLOT_UNITS
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

/**
 * Decodes a unit position into a dwell or transition sample.
 *
 * Direction shapes which chapter reads as "outgoing" vs "incoming": traveling
 * backward through the same seam swaps their roles, exactly like the legacy
 * implementation.
 */
export function decodeJourney(
  units: number,
  chapterCount: number,
  direction: JourneyDirection,
): JourneySample {
  assertValidCount(chapterCount)

  const cycle = cycleUnits(chapterCount)
  const destinationOrdinal = Math.floor((units + ENTRY_UNITS) / SLOT_UNITS)
  const localUnits = units - destinationOrdinal * SLOT_UNITS
  const loopCount = Math.floor(units / cycle)

  if (localUnits < ENTRY_UNITS) {
    const segmentFromOrdinal = destinationOrdinal - 1
    const segmentToOrdinal = destinationOrdinal
    const canonicalT = (localUnits + EXIT_UNITS) / TRANSITION_UNITS
    const directedT = direction < 0 ? 1 - canonicalT : canonicalT
    const outgoingOrdinal = direction < 0 ? segmentToOrdinal : segmentFromOrdinal
    const incomingOrdinal = direction < 0 ? segmentFromOrdinal : segmentToOrdinal

    return {
      mode: 'transition',
      localUnits,
      loopCount,
      direction,
      segmentFromOrdinal,
      segmentToOrdinal,
      outgoingIndex: getCyclicChapterIndex(outgoingOrdinal, chapterCount),
      incomingIndex: getCyclicChapterIndex(incomingOrdinal, chapterCount),
      routeCanonicalT: canonicalT,
      transitionT: directedT,
      easedTransitionT: smootherstep01(directedT),
    }
  }

  return {
    mode: 'dwell',
    localUnits,
    loopCount,
    direction,
    currentOrdinal: destinationOrdinal,
    currentIndex: getCyclicChapterIndex(destinationOrdinal, chapterCount),
    dwellT: (localUnits - ENTRY_UNITS) / DWELL_UNITS,
  }
}

// ---------------------------------------------------------------------------
// Settling + motion shaping
// ---------------------------------------------------------------------------

/**
 * Magnetic target: the dwell center the spring should settle toward.
 *
 * Fast movement beyond the hysteresis halo commits to the NEXT center in the
 * travel direction; otherwise the nearest center wins. Ties resolve along the
 * last input direction.
 */
export function getMagneticTarget(
  units: number,
  velocity: number,
  lastDirection: JourneyDirection,
  chapterCount: number,
  restUnits?: number,
): number {
  assertValidCount(chapterCount)

  const speed = Math.abs(velocity)
  const restCenter = nearestDwellCenter(restUnits === undefined ? units : restUnits)
  const displacedBeyondHalo = Math.abs(units - restCenter) >= MAGNETIC_HYSTERESIS_UNITS

  if (speed >= MAGNETIC_VELOCITY_THRESHOLD && displacedBeyondHalo) {
    return velocity > 0 ? nextDwellCenterAbove(units) : nextDwellCenterBelow(units)
  }

  const lowerCenter =
    Math.floor((units - DWELL_CENTER_OFFSET) / SLOT_UNITS) * SLOT_UNITS + DWELL_CENTER_OFFSET
  const upperCenter = lowerCenter + SLOT_UNITS
  const lowerDistance = Math.abs(units - lowerCenter)
  const upperDistance = Math.abs(upperCenter - units)

  if (lowerDistance === upperDistance && lastDirection !== 0) {
    return lastDirection > 0 ? upperCenter : lowerCenter
  }

  return nearestDwellCenter(units)
}

/** sin² motion intensity: 0 at dwell, peaking mid-transition. */
export function getTravelPulse(sample: JourneySample): number {
  return sample.mode === 'transition' ? Math.sin(Math.PI * sample.transitionT) ** 2 : 0
}

/** Where a transition sits on the canonical [0, 1) ring (undirected). */
export function getCanonicalRouteT(sample: TransitionJourneySample, chapterCount: number): number {
  assertValidCount(chapterCount)

  return positiveModulo(
    (sample.segmentFromOrdinal + smootherstep01(sample.routeCanonicalT)) / chapterCount,
    1,
  )
}
