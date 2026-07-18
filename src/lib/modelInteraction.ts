type ModelInteractionMode = 'idle' | 'pending' | 'dragging'

export interface ModelInteractionState {
  lastX: number
  lastY: number
  mode: ModelInteractionMode
  pointerId: number | null
  velocityX: number
  velocityY: number
}

export interface RotationDelta {
  x: number
  y: number
}

const dragThreshold = 12
const maximumDelta = 0.12
const maximumVelocity = 2

export function createModelInteractionState(): ModelInteractionState {
  return {
    mode: 'idle',
    pointerId: null,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  }
}

export function beginModelInteraction(
  state: ModelInteractionState,
  pointer: { clientX: number; clientY: number; pointerId: number; pointerType: string },
) {
  state.mode = pointer.pointerType === 'touch' ? 'pending' : 'dragging'
  state.pointerId = pointer.pointerId
  state.lastX = pointer.clientX
  state.lastY = pointer.clientY
  state.velocityX = 0
  state.velocityY = 0

  return state.mode
}

export function moveModelInteraction(
  state: ModelInteractionState,
  pointer: { clientX: number; clientY: number; pointerId: number },
): RotationDelta | null {
  if (state.pointerId !== pointer.pointerId || state.mode === 'idle') {
    return null
  }

  const x = pointer.clientX - state.lastX
  const y = pointer.clientY - state.lastY
  state.lastX = pointer.clientX
  state.lastY = pointer.clientY

  if (state.mode === 'pending') {
    if (Math.abs(y) > Math.abs(x)) {
      releaseModelInteraction(state)
      return null
    }

    if (Math.abs(x) < dragThreshold) {
      return null
    }

    state.mode = 'dragging'
  }

  const delta = {
    x: clamp(-y * 0.006, -maximumDelta, maximumDelta),
    y: clamp(x * 0.006, -maximumDelta, maximumDelta),
  }
  state.velocityX = clamp(delta.x * 18, -maximumVelocity, maximumVelocity)
  state.velocityY = clamp(delta.y * 18, -maximumVelocity, maximumVelocity)

  return delta
}

export function advanceModelInertia(
  state: ModelInteractionState,
  deltaSeconds: number,
): RotationDelta {
  const damping = Math.exp(-8 * deltaSeconds)
  state.velocityX *= damping
  state.velocityY *= damping

  if (Math.abs(state.velocityX) < 0.001) {
    state.velocityX = 0
  }

  if (Math.abs(state.velocityY) < 0.001) {
    state.velocityY = 0
  }

  return {
    x: state.velocityX * deltaSeconds,
    y: state.velocityY * deltaSeconds,
  }
}

export function releaseModelInteraction(state: ModelInteractionState) {
  state.mode = 'idle'
  state.pointerId = null
  state.lastX = 0
  state.lastY = 0
}

export function resetModelInteraction(state: ModelInteractionState) {
  releaseModelInteraction(state)
  state.velocityX = 0
  state.velocityY = 0
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}
