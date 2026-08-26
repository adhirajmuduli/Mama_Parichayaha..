export const CHAPTER_COUNT = 5
export const ENTRY_UNITS = 5
export const DWELL_UNITS = 40
export const EXIT_UNITS = 5
export const SLOT_UNITS = 50
export const TRANSITION_UNITS = EXIT_UNITS + ENTRY_UNITS
export const CYCLE_UNITS = CHAPTER_COUNT * SLOT_UNITS
export const INITIAL_UNITS = ENTRY_UNITS + DWELL_UNITS / 2

export const DWELL_CENTER_OFFSET = ENTRY_UNITS + DWELL_UNITS / 2
export const MAGNETIC_VELOCITY_THRESHOLD = 18
export const MAGNETIC_HYSTERESIS_UNITS = 6
export const SETTLE_POSITION_EPSILON = 0.02
export const SETTLE_VELOCITY_EPSILON = 0.02

export type JourneyDirection = -1 | 0 | 1
export type TravelMode = 'dwell' | 'transition'

interface JourneyCommon {
  localUnits: number
  loopCount: number
  direction: JourneyDirection
}

export interface DwellJourneySample extends JourneyCommon {
  mode: 'dwell'
  currentOrdinal: number
  currentIndex: number
  dwellT: number
}

export interface TransitionJourneySample extends JourneyCommon {
  mode: 'transition'
  segmentFromOrdinal: number
  segmentToOrdinal: number
  outgoingIndex: number
  incomingIndex: number
  routeCanonicalT: number
  transitionT: number
  easedTransitionT: number
}

export type JourneySample = DwellJourneySample | TransitionJourneySample

export function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

export function smootherstep01(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10)
}

export function getCyclicChapterIndex(ordinal: number): number {
  return positiveModulo(ordinal, CHAPTER_COUNT)
}

export function getDwellCenter(ordinal: number): number {
  return ordinal * SLOT_UNITS + DWELL_CENTER_OFFSET
}

export function getNearestOrdinalForIndex(units: number, index: number): number {
  const base = Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS)
  const forward = base + positiveModulo(index - positiveModulo(base, CHAPTER_COUNT), CHAPTER_COUNT)
  const backward = forward - CHAPTER_COUNT

  return Math.abs(forward - base) <= Math.abs(backward - base) ? forward : backward
}

function nearestDwellCenter(units: number): number {
  return Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS) * SLOT_UNITS + DWELL_CENTER_OFFSET
}

function nextDwellCenterAbove(units: number): number {
  const candidate = nearestDwellCenter(units)
  return candidate > units ? candidate : candidate + SLOT_UNITS
}

function nextDwellCenterBelow(units: number): number {
  const candidate = nearestDwellCenter(units)
  return candidate < units ? candidate : candidate - SLOT_UNITS
}

export function decodeJourney(units: number, direction: JourneyDirection): JourneySample {
  const destinationOrdinal = Math.floor((units + ENTRY_UNITS) / SLOT_UNITS)
  const localUnits = units - destinationOrdinal * SLOT_UNITS
  const loopCount = Math.floor(units / CYCLE_UNITS)

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
      outgoingIndex: getCyclicChapterIndex(outgoingOrdinal),
      incomingIndex: getCyclicChapterIndex(incomingOrdinal),
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
    currentIndex: getCyclicChapterIndex(destinationOrdinal),
    dwellT: (localUnits - ENTRY_UNITS) / DWELL_UNITS,
  }
}

export function getMagneticTarget(
  units: number,
  velocity: number,
  lastDirection: JourneyDirection,
  restUnits = nearestDwellCenter(units),
): number {
  const speed = Math.abs(velocity)
  const restCenter = nearestDwellCenter(restUnits)
  const displacedBeyondHalo = Math.abs(units - restCenter) >= MAGNETIC_HYSTERESIS_UNITS

  if (speed >= MAGNETIC_VELOCITY_THRESHOLD && displacedBeyondHalo) {
    return velocity > 0 ? nextDwellCenterAbove(units) : nextDwellCenterBelow(units)
  }

  void lastDirection
  return nearestDwellCenter(units)
}

export function getTravelPulse(sample: JourneySample): number {
  return sample.mode === 'transition' ? Math.sin(Math.PI * sample.transitionT) ** 2 : 0
}

export function getCanonicalRouteT(sample: TransitionJourneySample): number {
  return positiveModulo(
    (sample.segmentFromOrdinal + smootherstep01(sample.routeCanonicalT)) / CHAPTER_COUNT,
    1,
  )
}

function expectClose(actual: number, expected: number, epsilon: number, label: string): void {
  if (!(Math.abs(actual - expected) <= epsilon)) {
    throw new Error(`Journey timeline invariant failed (${label}): ${actual} != ${expected}.`)
  }
}

