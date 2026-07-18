import { render } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}))

import useModelInteraction from '@/hooks/useModelInteraction'
import { useNarrativeStore } from '@/stores/narrativeStore'

type InteractionHandlers = ReturnType<typeof useModelInteraction>
type PointerHandlerEvent = Parameters<InteractionHandlers['onPointerDown']>[0]

interface HarnessProps {
  chapter: 'origins' | 'research'
  onReady: (handlers: InteractionHandlers, group: THREE.Group) => void
}

function InteractionHarness({ chapter, onReady }: HarnessProps) {
  const groupRef = useRef<THREE.Group | null>(new THREE.Group())
  const handlers = useModelInteraction({
    chapter,
    exhibitId: chapter === 'origins' ? 'dna' : 'protein',
    groupRef,
    initialRotation: [0, 0, 0],
  })

  useEffect(() => {
    if (groupRef.current) {
      onReady(handlers, groupRef.current)
    }
  }, [handlers, onReady])

  return null
}

interface TestPointerEvent {
  event: PointerHandlerEvent
  stopPropagation: ReturnType<typeof vi.fn>
  target: {
    releasePointerCapture: ReturnType<typeof vi.fn>
    setPointerCapture: ReturnType<typeof vi.fn>
  }
}

function createPointerEvent(overrides: Partial<PointerHandlerEvent> = {}): TestPointerEvent {
  const target = {
    releasePointerCapture: vi.fn(),
    setPointerCapture: vi.fn(),
  }

  const event = {
    button: 0,
    clientX: 100,
    clientY: 100,
    pointerId: 7,
    pointerType: 'mouse',
    stopPropagation: vi.fn(),
    target,
    ...overrides,
  } as unknown as PointerHandlerEvent

  return {
    event,
    stopPropagation: event.stopPropagation as unknown as ReturnType<typeof vi.fn>,
    target,
  }
}

describe('useModelInteraction', () => {
  beforeEach(() => {
    useNarrativeStore.setState({ activeChapter: 'research', direction: 0, selectedExhibit: null })
  })

  it('captures, rotates, and always releases a matching pointer on cancellation', () => {
    let handlers: InteractionHandlers | null = null
    let group: THREE.Group | null = null
    render(
      <InteractionHarness
        chapter="research"
        onReady={(nextHandlers, nextGroup) => {
          handlers = nextHandlers
          group = nextGroup
        }}
      />,
    )

    const readyHandlers = handlers as unknown as InteractionHandlers
    const readyGroup = group as unknown as THREE.Group
    const down = createPointerEvent()
    readyHandlers.onPointerDown(down.event)
    readyHandlers.onPointerMove(createPointerEvent({ clientX: 148 }).event)

    expect(down.target.setPointerCapture).toHaveBeenCalledWith(7)
    expect(down.stopPropagation).toHaveBeenCalledOnce()
    expect(readyGroup.rotation.y).toBeGreaterThan(0)

    readyHandlers.onPointerCancel(createPointerEvent().event)

    expect(down.target.releasePointerCapture).toHaveBeenCalledWith(7)
  })

  it('does not capture inactive exhibits and leaves vertical touch scrolling unclaimed', () => {
    let handlers: InteractionHandlers | null = null
    render(
      <InteractionHarness
        chapter="origins"
        onReady={(nextHandlers) => {
          handlers = nextHandlers
        }}
      />,
    )

    const readyHandlers = handlers as unknown as InteractionHandlers
    const inactiveDown = createPointerEvent()
    readyHandlers.onPointerDown(inactiveDown.event)

    expect(inactiveDown.target.setPointerCapture).not.toHaveBeenCalled()

    useNarrativeStore.setState({ activeChapter: 'origins' })
    const touchDown = createPointerEvent({ pointerId: 8, pointerType: 'touch' })
    const verticalMove = createPointerEvent({
      clientX: 104,
      clientY: 152,
      pointerId: 8,
      pointerType: 'touch',
    })
    readyHandlers.onPointerDown(touchDown.event)
    readyHandlers.onPointerMove(verticalMove.event)

    expect(touchDown.target.setPointerCapture).not.toHaveBeenCalled()
    expect(verticalMove.stopPropagation).not.toHaveBeenCalled()
  })
})
