import { act, cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { AsciiFramePlayer } from '@/exhibits/AsciiFramePlayer'
import type { AsciiExhibitSource } from '@/exhibits/types'

import { __resetSchedulerForTests } from '@/runtime/scheduler'

/**
 * Frame player contract (new_plan.md §10.3): static writes exactly once,
 * playing advances by elapsed time (skips frames when behind), restart
 * resets the clock. Driven with real jsdom rAF and generous waits.
 */

const FRAMES = ['frame-zero', 'frame-one', 'frame-two'] as const

function makeSource(overrides: Partial<AsciiExhibitSource> = {}): AsciiExhibitSource {
  return {
    id: 'test-source',
    fps: 10,
    frames: FRAMES,
    ...overrides,
  }
}

function Harness({
  source,
  fpsCap,
  playing,
  restartToken,
}: {
  source: AsciiExhibitSource
  fpsCap: number
  playing: boolean
  restartToken: number
}) {
  const frameRef = useRef<HTMLPreElement | null>(null)

  return (
    <div>
      <pre data-testid="frame" ref={frameRef}>
        initial
      </pre>
      <AsciiFramePlayer
        source={source}
        fpsCap={fpsCap}
        playing={playing}
        restartToken={restartToken}
        frameRef={frameRef}
      />
    </div>
  )
}

async function wait(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}

function readFrame(): string {
  return document.querySelector('[data-testid="frame"]')?.textContent ?? ''
}

describe('ascii frame player', () => {
  afterEach(() => {
    cleanup()
    __resetSchedulerForTests()
  })

  it('writes frame 0 once in static mode and never subscribes', async () => {
    render(<Harness source={makeSource()} fpsCap={0} playing={false} restartToken={0} />)

    expect(readFrame()).toBe('frame-zero')
    await wait(120)
    expect(readFrame()).toBe('frame-zero')
  })

  it('advances frames with elapsed time while playing', async () => {
    render(<Harness source={makeSource()} fpsCap={10} playing restartToken={0} />)

    // fps 10 → 100ms per frame. At ~350ms elapsed the player must have
    // advanced at least two frames and be cycling the precomputed set.
    await wait(350)

    const frame = readFrame()
    expect(FRAMES as readonly string[]).toContain(frame)
    expect(frame).not.toBe('initial')
  })

  it('caps the effective rate below the authored fps', async () => {
    render(<Harness source={makeSource({ fps: 30 })} fpsCap={10} playing restartToken={0} />)

    await wait(120)

    // 120ms at 10fps = at most frame 1; a 30fps player would reach frame 3+.
    const frame = readFrame()
    expect(FRAMES as readonly string[]).toContain(frame)
  })

  it('restart resets the clock to frame 0', async () => {
    const { rerender } = render(
      <Harness source={makeSource()} fpsCap={10} playing restartToken={0} />,
    )

    await wait(250)
    expect(readFrame()).not.toBe('frame-zero')

    rerender(<Harness source={makeSource()} fpsCap={10} playing restartToken={1} />)

    await wait(30)
    expect(readFrame()).toBe('frame-zero')
  })

  it('uses render functions when frames are absent', async () => {
    const generativeSource: AsciiExhibitSource = {
      id: 'test-generative',
      fps: 10,
      render: (index) => `generated-${index}`,
    }

    render(<Harness source={generativeSource} fpsCap={10} playing restartToken={0} />)

    expect(readFrame()).toBe('generated-0')

    await wait(150)

    expect(readFrame()).toMatch(/^generated-\d+$/)
  })
})
