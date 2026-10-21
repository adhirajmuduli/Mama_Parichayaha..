/**
 * Journey domain invariants (new_plan.md §7.3).
 *
 * The retired timeline module self-asserted a fixed 7-chapter seam; this port
 * parameterizes the sweep so the same guarantees hold for any chapter count
 * (tests exercise N = 3..12; the runtime provider runs the real N in dev).
 *
 * Called from tests and once at boot in development — never on hot paths.
 */

import {
  cycleUnits,
  decodeJourney,
  getCyclicChapterIndex,
  getDwellCenter,
  getMagneticTarget,
  getNearestOrdinalForIndex,
  getTravelPulse,
  initialUnits,
  nearestDwellCenter,
  smootherstep01,
  SLOT_UNITS,
  TRANSITION_UNITS,
  DWELL_CENTER_OFFSET,
  DWELL_UNITS,
  ENTRY_UNITS,
} from './timeline'
import { createTopology, type JourneyTopology } from './topology'
import type { JourneySample } from './types'

function expectClose(actual: number, expected: number, epsilon: number, label: string): void {
  if (!(Math.abs(actual - expected) <= epsilon)) {
    throw new Error(`Journey invariant failed (${label}): ${actual} != ${expected}.`)
  }
}

function expectTransition(
  sample: JourneySample,
  label: string,
): asserts sample is Extract<JourneySample, { mode: 'transition' }> {
  if (sample.mode !== 'transition') {
    throw new Error(`Journey invariant failed (${label}): expected a transition sample.`)
  }
}

function expectDwell(
  sample: JourneySample,
  label: string,
): asserts sample is Extract<JourneySample, { mode: 'dwell' }> {
  if (sample.mode !== 'dwell') {
    throw new Error(`Journey invariant failed (${label}): expected a dwell sample.`)
  }
}

