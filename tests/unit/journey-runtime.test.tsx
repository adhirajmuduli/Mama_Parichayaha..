import { render } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  JourneyRuntimeProvider,
  useJourneyRuntime,
  type JourneyRuntimeApi,
} from '@/lib/journeyRuntime'

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16) as unknown) as typeof requestAnimationFrame
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = ((handle: number) =>
    clearTimeout(handle as unknown as ReturnType<typeof setTimeout>)) as typeof cancelAnimationFrame
}

function Harness({ onReady }: { onReady?: ((api: JourneyRuntimeApi) => void) | undefined }) {
  const api = useJourneyRuntime()

  onReady?.(api)

  return <p data-testid="journey-child">ready</p>
}

function renderHarness(onReady?: (api: JourneyRuntimeApi) => void) {
  return render(
    <JourneyRuntimeProvider>
      <Harness onReady={onReady} />
    </JourneyRuntimeProvider>,
  )
}

describe('journey runtime', () => {
  it('starts at the Origins dwell center without moving', () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    expect(api).not.toBeNull()
    expect(api!.inputUnits.get()).toBe(25)
    expect(api!.renderUnits.get()).toBe(25)
    expect(api!.isMoving()).toBe(false)
    expect(api!.isPaused()).toBe(false)
  })

  it('moves the input immediately and lets the spring follow without React rerenders', async () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    act(() => {
      api!.nudge(10)
    })

    expect(api!.inputUnits.get()).toBe(35)
    expect(api!.getLastInputDirection()).toBe(1)

    await vi.waitFor(
      () => {
        const position = api!.renderUnits.get()
        expect(Math.abs(position - 35)).toBeLessThan(0.5)
      },
      { timeout: 5_000, interval: 32 },
    )
  }, 10_000)

  it('ignores travel input while paused', () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    act(() => {
      api!.setPaused(true)
      api!.nudge(12)
      api!.navigateTo(75)
    })

    expect(api!.inputUnits.get()).toBe(25)

    act(() => {
      api!.setPaused(false)
      api!.navigateTo(75)
    })

    expect(api!.inputUnits.get()).toBe(75)
    expect(api!.getLastInputDirection()).toBe(1)
  })

  it('records negative direction for backward navigation', () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    act(() => {
      api!.nudge(-4)
    })

    expect(api!.inputUnits.get()).toBe(21)
    expect(api!.getLastInputDirection()).toBe(-1)
  })

  it('snaps both values with jumpTo and reports a resting state', () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    act(() => {
      api!.markMoving()
      api!.jumpTo(225)
    })

    expect(api!.inputUnits.get()).toBe(225)
    expect(api!.renderUnits.get()).toBe(225)
    expect(api!.isMoving()).toBe(false)
  })

  it('notifies settle subscribers only after the spring comes to rest', async () => {
    let api: JourneyRuntimeApi | null = null

    renderHarness((nextApi) => {
      api = nextApi
    })

    const onSettle = vi.fn()
    const unsubscribe = api!.subscribeSettle(onSettle)

    act(() => {
      api!.navigateTo(30)
    })

    await vi.waitFor(
      () => {
        expect(onSettle).toHaveBeenCalled()
        expect(Math.abs(api!.renderUnits.get() - 30)).toBeLessThan(0.02)
        expect(api!.isMoving()).toBe(false)
      },
      { timeout: 6_000, interval: 48 },
    )

    unsubscribe()
  }, 12_000)
})
