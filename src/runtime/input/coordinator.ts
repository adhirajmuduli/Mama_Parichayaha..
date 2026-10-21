'use client'

/**
 * Journey input coordinator (new_plan.md §7.4) — the ONLY module that
 * attaches journey input listeners.
 *
 * Ports the legacy `CyclicJourneyController` gesture feel (wheel clamp 80px,
 * 50 units per 500px, 100ms magnetic settle debounce, touch vertical-intent
 * lock, keyboard ordinal steps) with the rewrite's fixes:
 *   - no `dataset` instrumentation writes on the hot path,
 *   - scroll arbitration via the new `[data-scroll-region]` contract,
 *   - overlay pausing through the new narrative store,
 *   - reduced-motion uses instant jumps (no spring animation),
 *   - dialog/control-surface guards use the new attribute names,
 *   - the runtime is injected (testable without a provider).
 *
 * The stage (P5) renders a host element and passes its ref here; the
 * coordinator owns wheel/pointer listeners on that element and the
 * keyboard/hash listeners on window.
 */

import { useEffect, useRef, type RefObject } from 'react'

import {
  DWELL_CENTER_OFFSET,
  SLOT_UNITS,
  getDwellCenter,
  getMagneticTarget,
} from '@/journey/timeline'
import type { JourneyRuntimeApi } from '../journeyRuntime'
import { useNarrativeStore } from '../stores/narrative'
import { useCapabilities } from '../capabilities'

import { createVelocityTracker } from './velocity'
import { scrollRegionCanConsume, wheelDeltaToUnits } from './wheel'
import { resolveTouchIntent, touchDragUnits } from './touch'
import { isEditableTarget, isGuardedSurface, resolveKeyIntent } from './keyboard'

const WHEEL_SETTLE_DELAY_MS = 100
const TOUCH_VELOCITY_WINDOW_MS = 100
const INPUT_VELOCITY_WINDOW_MS = 120

const DRAG_SURFACE_SELECTOR =
  'a, button, input, textarea, select, [data-scroll-region], [data-animation-controls], [data-spiral-surface], [data-lanyard]'

export interface JourneyInputOptions {
  runtime: JourneyRuntimeApi
  /** Immersive mode active; listeners attach only when true. */
  enabled: boolean
  /** The stage root that receives wheel/pointer events. */
  hostRef: RefObject<HTMLElement | null>
}

