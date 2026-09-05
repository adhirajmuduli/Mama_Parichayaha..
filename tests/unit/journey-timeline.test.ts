import { describe, expect, it } from 'vitest'

import {
  CHAPTER_COUNT,
  CYCLE_UNITS,
  DWELL_UNITS,
  ENTRY_UNITS,
  EXIT_UNITS,
  INITIAL_UNITS,
  SLOT_UNITS,
  TRANSITION_UNITS,
  assertJourneyTimelineInvariants,
  decodeJourney,
  getCanonicalRouteT,
  getCyclicChapterIndex,
  getDwellCenter,
  getMagneticTarget,
  getTravelPulse,
  positiveModulo,
  smootherstep01,
  type TransitionJourneySample,
} from '@/lib/journeyTimeline'

describe('journey timeline constants', () => {
  it('exposes the exact cyclic timeline values', () => {
    expect(CHAPTER_COUNT).toBe(5)
    expect(ENTRY_UNITS).toBe(5)
    expect(DWELL_UNITS).toBe(40)
    expect(EXIT_UNITS).toBe(5)
    expect(SLOT_UNITS).toBe(50)
    expect(TRANSITION_UNITS).toBe(10)
    expect(CYCLE_UNITS).toBe(250)
    expect(INITIAL_UNITS).toBe(25)
  })
})

describe('positiveModulo', () => {
  it('wraps negative values into the positive domain', () => {
    expect(positiveModulo(-1, 5)).toBe(4)
    expect(positiveModulo(-6, 5)).toBe(4)
    expect(positiveModulo(-5, 5)).toBe(0)
    expect(positiveModulo(7, 5)).toBe(2)
    expect(positiveModulo(0, 5)).toBe(0)
  })
})

describe('smootherstep01', () => {
  it('has zero velocity at both ends and passes through the midpoint', () => {
    expect(smootherstep01(0)).toBe(0)
    expect(smootherstep01(1)).toBe(1)
    expect(smootherstep01(0.5)).toBeCloseTo(0.5, 12)

    const lowerDerivative = smootherstep01(0.02) - smootherstep01(0)
    const upperDerivative = smootherstep01(1) - smootherstep01(0.98)
    const middleDerivative = smootherstep01(0.51) - smootherstep01(0.5)

    expect(lowerDerivative).toBeLessThan(middleDerivative / 10)
    expect(upperDerivative).toBeLessThan(middleDerivative / 10)
  })

  it('clamps out-of-range input', () => {
    expect(smootherstep01(-2)).toBe(0)
    expect(smootherstep01(3)).toBe(1)
  })
})

describe('getCyclicChapterIndex', () => {
  it('maps unwrapped ordinals onto the five canonical chapters', () => {
    expect(getCyclicChapterIndex(0)).toBe(0)
    expect(getCyclicChapterIndex(4)).toBe(4)
    expect(getCyclicChapterIndex(5)).toBe(0)
    expect(getCyclicChapterIndex(-1)).toBe(4)
    expect(getCyclicChapterIndex(-5)).toBe(0)
  })
})

describe('getDwellCenter', () => {
  it('places rest points at ordinal*50 + 25', () => {
    expect(getDwellCenter(0)).toBe(25)
    expect(getDwellCenter(4)).toBe(225)
    expect(getDwellCenter(5)).toBe(275)
    expect(getDwellCenter(-1)).toBe(-25)
  })
})

