import { describe, expect, it } from 'vitest'

import {
  advanceModelInertia,
  beginModelInteraction,
  createModelInteractionState,
  moveModelInteraction,
  releaseModelInteraction,
  resetModelInteraction,
} from '@/lib/modelInteraction'

describe('model interaction state machine', () => {
  it('captures a primary mouse drag, bounds its rotation delta, and releases outside the model', () => {
    const state = createModelInteractionState()

    expect(
      beginModelInteraction(state, {
        clientX: 10,
        clientY: 12,
        pointerId: 4,
        pointerType: 'mouse',
      }),
    ).toBe('dragging')
    expect(moveModelInteraction(state, { clientX: 900, clientY: -900, pointerId: 4 })).toEqual({
      x: 0.12,
      y: 0.12,
    })

    releaseModelInteraction(state)

    expect(state).toMatchObject({ mode: 'idle', pointerId: null })
    expect(moveModelInteraction(state, { clientX: 920, clientY: -880, pointerId: 4 })).toBeNull()
  })

  it('preserves vertical touch scrolling and only starts horizontal model dragging after a threshold', () => {
    const verticalState = createModelInteractionState()
    beginModelInteraction(verticalState, {
      clientX: 40,
      clientY: 40,
      pointerId: 2,
      pointerType: 'touch',
    })

    expect(
      moveModelInteraction(verticalState, { clientX: 45, clientY: 76, pointerId: 2 }),
    ).toBeNull()
    expect(verticalState).toMatchObject({ mode: 'idle', pointerId: null })

    const horizontalState = createModelInteractionState()
    beginModelInteraction(horizontalState, {
      clientX: 40,
      clientY: 40,
      pointerId: 3,
      pointerType: 'touch',
    })

    expect(
      moveModelInteraction(horizontalState, { clientX: 47, clientY: 42, pointerId: 3 }),
    ).toBeNull()
    expect(horizontalState.mode).toBe('pending')
    expect(
      moveModelInteraction(horizontalState, { clientX: 61, clientY: 43, pointerId: 3 }),
    ).toEqual({
      x: -0.006,
      y: 0.084,
    })
    expect(horizontalState.mode).toBe('dragging')
  })

  it('uses delta-time damping for inertia and clears motion on reset', () => {
    const state = createModelInteractionState()
    beginModelInteraction(state, { clientX: 0, clientY: 0, pointerId: 1, pointerType: 'mouse' })
    moveModelInteraction(state, { clientX: 80, clientY: 0, pointerId: 1 })
    releaseModelInteraction(state)

    const firstStep = advanceModelInertia(state, 1 / 60)
    const secondStep = advanceModelInertia(state, 1 / 60)

    expect(firstStep.y).toBeGreaterThan(secondStep.y)
    expect(firstStep.y).toBeGreaterThan(0)

    resetModelInteraction(state)

    expect(state).toMatchObject({ mode: 'idle', pointerId: null, velocityX: 0, velocityY: 0 })
  })
})
