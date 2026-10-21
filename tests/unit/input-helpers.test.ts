import { describe, expect, it } from 'vitest'

import {
  UNITS_PER_WHEEL_PX,
  WHEEL_EVENT_CLAMP_PX,
  clampWheelDelta,
  normalizeWheelDelta,
  scrollRegionCanConsume,
  wheelDeltaToUnits,
} from '@/runtime/input/wheel'
import { createVelocityTracker } from '@/runtime/input/velocity'
import { resolveTouchIntent, touchDragUnits, touchUnitsPerPixel } from '@/runtime/input/touch'
import {
  isActivationTarget,
  isEditableTarget,
  isGuardedSurface,
  resolveKeyIntent,
} from '@/runtime/input/keyboard'

describe('wheel math', () => {
  it('keeps the verified legacy conversion (50 units per 500px)', () => {
    expect(UNITS_PER_WHEEL_PX).toBeCloseTo(0.1)
    expect(wheelDeltaToUnits(100, 0, 800)).toBeCloseTo(WHEEL_EVENT_CLAMP_PX * 0.1)
    expect(wheelDeltaToUnits(40, 0, 800)).toBeCloseTo(4)
  })

  it('normalizes line and page delta modes', () => {
    expect(normalizeWheelDelta(3, 1, 800)).toBe(48)
    expect(normalizeWheelDelta(2, 2, 800)).toBe(1600)
    expect(normalizeWheelDelta(7, 0, 800)).toBe(7)
  })

  it('clamps per-event bursts', () => {
    expect(clampWheelDelta(400)).toBe(WHEEL_EVENT_CLAMP_PX)
    expect(clampWheelDelta(-400)).toBe(-WHEEL_EVENT_CLAMP_PX)
    expect(clampWheelDelta(10)).toBe(10)
  })

  it('arbitrates scroll regions by direction and remaining scroll', () => {
    const element = {
      scrollTop: 0,
      clientHeight: 100,
      scrollHeight: 100,
    } as HTMLElement

    // Fully scrolled content cannot consume anything.
    expect(scrollRegionCanConsume(element, 50)).toBe(false)
    expect(scrollRegionCanConsume(element, -50)).toBe(false)

    const scrollable = {
      scrollTop: 10,
      clientHeight: 100,
      scrollHeight: 300,
    } as HTMLElement

    expect(scrollRegionCanConsume(scrollable, 50)).toBe(true)
    expect(scrollRegionCanConsume(scrollable, -50)).toBe(true)

    const atTop = {
      scrollTop: 0,
      clientHeight: 100,
      scrollHeight: 300,
    } as HTMLElement

    expect(scrollRegionCanConsume(atTop, -50)).toBe(false)
    expect(scrollRegionCanConsume(atTop, 50)).toBe(true)
  })
})

describe('velocity tracker', () => {
  it('estimates signed units/second across the window', () => {
    const tracker = createVelocityTracker(120)

    expect(tracker.estimate(0)).toBe(0)

    tracker.record(25, 0)
    expect(tracker.estimate(100)).toBe(0)

    tracker.record(75, 100)
    expect(tracker.estimate(100)).toBeCloseTo(500)

    tracker.record(75, 1000)
    // Old samples fall out of the window; identical units → zero velocity.
    expect(tracker.estimate(1000)).toBeCloseTo(0)
  })

  it('resets cleanly', () => {
    const tracker = createVelocityTracker(120)

    tracker.record(25, 0)
    tracker.record(75, 50)
    tracker.reset()

    expect(tracker.sampleCount()).toBe(0)
    expect(tracker.estimate(1000)).toBe(0)
  })

  it('survives ring-buffer wraparound without losing the newest sample', () => {
    const tracker = createVelocityTracker(120)

    for (let index = 0; index < 20; index += 1) {
      tracker.record(index * 10, index * 10)
    }

    const estimate = tracker.estimate(195)
    expect(estimate).toBeGreaterThan(0)
    expect(tracker.sampleCount()).toBe(8)
  })
})

describe('touch math', () => {
  it('locks vertical intent only when vertical motion dominates', () => {
    expect(resolveTouchIntent(0, 20)).toBe('vertical')
    expect(resolveTouchIntent(0, 5)).toBeNull()
    expect(resolveTouchIntent(30, 10)).toBe('horizontal')
    expect(resolveTouchIntent(10, 30)).toBe('vertical')
  })

  it('maps upward drags to forward travel', () => {
    // Viewport 800px → scale = 50 / min(350, 400) = 50/350 units/px.
    const scale = touchUnitsPerPixel(800)
    expect(scale).toBeCloseTo(50 / 350)

    expect(touchDragUnits(25, -350, 800)).toBeCloseTo(75)
    expect(touchDragUnits(25, 350, 800)).toBeCloseTo(-25)

    // Small viewport (600px): scale = 50 / min(350, 300) = 50/300.
    expect(touchUnitsPerPixel(600)).toBeCloseTo(50 / 300)
  })
})

describe('keyboard intents', () => {
  const keydown = (key: string, target?: Element) =>
    ({ key, target: target ?? null, shiftKey: false }) as unknown as KeyboardEvent

  it('maps navigation keys', () => {
    expect(resolveKeyIntent(keydown('ArrowDown'), 7)).toEqual({ kind: 'next' })
    expect(resolveKeyIntent(keydown('ArrowRight'), 7)).toEqual({ kind: 'next' })
    expect(resolveKeyIntent(keydown('PageDown'), 7)).toEqual({ kind: 'next' })
    expect(resolveKeyIntent(keydown('ArrowUp'), 7)).toEqual({ kind: 'prev' })
    expect(resolveKeyIntent(keydown('PageUp'), 7)).toEqual({ kind: 'prev' })
    expect(resolveKeyIntent(keydown('Home'), 7)).toEqual({ kind: 'home' })
    expect(resolveKeyIntent(keydown('Escape'), 7)).toEqual({ kind: 'overlay-dismiss' })
  })

  it('maps digits up to the chapter count', () => {
    expect(resolveKeyIntent(keydown('3'), 7)).toEqual({ kind: 'digit', index: 2 })
    expect(resolveKeyIntent(keydown('8'), 7)).toBeNull()
    expect(resolveKeyIntent(keydown('0'), 7)).toBeNull()
    expect(resolveKeyIntent(keydown('q'), 7)).toBeNull()
  })

  it('ignores space over activation targets', () => {
    const button = document.createElement('button')
    expect(resolveKeyIntent(keydown(' ', button), 7)).toBeNull()

    const plain = document.createElement('div')
    expect(resolveKeyIntent(keydown(' ', plain), 7)).toEqual({ kind: 'next' })
  })

  it('classifies guarded surfaces', () => {
    const input = document.createElement('input')
    const textarea = document.createElement('textarea')
    const contentEditable = document.createElement('div')
    contentEditable.setAttribute('contenteditable', 'true')
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    const controls = document.createElement('div')
    controls.setAttribute('data-animation-controls', '')
    const button = document.createElement('button')
    const plain = document.createElement('section')

    expect(isEditableTarget(input)).toBe(true)
    expect(isEditableTarget(textarea)).toBe(true)
    expect(isEditableTarget(contentEditable)).toBe(true)
    expect(isEditableTarget(plain)).toBe(false)

    expect(isGuardedSurface(dialog)).toBe(true)
    expect(isGuardedSurface(controls)).toBe(true)
    expect(isGuardedSurface(plain)).toBe(false)

    expect(isActivationTarget(button)).toBe(true)
    expect(isActivationTarget(plain)).toBe(false)
  })
})