describe('decodeJourney', () => {
  it('decodes the Origins dwell center at INITIAL_UNITS', () => {
    const sample = decodeJourney(25, 1)

    assertDwell(sample, {
      currentIndex: 0,
      currentOrdinal: 0,
      dwellT: 0.5,
      loopCount: 0,
      localUnits: 25,
    })
  })

  it('decodes the exact seam samples across Future to Origins', () => {
    const preSeam = decodeJourney(244.99, 1)

    assertDwell(preSeam, {
      currentIndex: 4,
      currentOrdinal: 4,
      dwellT: 39.99 / 40,
      loopCount: 0,
      localUnits: 44.99,
    })

    const seamStart = decodeJourney(245, 1)

    assertTransition(seamStart, {
      easedTransitionT: 0,
      incomingIndex: 0,
      outgoingIndex: 4,
      routeCanonicalT: 0,
      segmentFromOrdinal: 4,
      segmentToOrdinal: 5,
      transitionT: 0,
    })

    const midpoint = decodeJourney(250, 1)

    assertTransition(midpoint, {
      easedTransitionT: 0.5,
      incomingIndex: 0,
      outgoingIndex: 4,
      routeCanonicalT: 0.5,
      transitionT: 0.5,
    })

    const arrival = decodeJourney(255, 1)

    assertDwell(arrival, {
      currentIndex: 0,
      currentOrdinal: 5,
      dwellT: 0,
      loopCount: 1,
      localUnits: 5,
    })

    const postSeam = decodeJourney(255.01, 1)

    assertDwell(postSeam, {
      currentIndex: 0,
      currentOrdinal: 5,
      dwellT: 0.01 / 40,
      loopCount: 1,
      localUnits: 5.01,
    })
  })

  it('decodes reverse travel across the seam with mirrored direction fields', () => {
    const reverse = decodeJourney(245, -1)

    assertTransition(reverse, {
      easedTransitionT: 1,
      incomingIndex: 4,
      outgoingIndex: 0,
      routeCanonicalT: 0,
      transitionT: 1,
    })

    const reverseMidpoint = decodeJourney(250, -1)

    assertTransition(reverseMidpoint, {
      easedTransitionT: 0.5,
      incomingIndex: 4,
      outgoingIndex: 0,
      routeCanonicalT: 0.5,
      transitionT: 0.5,
    })

    const reverseEnd = decodeJourney(254.99, -1)

    assertTransition(reverseEnd, {
      easedTransitionT: 0,
      incomingIndex: 4,
      outgoingIndex: 0,
      routeCanonicalT: 0.999,
      transitionT: 0.001,
    })

    if (reverseEnd.mode !== 'transition') {
      throw new Error('254.99 must transition')
    }

    expect(reverseEnd.easedTransitionT).toBeLessThan(1e-6)

    const belowZero = decodeJourney(-5, -1)

    assertTransition(belowZero, {
      easedTransitionT: 1,
      incomingIndex: 4,
      outgoingIndex: 0,
      routeCanonicalT: 0,
      transitionT: 1,
    })

    if (belowZero.mode !== 'transition') {
      throw new Error('-5 must transition')
    }

    expect(belowZero.segmentFromOrdinal).toBe(-1)
    expect(belowZero.segmentToOrdinal).toBe(0)
    expect(belowZero.loopCount).toBe(-1)

    const backwardDwell = decodeJourney(-45, -1)

    assertDwell(backwardDwell, {
      currentIndex: 4,
      currentOrdinal: -1,
      dwellT: 0,
      loopCount: -1,
      localUnits: 5,
    })

    const deeper = decodeJourney(-55, -1)

    if (deeper.mode !== 'transition') {
      expect.fail('-55 must decode as a transition')
    }

    expect(deeper.segmentFromOrdinal).toBe(-2)
    expect(deeper.segmentToOrdinal).toBe(-1)
    expect(deeper.routeCanonicalT).toBe(0)
  })

  it('keeps cyclic phase identical under +250 and -250 while only loopCount changes', () => {
    const baseDwell = decodeJourney(25, 1)
    const plusLoopDwell = decodeJourney(275, 1)
    const minusLoopDwell = decodeJourney(-225, -1)

    expectSamePhaseExceptLoop(baseDwell, plusLoopDwell, 0, 1)
    expectSamePhaseExceptLoop(baseDwell, minusLoopDwell, 0, -1)

    const baseTransition = decodeJourney(250, 1)
    const plusLoopTransition = decodeJourney(500, 1)

    expectSamePhaseExceptLoop(baseTransition, plusLoopTransition, 1, 2)

    let sample = decodeJourney(25, 1)

    for (let index = 0; index < 3; index += 1) {
      sample = decodeJourney((sample.loopCount + 1) * CYCLE_UNITS + 25, 1)
    }

    if (sample.mode !== 'dwell') {
      throw new Error('repeated +250 navigation must dwell')
    }

    expect(sample.currentIndex).toBe(0)
    expect(sample.mode).toBe('dwell')
  })

  it('never produces out-of-range local units or transition progress', () => {
    for (let units = -520; units <= 520; units += 0.5) {
      const sample = decodeJourney(units, 1)

      expect(sample.localUnits).toBeGreaterThanOrEqual(-ENTRY_UNITS)
      expect(sample.localUnits).toBeLessThan(SLOT_UNITS - ENTRY_UNITS)

      if (sample.mode === 'transition') {
        expect(sample.routeCanonicalT).toBeGreaterThanOrEqual(0)
        expect(sample.routeCanonicalT).toBeLessThanOrEqual(1)
        expect(sample.transitionT).toBeGreaterThanOrEqual(0)
        expect(sample.transitionT).toBeLessThanOrEqual(1)
      } else {
        expect(sample.dwellT).toBeGreaterThanOrEqual(0)
        expect(sample.dwellT).toBeLessThan(1)
      }
    }
  })
})

