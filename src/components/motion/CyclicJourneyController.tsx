'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { useJourneyRuntime } from '@/lib/journeyRuntime'
import { chapterIds } from '@/lib/chapterRegistry'
import {
  DWELL_CENTER_OFFSET,
  decodeJourney,
  getDwellCenter,
  getMagneticTarget,
  getNearestOrdinalForIndex,
  SLOT_UNITS,
} from '@/lib/journeyTimeline'
import { useNarrativeStore } from '@/stores/narrativeStore'

const WHEEL_SETTLE_DELAY_MS = 140
const WHEEL_EVENT_CLAMP_PX = 120
const WHEEL_PIXELS_PER_SLOT = 720
const LINE_MODE_PIXELS = 16
const TOUCH_REFERENCE_PX = 420
const TOUCH_VIEWPORT_FRACTION = 0.48
const TOUCH_VELOCITY_WINDOW_MS = 120
const INPUT_VELOCITY_WINDOW_MS = 160

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
const DIALOG_SELECTOR = '[role="dialog"], dialog'
const ACTIVATION_SELECTOR = 'button, a, [role="button"]'

interface TouchSample {
  time: number
  units: number
}

interface InputSample {
  time: number
  units: number
}

function velocityFromSamples(samples: InputSample[], now: number): number {
  const recent = samples.filter((sample) => now - sample.time <= INPUT_VELOCITY_WINDOW_MS)

  if (recent.length < 2) {
    return 0
  }

  const first = recent[0]!
  const last = recent[recent.length - 1]!
  const elapsedSeconds = (last.time - first.time) / 1000

  return elapsedSeconds > 0 ? (last.units - first.units) / elapsedSeconds : 0
}

