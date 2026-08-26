import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CyclicJourneyController from '@/components/motion/CyclicJourneyController'
import CyclicChapterStage from '@/components/narrative/CyclicChapterStage'
import {
  JourneyRuntimeProvider,
  useJourneyRuntime,
  type JourneyRuntimeApi,
} from '@/lib/journeyRuntime'
import { useNarrativeStore } from '@/stores/narrativeStore'

function Harness({ onReady }: { onReady?: ((api: JourneyRuntimeApi) => void) | undefined }) {
  return (
    <JourneyRuntimeProvider>
      <CyclicJourneyController>
        <ControllerBridge onReady={onReady} />
        <CyclicChapterStage />
      </CyclicJourneyController>
    </JourneyRuntimeProvider>
  )
}

function ControllerBridge({
  onReady,
}: {
  onReady?: ((api: JourneyRuntimeApi) => void) | undefined
}) {
  const runtime = useJourneyRuntime()

  onReady?.(runtime)

  return null
}

function dispatchWheel(element: Element, deltaY: number, options: { ctrlKey?: boolean } = {}) {
  const event = new Event('wheel', { bubbles: true, cancelable: true })

  Object.assign(event, {
    ctrlKey: options.ctrlKey ?? false,
    deltaMode: 0,
    deltaY,
  })

  element.dispatchEvent(event)
}

function dispatchKey(key: string, target?: Element, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, shiftKey })

  ;(target ?? window).dispatchEvent(event)
}

async function waitForRest(api: JourneyRuntimeApi) {
  await vi.waitFor(
    () => {
      expect(api.isMoving()).toBe(false)
      expect(Math.abs(api.renderUnits.get() - api.inputUnits.get())).toBeLessThan(0.02)
    },
    { timeout: 6_000, interval: 48 },
  )
}

describe('cyclic journey controller', () => {
  beforeEach(() => {
    useNarrativeStore.setState({
      activeChapter: 'origins',
      direction: 0,
      selectedExhibit: null,
      settledChapterId: 'origins',
      visibleChapterIds: ['origins'],
      focusableChapterId: 'origins',
      travelMode: 'dwell',
      loopCount: 0,
      overlay: null,
      keyboardFocusToken: 0,
    })
  })

  it('accumulates wheel input, settles magnetically, and crosses forward through the seam', async () => {
    let api: JourneyRuntimeApi | null = null
    const { container } = render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    const stage = container.querySelector('[data-journey-controller]')!

    dispatchWheel(stage, 100)
    expect(api!.inputUnits.get()).toBeCloseTo(25 + 100 * (50 / 720), 6)

    await waitForRest(api!)
    expect(api!.inputUnits.get()).toBe(25)

    for (let index = 0; index < 6; index += 1) {
      dispatchWheel(stage, 120)
    }

    await waitForRest(api!)
    expect(api!.inputUnits.get()).toBe(75)
  }, 15_000)

  it('ignores ctrl-wheel so browser zoom is preserved', () => {
    let api: JourneyRuntimeApi | null = null
    const { container } = render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    const stage = container.querySelector('[data-journey-controller]')!

    dispatchWheel(stage, 120, { ctrlKey: true })

    expect(api!.inputUnits.get()).toBe(25)
  })

  it('reaches the same dwell centers from the keyboard, including wrap and digit targets', () => {
    let api: JourneyRuntimeApi | null = null

    render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    dispatchKey('ArrowDown')
    expect(api!.inputUnits.get()).toBe(75)

    dispatchKey('ArrowUp')
    expect(api!.inputUnits.get()).toBe(25)

    dispatchKey('ArrowUp')
    expect(api!.inputUnits.get()).toBe(-25)

    dispatchKey('Home')
    expect(api!.inputUnits.get()).toBe(25)

    dispatchKey('3')
    expect(api!.inputUnits.get()).toBe(125)

    dispatchKey('PageDown')
    expect(api!.inputUnits.get()).toBe(175)
  })

  it('ignores keyboard shortcuts originating from editable targets', () => {
    let api: JourneyRuntimeApi | null = null
    const { container } = render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    const input = document.createElement('input')

    container.appendChild(input)

    dispatchKey('ArrowDown', input)

    expect(api!.inputUnits.get()).toBe(25)
  })

  it('pauses journey movement while an overlay is open and resumes after it closes', async () => {
    let api: JourneyRuntimeApi | null = null
    const { container } = render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    const stage = container.querySelector('[data-journey-controller]')!

    act(() => {
      useNarrativeStore.getState().setOverlay('contact')
    })

    dispatchWheel(stage, 120)
    dispatchKey('ArrowDown')

    expect(api!.inputUnits.get()).toBe(25)

    act(() => {
      useNarrativeStore.getState().setOverlay(null)
    })

    dispatchKey('ArrowDown')

    expect(api!.inputUnits.get()).toBe(75)
  })

  it('keeps exactly five card roots across three loops and manages visibility semantics', async () => {
    let api: JourneyRuntimeApi | null = null
    const { container } = render(
      <Harness
        onReady={(nextApi) => {
          api = nextApi
        }}
      />,
    )

    const cards = container.querySelectorAll('[data-chapter-card]')

    expect(cards.length).toBe(5)
    expect(
      container.querySelector('[data-chapter-card="origins"]')?.getAttribute('data-card-visible'),
    ).toBe('true')
    expect(
      container.querySelector('[data-chapter-card="interests"]')?.getAttribute('data-card-visible'),
    ).toBe('false')

    act(() => {
      useNarrativeStore.getState().setVisiblePair(4, 0, 0)
    })

    expect(
      container.querySelector('[data-chapter-card="future"]')?.getAttribute('data-card-visible'),
    ).toBe('true')
    expect(
      container.querySelector('[data-chapter-card="origins"]')?.getAttribute('data-card-visible'),
    ).toBe('true')

    for (let loop = 1; loop <= 3; loop += 1) {
      act(() => {
        api!.jumpTo(25 + loop * 250)
        useNarrativeStore.getState().publishSettledState({
          settledIndex: 0,
          loopCount: loop,
          direction: 1,
        })
      })

      expect(container.querySelectorAll('[data-chapter-card]').length).toBe(5)
    }

    expect(container.querySelectorAll('[aria-hidden="false"][data-chapter-card]').length).toBe(1)
  })
})