describe('getTravelPulse', () => {
  it('is zero at dwell and follows sin squared through transitions', () => {
    expect(getTravelPulse(decodeJourney(25, 1))).toBe(0)
    expect(getTravelPulse(decodeJourney(255, 1))).toBe(0)

    for (const units of [245, 247.5, 250, 252.5]) {
      const sample = decodeJourney(units, 1)

      if (sample.mode !== 'transition') {
        expect.fail(`${units} must transition`)
      }

      const expectedT = Math.sin(Math.PI * sample.routeCanonicalT) ** 2

      expect(getTravelPulse(sample)).toBeCloseTo(expectedT, 12)
    }

    expect(getTravelPulse(decodeJourney(245, 1))).toBeCloseTo(0, 12)
    expect(getTravelPulse(decodeJourney(250, 1))).toBeCloseTo(1, 12)
  })
})

describe('getCanonicalRouteT', () => {
  it('advances monotonically along one canonical segment and wraps on the closed ring', () => {
    const first = routeTAt(245)
    const last = routeTAt(254.99)

    expect(first).toBeCloseTo(0.8, 12)
    expect(last).toBeGreaterThan(0.9999)
    expect(last).toBeLessThan(1)

    let previous = first

    for (let units = 245.5; units <= 254.5; units += 0.5) {
      const current = routeTAt(units)

      expect(current).toBeGreaterThan(previous)
      previous = current
    }
  })
})

describe('getMagneticTarget', () => {
  it('rests on the nearest center when velocity is low', () => {
    expect(getMagneticTarget(25, 0, 0)).toBe(25)
    expect(getMagneticTarget(40, 0, 0)).toBe(25)
    expect(getMagneticTarget(49, 0, 0)).toBe(25)
    expect(getMagneticTarget(51, 0, 0)).toBe(75)
    expect(getMagneticTarget(240, 0, 1)).toBe(225)
  })

  it('uses the last input direction for exact midpoint ties', () => {
    expect(getMagneticTarget(50, 0, 1)).toBe(75)
    expect(getMagneticTarget(50, 0, -1)).toBe(25)
    expect(getMagneticTarget(50, 0, 0)).toBe(75)
  })

  it('advances one chapter in the velocity direction when fast and displaced beyond the halo', () => {
    expect(getMagneticTarget(40, 20, 1)).toBe(75)
    expect(getMagneticTarget(12, -20, -1)).toBe(-25)
    expect(getMagneticTarget(70, 30, 1)).toBe(75)
    expect(getMagneticTarget(80, -30, -1)).toBe(75)
    expect(getMagneticTarget(45, 25, 1, 25)).toBe(75)
  })

  it('holds near the rest point against velocity spikes inside the hysteresis halo', () => {
    expect(getMagneticTarget(29, 40, 1)).toBe(25)
    expect(getMagneticTarget(21, -40, -1)).toBe(25)
    expect(getMagneticTarget(29, 40, 1, 25)).toBe(25)
    expect(getMagneticTarget(21, -40, -1, 25)).toBe(25)
  })
})

