import { act, cleanup, render } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createTopology } from '@/journey/topology'
import type { JourneyRuntimeApi } from '@/runtime/journeyRuntime'
import { useJourneyInput } from '@/runtime/input/coordinator'
import { useNarrativeStore } from '@/runtime/stores/narrative'

import { journeyChapterIds } from '@/content/data/journey'

/**
 * Input coordinator contract (new_plan.md §13 P4): wheel arbitration, the
 * magnetic settle debounce, keyboard intents and overlay pausing — driven
 * through a fully fake runtime so the coordinator is tested in isolation.
 */

const chapterIds = [...journeyChapterIds]

interface FakeRuntimeState {
  inputUnits: number
  paused: boolean
  nudge: ReturnType<typeof vi.fn>
  navigateToUnits: ReturnType<typeof vi.fn>
  navigateToIndex: ReturnType<typeof vi.fn>
  jumpToUnits: ReturnType<typeof vi.fn>
  jumpToIndex: ReturnType<typeof vi.fn>
  markMoving: ReturnType<typeof vi.fn>
  setPaused: ReturnType<typeof vi.fn>
}

function createFakeRuntime(): { api: JourneyRuntimeApi; state: FakeRuntimeState } {
  const state: FakeRuntimeState = {
    inputUnits: 25,
    paused: false,
    nudge: vi.fn((delta: number) => {
      state.inputUnits += delta
    }),
    navigateToUnits: vi.fn((target: number) => {
      state.inputUnits = target
    }),
    navigateToIndex: vi.fn((index: number, opts?: { nearest?: boolean }) => {
      const topology = createTopology(chapterIds)
      void topology
      // The fake mirrors ordinal resolution loosely: units = index slot.
      state.inputUnits = 25 + index * 50
      void opts
    }),
    jumpToUnits: vi.fn((target: number) => {
      state.inputUnits = target
    }),
    jumpToIndex: vi.fn((index: number) => {
      state.inputUnits = 25 + index * 50
    }),
    markMoving: vi.fn(),
    setPaused: vi.fn((paused: boolean) => {
      state.paused = paused
    }),
  }

  const api = {
    unitsValue: { get: () => state.inputUnits } as never,
    getTopology: () => createTopology(chapterIds),
    chapterCount: () => chapterIds.length,
    getUnits: () => state.inputUnits,
    getInputUnits: () => state.inputUnits,
    getVelocity: () => 0,
    getLastInputDirection: () => 0,
    isMoving: () => false,
    isPaused: () => state.paused,
    markMoving: state.markMoving,
    nudge: state.nudge,
    navigateToIndex: state.navigateToIndex,
    navigateToUnits: state.navigateToUnits,
    jumpToIndex: state.jumpToIndex,
    jumpToUnits: state.jumpToUnits,
    setPaused: state.setPaused,
    subscribeSettle: () => () => {},
    subscribeFrame: () => () => {},
  } as unknown as JourneyRuntimeApi

  return { api, state }
}

function Probe({ runtime }: { runtime: JourneyRuntimeApi }) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useJourneyInput({ runtime, enabled: true, hostRef })

  return (
    <div ref={hostRef} data-testid="host">
      <div data-scroll-region="" data-testid="region" style={{ height: '40px' }}>
        <p>region content</p>
      </div>
    </div>
  )
}

function fireWheel(target: Element, deltaY: number, deltaMode = 0) {
  const event = new WheelEvent('wheel', { deltaY, deltaMode, cancelable: true, bubbles: true })
  target.dispatchEvent(event)
  return event
}

function fireKey(key: string, target?: Element) {
  const event = new KeyboardEvent('keydown', {
    key,
    cancelable: true,
    bubbles: true,
  })
  ;(target ?? window).dispatchEvent(event)
  return event
}