function expectSameCyclicPhase(a: JourneySample, b: JourneySample, label: string): void {
  if (a.mode !== b.mode) {
    throw new Error(`Journey timeline invariant failed (${label}): mode mismatch.`)
  }

  if (a.mode === 'dwell' && b.mode === 'dwell') {
    expectClose(a.currentIndex, b.currentIndex, 0, `${label}-index`)
    expectClose(a.dwellT, b.dwellT, 1e-9, `${label}-dwellT`)
    return
  }

  if (a.mode === 'transition' && b.mode === 'transition') {
    expectClose(a.outgoingIndex, b.outgoingIndex, 0, `${label}-outgoing`)
    expectClose(a.incomingIndex, b.incomingIndex, 0, `${label}-incoming`)
    expectClose(a.routeCanonicalT, b.routeCanonicalT, 1e-9, `${label}-routeT`)
  }
}

export function assertJourneyTimelineInvariants(): void {
  const forward = decodeJourney(245, 1)

  if (forward.mode !== 'transition') {
    throw new Error('Journey timeline invariant failed: 245 must decode as a transition.')
  }

  expectClose(forward.segmentFromOrdinal, 4, 0, 'seam-from')
  expectClose(forward.segmentToOrdinal, 5, 0, 'seam-to')
  expectClose(forward.routeCanonicalT, 0, 1e-9, 'seam-start')

  const midpoint = decodeJourney(250, 1)

  if (midpoint.mode !== 'transition') {
    throw new Error('Journey timeline invariant failed: 250 must decode as a transition.')
  }

  expectClose(midpoint.routeCanonicalT, 0.5, 1e-9, 'seam-midpoint')
  expectClose(midpoint.easedTransitionT, 0.5, 1e-9, 'seam-eased')

  const arrived = decodeJourney(255, 1)

  if (arrived.mode !== 'dwell' || arrived.currentOrdinal !== 5 || arrived.currentIndex !== 0) {
    throw new Error('Journey timeline invariant failed: 255 must dwell Origins on loop 1.')
  }

  expectClose(arrived.loopCount, 1, 0, 'seam-loop')
  expectClose(arrived.dwellT, 0, 1e-9, 'seam-dwell-start')

  const preSeam = decodeJourney(244.99, 1)

  if (preSeam.mode !== 'dwell' || preSeam.currentOrdinal !== 4) {
    throw new Error('Journey timeline invariant failed: 244.99 must dwell Future.')
  }

  expectClose(preSeam.dwellT, 39.99 / 40, 1e-9, 'pre-seam-dwellT')

  const postSeam = decodeJourney(255.01, 1)

  if (postSeam.mode !== 'dwell' || postSeam.currentOrdinal !== 5) {
    throw new Error('Journey timeline invariant failed: 255.01 must dwell Origins.')
  }

  const backwardStart = decodeJourney(-5, -1)

  if (
    backwardStart.mode !== 'transition' ||
    backwardStart.segmentFromOrdinal !== -1 ||
    backwardStart.segmentToOrdinal !== 0 ||
    backwardStart.outgoingIndex !== 0 ||
    backwardStart.incomingIndex !== 4
  ) {
    throw new Error('Journey timeline invariant failed: -5 must reverse from Origins to Future.')
  }

  const backwardDwell = decodeJourney(-45, -1)

  if (backwardDwell.mode !== 'dwell' || backwardDwell.currentIndex !== 4) {
    throw new Error('Journey timeline invariant failed: -45 must dwell Future below zero.')
  }

  expectSameCyclicPhase(decodeJourney(25, 1), decodeJourney(275, 1), '+250-dwell')
  expectSameCyclicPhase(decodeJourney(250, 1), decodeJourney(500, 1), '+250-transition')
  expectSameCyclicPhase(decodeJourney(25, 1), decodeJourney(-225, -1), '-250-dwell')

  expectClose(decodeJourney(25, 1).loopCount, 0, 0, 'loop-base')
  expectClose(decodeJourney(275, 1).loopCount, 1, 0, 'loop-plus')
  expectClose(decodeJourney(-225, -1).loopCount, -1, 0, 'loop-minus')

  expectClose(smootherstep01(0), 0, 0, 'smootherstep-start')
  expectClose(smootherstep01(1), 1, 0, 'smootherstep-end')
  expectClose(smootherstep01(0.5), 0.5, 1e-9, 'smootherstep-midpoint')
  expectClose(
    smootherstep01(0.5 + 1e-6) - smootherstep01(0.5),
    smootherstep01(0.5) - smootherstep01(0.5 - 1e-6),
    1e-9,
    'smootherstep-symmetry',
  )

  expectClose(getMagneticTarget(25, 0, 0), 25, 0, 'magnetic-rest')
  expectClose(getMagneticTarget(40, 0, 0), 25, 0, 'magnetic-nearest-behind')
  expectClose(getMagneticTarget(51, 0, 0), 75, 0, 'magnetic-nearest-ahead')
  expectClose(getMagneticTarget(40, 20, 1), 75, 0, 'magnetic-fast-forward')
  expectClose(getMagneticTarget(12, -20, -1), -25, 0, 'magnetic-fast-backward')
  expectClose(getMagneticTarget(29, 40, 1), 25, 0, 'magnetic-hysteresis-hold')
  expectClose(getMagneticTarget(45, 25, 1, 25), 75, 0, 'magnetic-hysteresis-release')
}

if (process.env.NODE_ENV !== 'production') {
  assertJourneyTimelineInvariants()
}