export default function CyclicJourneyController({ children }: { children: ReactNode }) {
  const runtime = useJourneyRuntime()
  const stageRef = useRef<HTMLDivElement | null>(null)
  const restUnitsRef = useRef(runtime.inputUnits.get())

  useEffect(() => {
    runtime.setPaused(useNarrativeStore.getState().overlay !== null)

    return useNarrativeStore.subscribe((state) => {
      runtime.setPaused(state.overlay !== null)
    })
  }, [runtime])

  useEffect(() => {
    return runtime.subscribeSettle(() => {
      const units = runtime.renderUnits.get()
      const direction = runtime.getLastInputDirection()
      const sample = decodeJourney(units, direction)
      const settledIndex = sample.mode === 'dwell' ? sample.currentIndex : sample.incomingIndex
      const settledChapterId = chapterIds[settledIndex]

      restUnitsRef.current = units

      if (settledChapterId) {
        useNarrativeStore.getState().setActiveChapter(settledChapterId)
      }

      useNarrativeStore.getState().publishSettledState({
        settledIndex,
        loopCount: sample.loopCount,
        direction,
      })
    })
  }, [runtime])

  useEffect(() => {
    const unsubscribe = runtime.renderUnits.on('change', () => {
      const sample = decodeJourney(runtime.renderUnits.get(), runtime.getLastInputDirection())

      if (sample.mode === 'transition') {
        const focusIndex =
          sample.easedTransitionT >= 0.5 ? sample.incomingIndex : sample.outgoingIndex

        useNarrativeStore
          .getState()
          .setVisiblePair(sample.outgoingIndex, sample.incomingIndex, focusIndex)
      }
    })

    return unsubscribe
  }, [runtime])

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) {
      return
    }

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let activePointerId: number | null = null
    let dragStartX = 0
    let dragStartY = 0
    let dragStartUnits = 0
    let verticalIntent = false
    let touchSamples: TouchSample[] = []
    let inputSamples: InputSample[] = []

    const unitsPerPixel = SLOT_UNITS / WHEEL_PIXELS_PER_SLOT

    const recordInputSample = (units: number) => {
      const now = performance.now()

      inputSamples.push({ time: now, units })

      while (
        inputSamples.length > 2 &&
        now - (inputSamples[0]?.time ?? now) > INPUT_VELOCITY_WINDOW_MS
      ) {
        inputSamples.shift()
      }
    }

    const measureInputVelocity = (): number => {
      const measured = velocityFromSamples(inputSamples, performance.now())

      return measured !== 0 ? measured : runtime.getVelocity()
    }

    const normalizeWheelDelta = (event: WheelEvent): number => {
      if (event.deltaMode === 1) {
        return event.deltaY * LINE_MODE_PIXELS
      }

      if (event.deltaMode === 2) {
        return event.deltaY * window.innerHeight
      }

      return event.deltaY
    }

    const navigateToMagneticTarget = (velocity: number) => {
      const units = runtime.renderUnits.get()

      runtime.navigateTo(
        getMagneticTarget(units, velocity, runtime.getLastInputDirection(), restUnitsRef.current),
      )
    }

    const scheduleMagneticSettle = (releaseVelocity?: number) => {
      if (settleTimer) {
        clearTimeout(settleTimer)
      }

      settleTimer = setTimeout(() => {
        navigateToMagneticTarget(releaseVelocity ?? measureInputVelocity())
      }, WHEEL_SETTLE_DELAY_MS)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || runtime.isPaused()) {
        return
      }

      const normalized = Math.max(
        -WHEEL_EVENT_CLAMP_PX,
        Math.min(WHEEL_EVENT_CLAMP_PX, normalizeWheelDelta(event)),
      )

      if (normalized === 0) {
        return
      }

      event.preventDefault()
      stage.dataset.wheelCount = String(Number(stage.dataset.wheelCount ?? '0') + 1)
      runtime.nudge(normalized * unitsPerPixel)
      recordInputSample(runtime.inputUnits.get())
      scheduleMagneticSettle()
    }

    const touchUnitsPerPixel = () =>
      SLOT_UNITS / Math.min(TOUCH_REFERENCE_PX, window.innerHeight * TOUCH_VIEWPORT_FRACTION)

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' || !event.isPrimary || runtime.isPaused()) {
        return
      }

      activePointerId = event.pointerId
      dragStartX = event.clientX
      dragStartY = event.clientY
      dragStartUnits = runtime.renderUnits.get()
      verticalIntent = false
      touchSamples = [{ time: performance.now(), units: dragStartUnits }]

      try {
        stage.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture is best-effort; drag tracking continues regardless.
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return
      }

      const deltaY = event.clientY - dragStartY

      if (!verticalIntent) {
        const deltaX = event.clientX - dragStartX

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          return
        }

        verticalIntent = true
      }

      const nextUnits = dragStartUnits - deltaY * touchUnitsPerPixel()
      const delta = nextUnits - runtime.renderUnits.get()

      if (delta !== 0) {
        runtime.nudge(delta)
      }

      const now = performance.now()

      touchSamples.push({ time: now, units: nextUnits })

      while (
        touchSamples.length > 2 &&
        now - (touchSamples[0]?.time ?? now) > TOUCH_VELOCITY_WINDOW_MS
      ) {
        touchSamples.shift()
      }
    }

    const finishPointerDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) {
        return
      }

      activePointerId = null

      const first = touchSamples[0]
      const last = touchSamples[touchSamples.length - 1]

      if (first && last && last.time > first.time) {
        const releaseVelocity = ((last.units - first.units) / (last.time - first.time)) * 1000

        navigateToMagneticTarget(releaseVelocity)
        return
      }

      scheduleMagneticSettle()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (runtime.isPaused() || event.metaKey || event.altKey) {
        return
      }

      const target = event.target

      if (
        target instanceof Element &&
        (target.closest(EDITABLE_SELECTOR) !== null || target.closest(DIALOG_SELECTOR) !== null)
      ) {
        return
      }

      const units = runtime.inputUnits.get()
      const currentOrdinal = Math.round((units - DWELL_CENTER_OFFSET) / SLOT_UNITS)
      let targetUnits: number | null = null

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown': {
          targetUnits = getDwellCenter(currentOrdinal + 1)
          break
        }
        case 'ArrowUp':
        case 'PageUp': {
          targetUnits = getDwellCenter(currentOrdinal - 1)
          break
        }
        case ' ': {
          if (target instanceof Element && target.closest(ACTIVATION_SELECTOR) !== null) {
            return
          }

          targetUnits = getDwellCenter(event.shiftKey ? currentOrdinal - 1 : currentOrdinal + 1)
          break
        }
        case 'Home': {
          targetUnits = getDwellCenter(getNearestOrdinalForIndex(units, 0))
          break
        }
        default: {
          if (/^[1-7]$/.test(event.key)) {
            targetUnits = getDwellCenter(getNearestOrdinalForIndex(units, Number(event.key) - 1))
          }
        }
      }

      if (targetUnits === null) {
        return
      }

      event.preventDefault()
      runtime.navigateTo(targetUnits)
      useNarrativeStore.getState().requestKeyboardFocus()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        activePointerId = null

        if (settleTimer) {
          clearTimeout(settleTimer)
        }
      }
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', finishPointerDrag)
    stage.addEventListener('pointercancel', finishPointerDrag)
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (settleTimer) {
        clearTimeout(settleTimer)
      }

      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', finishPointerDrag)
      stage.removeEventListener('pointercancel', finishPointerDrag)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [runtime])

  return (
    <div ref={stageRef} data-journey-controller="true" className="fixed inset-0 z-10">
      {children}
    </div>
  )
}
