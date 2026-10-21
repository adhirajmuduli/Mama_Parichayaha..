import { describe, expect, it } from 'vitest'

import {
  DWELL_CENTER_OFFSET,
  ENTRY_UNITS,
  SLOT_UNITS,
  cycleUnits,
  decodeJourney,
  getCyclicChapterIndex,
  getDwellCenter,
  getIndexFloat,
  getMagneticTarget,
  getNearestOrdinalForIndex,
  getTravelPulse,
  initialUnits,
  nearestDwellCenter,
  positiveModulo,
  smootherstep01,
  TRANSITION_UNITS,
} from '@/journey/timeline'
import {
  assertJourneyDomainForAllCounts,
  assertTimelineInvariants,
  assertTopologyInvariants,
} from '@/journey/invariants'
import { createTopology } from '@/journey/topology'

import { journeyChapterIds } from '@/content/data/journey'

/**
 * Journey domain contract suite (new_plan.md §13 P2).
 *
 * Replaces the stale 5-chapter timeline expectations wholesale: the domain is
 * count-parameterized and swept across every supported N.
 */

const sevenChapterIds = [...journeyChapterIds]

describe('timeline geometry (count-parameterized)', () => {
  it('keeps slot math identical to the verified legacy model', () => {
    expect(SLOT_UNITS).toBe(50)
    expect(TRANSITION_UNITS).toBe(10)
    expect(ENTRY_UNITS).toBe(5)
    expect(DWELL_CENTER_OFFSET).toBe(25)
    expect(initialUnits(7)).toBe(25)
    expect(cycleUnits(7)).toBe(350)
    expect(cycleUnits(3)).toBe(150)
    expect(getDwellCenter(2)).toBe(125)
    expect(nearestDwellCenter(37)).toBe(25)
    expect(nearestDwellCenter(63)).toBe(75)
  })

  it('decodes dwell positions for any count', () => {
    const sample = decodeJourney(25, 7, 1)

    expect(sample.mode).toBe('dwell')
    if (sample.mode === 'dwell') {
      expect(sample.currentIndex).toBe(0)
      // Units 25 is the dwell CENTER: entry ends at 5, dwell spans 5..45.
      expect(sample.dwellT).toBe(0.5)
      expect(sample.loopCount).toBe(0)
    }

    const dwellStart = decodeJourney(5, 7, 1)
    if (dwellStart.mode === 'dwell') {
      expect(dwellStart.dwellT).toBe(0)
    }

    const far = decodeJourney(375, 7, 1)
    if (far.mode === 'dwell') {
      expect(far.currentIndex).toBe(0)
      expect(far.loopCount).toBe(1)
    }
  })

  it('decodes transitions with direction-aware outgoing/incoming', () => {
    const forward = decodeJourney(350, 7, 1)
    expect(forward.mode).toBe('transition')
    if (forward.mode === 'transition') {
      expect(forward.outgoingIndex).toBe(6)
      expect(forward.incomingIndex).toBe(0)
      expect(forward.routeCanonicalT).toBeCloseTo(0.5)
      expect(forward.easedTransitionT).toBeCloseTo(0.5)
    }

    const backward = decodeJourney(350, 7, -1)
    if (backward.mode === 'transition') {
      expect(backward.outgoingIndex).toBe(0)
      expect(backward.incomingIndex).toBe(6)
      expect(backward.transitionT).toBeCloseTo(0.5)
    }
  })

  it('wraps negative and super-cyclic ordinals through positive modulo', () => {
    expect(getCyclicChapterIndex(-1, 7)).toBe(6)
    expect(getCyclicChapterIndex(7, 7)).toBe(0)
    expect(getCyclicChapterIndex(15, 7)).toBe(1)
    expect(positiveModulo(-350, 350)).toBe(0)
  })

  it('rejects invalid chapter counts loudly', () => {
    expect(() => cycleUnits(2)).toThrow()
    expect(() => cycleUnits(13)).toThrow()
    expect(() => cycleUnits(7.5)).toThrow()
    expect(() => decodeJourney(25, 0, 1)).toThrow()
  })
})

