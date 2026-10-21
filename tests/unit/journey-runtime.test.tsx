import { act, cleanup, render } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  JourneyRuntimeProvider,
  useJourneyRuntime,
  type SettleInfo,
} from '@/runtime/journeyRuntime'
import { useNarrativeStore } from '@/runtime/stores/narrative'

import { journeyChapterIds } from '@/content/data/journey'

/**
 * Journey runtime contract (new_plan.md §13 P3): settle semantics, pause
 * freezing, synchronous jumps and atomic store publications — the behaviors
 * whose absence broke the legacy controller.
 */

const chapterIds = [...journeyChapterIds]

let runtime: ReturnType<typeof useJourneyRuntime> | null = null
let settleInfos: SettleInfo[] = []

function Probe() {
  const api = useJourneyRuntime()

  runtime = api

  useEffect(() => {
    return api.subscribeSettle((info) => {
      settleInfos.push(info)
    })
  }, [api])

  return null
}

function renderRuntime() {
  settleInfos = []

  render(
    <JourneyRuntimeProvider chapterIds={chapterIds}>
      <Probe />
    </JourneyRuntimeProvider>,
  )
}

async function waitForSettle(atIndex: number, timeoutMs = 6000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const settled = useNarrativeStore.getState()

    if (settled.settledIndex === atIndex && settled.travelMode === 'dwell') {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`Journey never settled at index ${atIndex}.`)
}

describe('journey runtime', () => {
  afterEach(() => {
    // Unmount the provider: its effects release scheduler subscriptions and
    // frame listeners, keeping tests isolated even when assertions fail.
    cleanup()
  })

  it('publishes the initial landing chapter without any input', async () => {
    renderRuntime()

    await waitForSettle(0)

    expect(useNarrativeStore.getState().settledChapterId).toBe('origins')
    // Window at rest = settled ± neighbors.
    expect(useNarrativeStore.getState().visibleChapterIds).toEqual([
      'origins',
      'interests',
      'contact',
    ])
  })

  it('navigates and settles at the requested chapter with decoded direction', async () => {
    renderRuntime()

    act(() => {
      runtime?.navigateToIndex(2)
    })

    await waitForSettle(2)

    const state = useNarrativeStore.getState()
    expect(state.settledChapterId).toBe('research')
    expect(state.direction).toBe(1)
    expect(state.loopCount).toBe(0)
    expect(settleInfos.length).toBeGreaterThan(0)
    expect(settleInfos.at(-1)?.chapterId).toBe('research')
  })

  it('wraps across the seam forward (contact → origins, loop +1)', async () => {
    renderRuntime()

    // Start at contact on loop 0 (units 325) so the wrap crosses the seam
    // FORWARD rather than resolving to the backward ordinal (-1).
    act(() => {
      runtime?.jumpToUnits(325)
    })

    act(() => {
      runtime?.navigateToIndex(0)
    })
    await waitForSettle(0)

    const state = useNarrativeStore.getState()
    expect(state.settledChapterId).toBe('origins')
    expect(state.loopCount).toBe(1)
    expect(state.direction).toBe(1)
  })

  it('resolves nearest ordinals when navigating backward across the seam', async () => {
    renderRuntime()

    // From origins, chapter 6 is nearest via the BACKWARD ordinal (-1):
    // one step back instead of six steps forward.
    act(() => {
      runtime?.navigateToIndex(6)
    })
    await waitForSettle(6)

    const state = useNarrativeStore.getState()
    expect(state.settledChapterId).toBe('contact')
    expect(state.loopCount).toBe(-1)
  })

  it('publishes the visible pair during a transition', async () => {
    renderRuntime()

    await waitForSettle(0)

    act(() => {
      runtime?.navigateToIndex(1)
    })

    // During the flight the pair must be published before the settle.
    const startedAt = Date.now()
    let sawPair = false

    while (Date.now() - startedAt < 6000) {
      if (useNarrativeStore.getState().travelMode === 'transition') {
        sawPair = true
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 40))
    }

    expect(sawPair).toBe(true)

    await waitForSettle(1)

    const state = useNarrativeStore.getState()
    // At rest the window is settled ± neighbors (ordered next-then-previous).
    expect(state.visibleChapterIds).toEqual(['interests', 'research', 'origins'])
    expect(state.travelMode).toBe('dwell')
  })

  it('freezes on pause and does not resume an in-flight spring on unpause', async () => {
    renderRuntime()

    await waitForSettle(0)

    act(() => {
      runtime?.setPaused(true)
    })

    expect(runtime?.isPaused()).toBe(true)

    const unitsAtPause = runtime?.getUnits() ?? 0

    act(() => {
      runtime?.nudge(30)
    })

    await new Promise((resolve) => setTimeout(resolve, 250))

    expect(runtime?.getUnits()).toBe(unitsAtPause)
    expect(runtime?.isMoving()).toBe(false)

    act(() => {
      runtime?.setPaused(false)
    })

    // Nudge a full slot backward so the settle lands on a dwell center
    // (contact, ordinal -1) rather than inside the seam.
    act(() => {
      runtime?.nudge(-50)
    })

    expect(runtime?.isMoving()).toBe(true)

    await waitForSettle(6)
    expect(useNarrativeStore.getState().settledChapterId).toBe('contact')
    expect(useNarrativeStore.getState().loopCount).toBe(-1)
  })

  it('jumps instantly (reduced motion) and publishes settle synchronously', async () => {
    renderRuntime()

    await waitForSettle(0)

    act(() => {
      runtime?.jumpToIndex(3)
    })

    expect(runtime?.isMoving()).toBe(false)
    expect(useNarrativeStore.getState().settledChapterId).toBe('computation')
    expect(settleInfos.at(-1)?.chapterId).toBe('computation')
    expect(runtime?.getUnits()).toBe(3 * 50 + 25)
  })

  it('exposes the injected topology and frame records with current truth', async () => {
    renderRuntime()

    await waitForSettle(0)

    const topology = runtime?.getTopology()
    expect(topology?.count).toBe(7)
    expect(topology?.idByIndex(0)).toBe('origins')

    let observedUnits = -1
    const unsubscribe = runtime?.subscribeFrame((frame) => {
      observedUnits = frame.units
    })

    act(() => {
      runtime?.jumpToUnits(175)
    })

    expect(observedUnits).toBe(175)
    unsubscribe?.()

    expect(runtime?.chapterCount()).toBe(7)
  })
})
