import { afterEach, describe, expect, it } from 'vitest'

import {
  __resetSchedulerForTests,
  acquireActivity,
  getSchedulerStats,
  isRunning,
  observeFrameDelta,
  subscribeTick,
} from '@/runtime/scheduler'

/**
 * Scheduler lifecycle contract (new_plan.md §7.4, §11.1):
 * real animators keep the single rAF alive; activity tokens do too; passive
 * observers never do. Assertions are delta-based (not exact-frame) because
 * jsdom rAF timing is approximate. The test-only reset seam guarantees a
 * failed assertion cannot leak a zombie loop into the next test.
 */

async function waitForTicks(millis: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, millis))
}

describe('scheduler', () => {
  afterEach(() => {
    __resetSchedulerForTests()
  })

  it('runs while a tick subscriber exists and stops after unsubscribe', async () => {
    let ticks = 0
    const unsubscribe = subscribeTick(() => {
      ticks += 1
    })

    expect(isRunning()).toBe(true)

    await waitForTicks(120)
    const ticksAtUnsubscribe = ticks
    expect(ticksAtUnsubscribe).toBeGreaterThan(0)

    unsubscribe()

    await waitForTicks(80)

    expect(isRunning()).toBe(false)
    expect(ticks).toBe(ticksAtUnsubscribe)
  })

  it('keeps running for activity tokens after tick subscribers leave', async () => {
    const unsubscribe = subscribeTick(() => {})
    const releaseActivity = acquireActivity('exhibit')

    await waitForTicks(60)

    unsubscribe()

    // The token alone must hold the loop open — measured by the scheduler's
    // own running flag, not by the (now removed) callback.
    await waitForTicks(80)
    expect(isRunning()).toBe(true)

    releaseActivity()

    await waitForTicks(60)
    expect(isRunning()).toBe(false)
  })

  it('never keeps the loop alive for passive observers', async () => {
    let observed = 0
    const stopObserving = observeFrameDelta(() => {
      observed += 1
    })

    expect(isRunning()).toBe(false)

    await waitForTicks(80)
    expect(observed).toBe(0)

    stopObserving()
  })

  it('delivers frame deltas to observers while a real animator runs', async () => {
    let observedDeltas = 0
    const stopObserving = observeFrameDelta((deltaMs) => {
      if (deltaMs > 0) observedDeltas += 1
    })

    const unsubscribe = subscribeTick(() => {})

    await waitForTicks(120)
    unsubscribe()

    expect(observedDeltas).toBeGreaterThan(0)
    stopObserving()
  })

  it('tracks frame counters for diagnostics', async () => {
    const before = getSchedulerStats().frameCounter
    const unsubscribe = subscribeTick(() => {})

    await waitForTicks(100)
    unsubscribe()

    expect(getSchedulerStats().frameCounter).toBeGreaterThanOrEqual(before + 1)
  })
})