describe('magnetic settling', () => {
  it('rests at the nearest dwell center', () => {
    expect(getMagneticTarget(25, 0, 0, 7)).toBe(25)
    expect(getMagneticTarget(40, 0, 0, 7)).toBe(25)
    expect(getMagneticTarget(51, 0, 0, 7)).toBe(75)
  })

  it('commits to the next center when flung past the hysteresis halo', () => {
    expect(getMagneticTarget(40, 20, 1, 7)).toBe(75)
    expect(getMagneticTarget(12, -20, -1, 7)).toBe(-25)
  })

  it('holds a fast traveler inside the halo (hysteresis)', () => {
    expect(getMagneticTarget(29, 40, 1, 7)).toBe(25)
    expect(getMagneticTarget(45, 25, 1, 7, 25)).toBe(75)
  })

  it('breaks ties along the last input direction', () => {
    expect(getMagneticTarget(50, 0, 1, 7)).toBe(75)
    expect(getMagneticTarget(50, 0, -1, 7)).toBe(25)
  })
})

describe('motion shaping', () => {
  it('peaks mid-transition and vanishes at dwell', () => {
    expect(getTravelPulse(decodeJourney(25, 7, 1))).toBe(0)
    expect(getTravelPulse(decodeJourney(350, 7, 1))).toBeCloseTo(1)
    expect(smootherstep01(0.5)).toBeCloseTo(0.5)
  })

  it('maps units to a monotonic continuous chapter position', () => {
    expect(getIndexFloat(25)).toBe(0)
    expect(getIndexFloat(75)).toBe(1)
    expect(getIndexFloat(355)).toBeCloseTo(6.6)
    expect(getIndexFloat(50)).toBeCloseTo(0.5)
  })
})

describe('topology', () => {
  it('resolves ids, adjacency and windows on the canonical seven', () => {
    const topology = createTopology(sevenChapterIds)

    expect(topology.count).toBe(7)
    expect(topology.indexById('contact')).toBe(6)
    expect(topology.idByIndex(0)).toBe('origins')
    expect(topology.idByIndex(6)).toBe('contact')

    expect(topology.adjacentIndices(0)).toEqual([6, 1])
    expect(topology.cyclicDistance(0, 6)).toBe(1)
    expect(topology.cyclicDistance(0, 3)).toBe(3)

    expect(topology.windowIndices(0, 1)).toEqual([0, 1, 6])
    expect(topology.windowIndices(6, 1)).toEqual([6, 0, 5])

    expect(() => topology.indexForIdOrThrow('missing')).toThrow()
    expect(topology.indexForIdOrThrow('research')).toBe(2)
  })

  it('computes cyclic distance correctly across the seam', () => {
    const topology = createTopology(sevenChapterIds)

    expect(topology.cyclicDistance(6, 0)).toBe(1)
    expect(topology.cyclicDistance(3, 5)).toBe(2)
    expect(topology.cyclicDistance(2, 2)).toBe(0)
  })

  it('builds duplicate-free windows on small rings', () => {
    const threeRing = createTopology(['a', 'b', 'c'])

    expect(threeRing.windowIndices(0, 1)).toEqual([0, 1, 2])
    expect(new Set(threeRing.windowIndices(0, 2)).size).toBe(3)

    const fourRing = createTopology(['a', 'b', 'c', 'd'])
    expect(new Set(fourRing.windowIndices(0, 2)).size).toBe(4)
  })

  it('rejects malformed topologies', () => {
    expect(() => createTopology(['a', 'b'])).toThrow()
    expect(() => createTopology(['a', 'a', 'b'])).toThrow()
    expect(() => createTopology(['a', 'b', ''])).toThrow()
  })
})

describe('invariant sweeps', () => {
  it('holds every seam guarantee for the canonical seven', () => {
    expect(() => assertTimelineInvariants(7)).not.toThrow()
  })

  it('sweeps the entire domain for N = 3..12 (timeline + topology)', () => {
    expect(() => assertJourneyDomainForAllCounts()).not.toThrow()
  })

  it('validates the authored topology', () => {
    expect(() => assertTopologyInvariants(createTopology(sevenChapterIds))).not.toThrow()
  })

  it('reaches the nearest ordinal for navigation targets', () => {
    expect(getNearestOrdinalForIndex(25, 3, 7)).toBe(3)
    expect(getNearestOrdinalForIndex(25, 6, 7)).toBe(-1)
    expect(getNearestOrdinalForIndex(25, 0, 7)).toBe(0)
  })
})