describe('input coordinator', () => {
  afterEach(() => {
    cleanup()
    useNarrativeStore.getState().setOverlay(null)
    vi.useRealTimers()
  })

  it('consumes wheel events, nudges by the clamped unit delta and magnetically settles', async () => {
    vi.useFakeTimers()
    const { api, state } = createFakeRuntime()

    render(<Probe runtime={api} />)

    const host = document.querySelector('[data-testid="host"]') as HTMLElement
    const event = fireWheel(host, 400)

    expect(event.defaultPrevented).toBe(true)
    expect(state.markMoving).toHaveBeenCalled()
    // 400px clamps to 80px → 8 units.
    expect(state.nudge).toHaveBeenCalledWith(8)
    expect(state.inputUnits).toBe(33)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120)
    })

    // Magnetic settle returns to the nearest dwell center (25).
    expect(state.navigateToUnits).toHaveBeenCalledWith(25)
  })

  it('leaves scrollable regions alone while they can consume the wheel', () => {
    const { api, state } = createFakeRuntime()

    render(<Probe runtime={api} />)

    const region = document.querySelector('[data-testid="region"]') as HTMLElement

    // jsdom reports zero metrics; fake a scrollable element.
    Object.defineProperty(region, 'clientHeight', { value: 100, configurable: true })
    Object.defineProperty(region, 'scrollHeight', { value: 300, configurable: true })
    Object.defineProperty(region, 'scrollTop', { value: 50, configurable: true })

    const event = fireWheel(region, 60)

    expect(event.defaultPrevented).toBe(false)
    expect(state.nudge).not.toHaveBeenCalled()
  })

  it('takes over once the region cannot scroll further', () => {
    const { api, state } = createFakeRuntime()

    render(<Probe runtime={api} />)

    const region = document.querySelector('[data-testid="region"]') as HTMLElement
    Object.defineProperty(region, 'clientHeight', { value: 100, configurable: true })
    Object.defineProperty(region, 'scrollHeight', { value: 300, configurable: true })
    Object.defineProperty(region, 'scrollTop', { value: 200, configurable: true })

    const downward = fireWheel(region, 60)
    expect(downward.defaultPrevented).toBe(true)
    expect(state.nudge).toHaveBeenCalled()

    state.nudge.mockClear()
    const upward = fireWheel(region, -60)
    expect(upward.defaultPrevented).toBe(false)
    expect(state.nudge).not.toHaveBeenCalled()
  })

  it('maps keyboard intents through the runtime and focuses the deck', () => {
    const { api, state } = createFakeRuntime()
    const tokenBefore = useNarrativeStore.getState().keyboardFocusToken

    render(<Probe runtime={api} />)

    fireKey('ArrowDown')
    expect(state.navigateToUnits).toHaveBeenCalledWith(75)

    fireKey('ArrowUp')
    expect(state.navigateToUnits).toHaveBeenCalledWith(25)

    fireKey('Home')
    expect(state.navigateToIndex).toHaveBeenCalledWith(0)

    fireKey('3')
    expect(state.navigateToIndex).toHaveBeenCalledWith(2, { nearest: false })

    expect(useNarrativeStore.getState().keyboardFocusToken).toBeGreaterThan(tokenBefore)
  })

  it('never navigates from editable or guarded surfaces', () => {
    const { api, state } = createFakeRuntime()

    render(<Probe runtime={api} />)

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireKey('ArrowDown', input)
    expect(state.navigateToUnits).not.toHaveBeenCalled()

    input.remove()
  })

  it('pauses the runtime while an overlay is open and resumes after', () => {
    const { api } = createFakeRuntime()

    render(<Probe runtime={api} />)

    act(() => {
      useNarrativeStore.getState().setOverlay('contact')
    })

    expect(api.isPaused()).toBe(true)

    act(() => {
      useNarrativeStore.getState().setOverlay(null)
    })

    expect(api.isPaused()).toBe(false)
  })

  it('dismisses overlays with Escape', () => {
    const { api } = createFakeRuntime()

    render(<Probe runtime={api} />)

    act(() => {
      useNarrativeStore.getState().setOverlay('contact')
    })

    fireKey('Escape')

    expect(useNarrativeStore.getState().overlay).toBeNull()
    expect(api.isPaused()).toBe(false)
  })

  it('detaches every listener on unmount', () => {
    const { api, state } = createFakeRuntime()

    const rendered = render(<Probe runtime={api} />)
    rendered.unmount()

    const callsAfterUnmount = state.nudge.mock.calls.length
    fireKey('ArrowDown')

    expect(state.nudge.mock.calls.length).toBe(callsAfterUnmount)
    expect(state.navigateToUnits).not.toHaveBeenCalled()
  })
})