describe('assertJourneyTimelineInvariants', () => {
  it('passes its development seam assertions', () => {
    expect(() => assertJourneyTimelineInvariants()).not.toThrow()
  })
})

type DwellExpectation = {
  currentIndex: number
  currentOrdinal: number
  dwellT: number
  localUnits: number
  loopCount: number
}

function assertDwell(
  sample: ReturnType<typeof decodeJourney>,
  expectation: DwellExpectation,
): void {
  if (sample.mode !== 'dwell') {
    throw new Error(`expected dwell sample, received ${sample.mode}`)
  }

  expect(sample.currentOrdinal).toBe(expectation.currentOrdinal)
  expect(sample.currentIndex).toBe(expectation.currentIndex)
  expect(sample.dwellT).toBeCloseTo(expectation.dwellT, 9)
  expect(sample.localUnits).toBeCloseTo(expectation.localUnits, 9)
  expect(sample.loopCount).toBe(expectation.loopCount)
}

type TransitionExpectation = {
  easedTransitionT: number
  incomingIndex: number
  outgoingIndex: number
  routeCanonicalT: number
  segmentFromOrdinal?: number
  segmentToOrdinal?: number
  transitionT: number
}

function assertTransition(
  sample: ReturnType<typeof decodeJourney>,
  expectation: TransitionExpectation,
): void {
  if (sample.mode !== 'transition') {
    throw new Error(`expected transition sample, received ${sample.mode}`)
  }

  if (expectation.segmentFromOrdinal !== undefined) {
    expect(sample.segmentFromOrdinal).toBe(expectation.segmentFromOrdinal)
  }

  if (expectation.segmentToOrdinal !== undefined) {
    expect(sample.segmentToOrdinal).toBe(expectation.segmentToOrdinal)
  }

  expect(sample.outgoingIndex).toBe(expectation.outgoingIndex)
  expect(sample.incomingIndex).toBe(expectation.incomingIndex)
  expect(sample.routeCanonicalT).toBeCloseTo(expectation.routeCanonicalT, 9)
  expect(sample.transitionT).toBeCloseTo(expectation.transitionT, 9)
  expect(sample.easedTransitionT).toBeCloseTo(expectation.easedTransitionT, 6)
}

function expectSamePhaseExceptLoop(
  base: ReturnType<typeof decodeJourney>,
  shifted: ReturnType<typeof decodeJourney>,
  baseLoop: number,
  shiftedLoop: number,
): void {
  expect(base.mode).toBe(shifted.mode)

  if (base.mode === 'dwell' && shifted.mode === 'dwell') {
    expect(base.currentIndex).toBe(shifted.currentIndex)
    expect(base.dwellT).toBeCloseTo(shifted.dwellT, 9)
  } else if (base.mode === 'transition' && shifted.mode === 'transition') {
    expect(base.outgoingIndex).toBe(shifted.outgoingIndex)
    expect(base.incomingIndex).toBe(shifted.incomingIndex)
    expect(base.routeCanonicalT).toBeCloseTo(shifted.routeCanonicalT, 9)
    expect(base.easedTransitionT).toBeCloseTo(shifted.easedTransitionT, 9)
  }

  expect(base.loopCount).toBe(baseLoop)
  expect(shifted.loopCount).toBe(shiftedLoop)
}

function routeTAt(units: number): number {
  const sample = decodeJourney(units, 1)

  if (sample.mode !== 'transition') {
    expect.fail(`expected transition at ${units}`)
  }

  return getCanonicalRouteT(sample as TransitionJourneySample)
}