export function useJourneyInput({ runtime, enabled, hostRef }: JourneyInputOptions): void {
  const capabilities = useCapabilities()
  const reducedMotionRef = useRef(capabilities.reducedMotion)
  reducedMotionRef.current = capabilities.reducedMotion

  const restUnitsRef = useRef(runtime.getUnits())

  // Track the last settle so magnetic targets hold their hysteresis anchor.
  useEffect(() => {
    if (!enabled) return

    return runtime.subscribeSettle((info) => {
      restUnitsRef.current = runtime.getUnits()
      void info
    })
  }, [runtime, enabled])

  // Overlays pause the journey: dialogs own the keyboard and gestures.
  useEffect(() => {
    if (!enabled) return

    runtime.setPaused(useNarrativeStore.getState().overlay !== null)

    return useNarrativeStore.subscribe((state) => {
      runtime.setPaused(state.overlay !== null)
    })
  }, [runtime, enabled])

  useEffect(() => {
    const host = hostRef.current

    if (!host || !enabled) {
      return
    }

    const count = runtime.chapterCount()
    const topology = runtime.getTopology()
    const inputVelocity = createVelocityTracker(INPUT_VELOCITY_WINDOW_MS)
    const touchVelocity = createVelocityTracker(TOUCH_VELOCITY_WINDOW_MS)

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let activePointerId: number | null = null
    let dragStartX = 0
    let dragStartY = 0
    let dragStartUnits = 0
    let verticalIntent = false

    const currentOrdinal = () =>
      Math.round((runtime.getInputUnits() - DWELL_CENTER_OFFSET) / SLOT_UNITS)

    const magneticSettle = (velocity: number) => {
      const target = getMagneticTarget(
        runtime.getInputUnits(),
        velocity,
        runtime.getLastInputDirection(),
        count,
        restUnitsRef.current,
      )

      if (reducedMotionRef.current) {
        runtime.jumpToUnits(target)
        useNarrativeStore.getState().requestKeyboardFocus()
        return
      }

      runtime.navigateToUnits(target)
    }

    const scheduleMagneticSettle = (velocity?: number) => {
      if (settleTimer) {
        clearTimeout(settleTimer)
      }

      settleTimer = setTimeout(() => {
        magneticSettle(velocity ?? inputVelocity.estimate(performance.now()))
      }, WHEEL_SETTLE_DELAY_MS)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || runtime.isPaused()) {
        return
      }

      if (event.target instanceof Element) {
        const scroller = event.target.closest<HTMLElement>('[data-scroll-region]')

        if (scroller) {
          const rawDelta =
            event.deltaMode === 1
              ? event.deltaY * 16
              : event.deltaMode === 2
                ? event.deltaY * window.innerHeight
                : event.deltaY

          if (scrollRegionCanConsume(scroller, rawDelta)) {
            return
          }
        }
      }

      event.preventDefault()

      const units = wheelDeltaToUnits(event.deltaY, event.deltaMode, window.innerHeight)

      if (units === 0) {
        return
      }

      runtime.markMoving()
      runtime.nudge(units)
      inputVelocity.record(runtime.getInputUnits(), performance.now())
      scheduleMagneticSettle()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary || runtime.isPaused()) {
        return
      }

      if (event.target instanceof Element && event.target.closest(DRAG_SURFACE_SELECTOR)) {
        return
      }

      activePointerId = event.pointerId
      dragStartX = event.clientX
      dragStartY = event.clientY
      dragStartUnits = runtime.getUnits()
      verticalIntent = false
      touchVelocity.reset()
      touchVelocity.record(dragStartUnits, performance.now())
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return
      }

      const deltaY = event.clientY - dragStartY

      if (!verticalIntent) {
        const deltaX = event.clientX - dragStartX
        const intent = resolveTouchIntent(deltaX, deltaY)

        if (intent !== 'vertical') {
          return
        }

        verticalIntent = true

        try {
          host.setPointerCapture(event.pointerId)
        } catch {
          /* Capture can be lost during navigation. */
        }
      }

      const nextUnits = touchDragUnits(dragStartUnits, deltaY, window.innerHeight)
      const delta = nextUnits - runtime.getInputUnits()

      if (delta !== 0) {
        runtime.nudge(delta)
      }

      touchVelocity.record(nextUnits, performance.now())
    }

    const finishPointerDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return
      }

      activePointerId = null

      if (host.hasPointerCapture?.(event.pointerId)) {
        host.releasePointerCapture(event.pointerId)
      }

      if (!verticalIntent) {
        return
      }

      const releaseVelocity = touchVelocity.estimate(performance.now())

      if (releaseVelocity !== 0) {
        magneticSettle(releaseVelocity)
        return
      }

      scheduleMagneticSettle()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey) {
        return
      }

      // Escape must work while paused: the open overlay is exactly what
      // pauses the runtime, and dismissing it is how the user unpauses.
      if (event.key === 'Escape') {
        if (useNarrativeStore.getState().overlay !== null) {
          event.preventDefault()
          useNarrativeStore.getState().setOverlay(null)
        }

        return
      }

      if (runtime.isPaused()) {
        return
      }

      if (isEditableTarget(event.target) || isGuardedSurface(event.target)) {
        return
      }

      const intent = resolveKeyIntent(event, count)

      if (!intent) {
        return
      }

      event.preventDefault()

      switch (intent.kind) {
        case 'next': {
          const target = getDwellCenter(currentOrdinal() + 1)
          if (reducedMotionRef.current) runtime.jumpToUnits(target)
          else runtime.navigateToUnits(target)
          useNarrativeStore.getState().requestKeyboardFocus()
          break
        }

        case 'prev': {
          const target = getDwellCenter(currentOrdinal() - 1)
          if (reducedMotionRef.current) runtime.jumpToUnits(target)
          else runtime.navigateToUnits(target)
          useNarrativeStore.getState().requestKeyboardFocus()
          break
        }

        case 'home': {
          if (reducedMotionRef.current) runtime.jumpToIndex(0)
          else runtime.navigateToIndex(0)
          useNarrativeStore.getState().requestKeyboardFocus()
          break
        }

        case 'digit': {
          if (reducedMotionRef.current) runtime.jumpToIndex(intent.index, { nearest: false })
          else runtime.navigateToIndex(intent.index, { nearest: false })
          useNarrativeStore.getState().requestKeyboardFocus()
          break
        }
      }
    }

    const syncHash = () => {
      const hash = window.location.hash
      if (!hash.startsWith('#')) return

      const chapterId = topology.chapterIds.find((id) => `#${id}` === hash)
      if (!chapterId) return

      const index = topology.indexForIdOrThrow(chapterId)

      if (reducedMotionRef.current) runtime.jumpToIndex(index)
      else runtime.navigateToIndex(index)

      useNarrativeStore.getState().requestKeyboardFocus()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        activePointerId = null

        if (settleTimer) {
          clearTimeout(settleTimer)
          settleTimer = undefined
        }

        runtime.setPaused(true)
      } else {
        runtime.setPaused(useNarrativeStore.getState().overlay !== null)
      }
    }

    host.addEventListener('wheel', onWheel, { passive: false })
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerup', finishPointerDrag)
    host.addEventListener('pointercancel', finishPointerDrag)
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('hashchange', syncHash)

    syncHash()

    return () => {
      if (settleTimer) {
        clearTimeout(settleTimer)
      }

      host.removeEventListener('wheel', onWheel)
      host.removeEventListener('pointerdown', onPointerDown)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerup', finishPointerDrag)
      host.removeEventListener('pointercancel', finishPointerDrag)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('hashchange', syncHash)
    }
  }, [runtime, enabled, hostRef])
}