function expectSameCyclicPhase(a: JourneySample, b: JourneySample, label: string): void {
  if (a.mode !== b.mode) {
    throw new Error(`Journey invariant failed (${label}): mode mismatch.`)
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

/**
 * Full seam sweep for a specific chapter count. Every position is derived from
 * the count — no literal seam values survive from the 7-chapter era.
 */
export function assertTimelineInvariants(chapterCount: number): void {
  const cycle = cycleUnits(chapterCount)

  // The seam crossing ordinal (count-1 → count ≡ index 0) spans
  // [cycle - EXIT, cycle + ENTRY] in unit space.
  const seamStart = cycle - TRANSITION_UNITS + ENTRY_UNITS // cycle - 5
  const seamMidpoint = cycle
  const seamArrival = cycle + ENTRY_UNITS
  const seamPreDwell = cycle - ENTRY_UNITS - 0.01
  const seamPostDwell = cycle + ENTRY_UNITS + 0.01

  // --- Forward seam -------------------------------------------------------
  const forward = decodeJourney(seamStart, chapterCount, 1)
  expectTransition(forward, 'seam-start')
  expectClose(forward.segmentFromOrdinal, chapterCount - 1, 0, 'seam-from')
  expectClose(forward.segmentToOrdinal, chapterCount, 0, 'seam-to')
  expectClose(forward.routeCanonicalT, 0, 1e-9, 'seam-start-t')

  const midpoint = decodeJourney(seamMidpoint, chapterCount, 1)
  expectTransition(midpoint, 'seam-midpoint')
  expectClose(midpoint.routeCanonicalT, 0.5, 1e-9, 'seam-midpoint-t')
  expectClose(midpoint.easedTransitionT, 0.5, 1e-9, 'seam-eased')

  const arrived = decodeJourney(seamArrival, chapterCount, 1)
  expectDwell(arrived, 'seam-arrival')
  expectClose(arrived.currentOrdinal, chapterCount, 0, 'seam-arrival-ordinal')
  expectClose(arrived.currentIndex, 0, 0, 'seam-arrival-index')
  expectClose(arrived.loopCount, 1, 0, 'seam-loop')
  expectClose(arrived.dwellT, 0, 1e-9, 'seam-dwell-start')

  const preSeam = decodeJourney(seamPreDwell, chapterCount, 1)
  expectDwell(preSeam, 'pre-seam-dwell')
  expectClose(preSeam.currentOrdinal, chapterCount - 1, 0, 'pre-seam-ordinal')
  expectClose(preSeam.dwellT, (DWELL_UNITS - 0.01) / DWELL_UNITS, 1e-9, 'pre-seam-dwellT')

  const postSeam = decodeJourney(seamPostDwell, chapterCount, 1)
  expectDwell(postSeam, 'post-seam-dwell')
  expectClose(postSeam.currentOrdinal, chapterCount, 0, 'post-seam-ordinal')

  // --- Reverse seam (crossing zero downward) ------------------------------
  const backwardStart = decodeJourney(-ENTRY_UNITS, chapterCount, -1)
  expectTransition(backwardStart, 'backward-start')
  expectClose(backwardStart.segmentFromOrdinal, -1, 0, 'backward-from')
  expectClose(backwardStart.segmentToOrdinal, 0, 0, 'backward-to')
  expectClose(backwardStart.outgoingIndex, 0, 0, 'backward-outgoing')
  expectClose(backwardStart.incomingIndex, chapterCount - 1, 0, 'backward-incoming')

  const backwardDwell = decodeJourney(-(SLOT_UNITS - ENTRY_UNITS), chapterCount, -1)
  expectDwell(backwardDwell, 'backward-dwell')
  expectClose(backwardDwell.currentIndex, chapterCount - 1, 0, 'backward-dwell-index')
  expectClose(backwardDwell.loopCount, -1, 0, 'backward-loop')

  // --- Cyclic phase repetition --------------------------------------------
  const anchor = initialUnits(chapterCount)

  expectSameCyclicPhase(
    decodeJourney(anchor, chapterCount, 1),
    decodeJourney(anchor + cycle, chapterCount, 1),
    'phase-plus-dwell',
  )
  expectSameCyclicPhase(
    decodeJourney(seamMidpoint, chapterCount, 1),
    decodeJourney(seamMidpoint + cycle, chapterCount, 1),
    'phase-plus-transition',
  )
  expectSameCyclicPhase(
    decodeJourney(anchor, chapterCount, 1),
    decodeJourney(anchor - cycle, chapterCount, -1),
    'phase-minus-dwell',
  )

  expectClose(decodeJourney(anchor, chapterCount, 1).loopCount, 0, 0, 'loop-base')
  expectClose(decodeJourney(anchor + cycle, chapterCount, 1).loopCount, 1, 0, 'loop-plus')
  expectClose(decodeJourney(anchor - cycle, chapterCount, -1).loopCount, -1, 0, 'loop-minus')

  // --- Geometry helpers ----------------------------------------------------
  expectClose(getDwellCenter(0), DWELL_CENTER_OFFSET, 0, 'dwell-center-0')
  expectClose(nearestDwellCenter(cycle + 1), cycle + DWELL_CENTER_OFFSET, 0, 'nearest-seam')
  expectClose(
    getNearestOrdinalForIndex(DWELL_CENTER_OFFSET, 0, chapterCount),
    0,
    0,
    'nearest-ordinal-self',
  )
  expectClose(
    getNearestOrdinalForIndex(DWELL_CENTER_OFFSET, chapterCount - 1, chapterCount),
    -1,
    0,
    'nearest-ordinal-backward',
  )
  expectClose(getCyclicChapterIndex(-1, chapterCount), chapterCount - 1, 0, 'cyclic-negative')
  expectClose(getCyclicChapterIndex(chapterCount, chapterCount), 0, 0, 'cyclic-wrap')

  // --- Motion shaping ------------------------------------------------------
  expectClose(smootherstep01(0), 0, 0, 'smootherstep-start')
  expectClose(smootherstep01(1), 1, 0, 'smootherstep-end')
  expectClose(smootherstep01(0.5), 0.5, 1e-9, 'smootherstep-midpoint')
  expectClose(
    smootherstep01(0.5 + 1e-6) - smootherstep01(0.5),
    smootherstep01(0.5) - smootherstep01(0.5 - 1e-6),
    1e-9,
    'smootherstep-symmetry',
  )

  expectClose(getTravelPulse(decodeJourney(anchor, chapterCount, 1)), 0, 0, 'pulse-dwell')
  const pulse = getTravelPulse(decodeJourney(seamMidpoint, chapterCount, 1))
  expectClose(pulse, 1, 1e-9, 'pulse-peak')

  // --- Magnetic table (count-independent; centers at 25 / 75 / -25) --------
  expectClose(getMagneticTarget(25, 0, 0, chapterCount), 25, 0, 'magnetic-rest')
  expectClose(getMagneticTarget(40, 0, 0, chapterCount), 25, 0, 'magnetic-nearest-behind')
  expectClose(getMagneticTarget(51, 0, 0, chapterCount), 75, 0, 'magnetic-nearest-ahead')
  expectClose(getMagneticTarget(40, 20, 1, chapterCount), 75, 0, 'magnetic-fast-forward')
  expectClose(getMagneticTarget(12, -20, -1, chapterCount), -25, 0, 'magnetic-fast-backward')
  expectClose(getMagneticTarget(29, 40, 1, chapterCount), 25, 0, 'magnetic-hysteresis-hold')
  expectClose(getMagneticTarget(45, 25, 1, chapterCount, 25), 75, 0, 'magnetic-hysteresis-release')
}

export function assertTopologyInvariants(topology: JourneyTopology): void {
  if (topology.count !== topology.chapterIds.length) {
    throw new Error('Topology count diverged from its id list.')
  }

  topology.chapterIds.forEach((id, index) => {
    if (topology.idByIndex(index) !== id)
      throw new Error(`Topology idByIndex diverged at ${index}.`)
    if (topology.indexById(id) !== index) throw new Error(`Topology indexById diverged for ${id}.`)

    const [previous, next] = topology.adjacentIndices(index)
    if (previous === next) throw new Error(`Topology adjacency collapsed at ${index}.`)
    if (topology.cyclicDistance(previous, next) !== (topology.count === 3 ? 1 : 2)) {
      // For count 3 the two neighbors are themselves adjacent (distance 1);
      // for any larger ring they sit two steps apart.
      throw new Error(`Topology neighbor distance is wrong at ${index}.`)
    }
  })

  const window = topology.windowIndices(0, 1)
  if (window.length !== Math.min(3, topology.count) || window[0] !== 0) {
    throw new Error('Topology radius-1 window must be [self, next, previous].')
  }

  const wideWindow = new Set(topology.windowIndices(0, 2))
  if (wideWindow.size > Math.min(5, topology.count)) {
    throw new Error('Topology windows must not contain duplicates.')
  }
}

/** Sweeps every supported chapter count — used by the unit suite. */
export function assertJourneyDomainForAllCounts(): void {
  const ids = (count: number) => Array.from({ length: count }, (_, index) => `chapter-${index}`)

  for (let count = 3; count <= 12; count += 1) {
    assertTimelineInvariants(count)
    assertTopologyInvariants(createTopology(ids(count)))
  }
}
