'use client'

/**
 * Journey runtime (new_plan.md §7.4, §6) — the client kernel that owns the
 * single continuous journey value.
 *
 * Architecture (differences from the retired `lib/journeyRuntime.tsx`):
 *   - Topology is INJECTED (`chapterIds` prop): count and roster are data.
 *   - Settle detection polls through the shared scheduler (one rAF for the
 *     whole product) instead of a private rAF loop; the two-consecutive-frames
 *     epsilon logic is the verified legacy behavior.
 *   - The frame fan-out decodes the timeline exactly ONCE per spring change
 *     (one small allocation per moving frame, zero everywhere else) and
 *     fills reused per-subscription `JourneyFrame` records.
 *   - Settles publish atomically to the narrative store (id, index, loop,
 *     direction decoded from the timeline — never inferred by comparing
 *     indices, which was wrong across the cyclic seam).
 *   - Pause snaps input to the current render value so unpause cannot resume
 *     an in-flight spring (legacy bug: pausing froze the rest watcher but
 *     the spring kept animating toward the old target).
 *
 * Magnetic-settle POLICY stays with the input coordinator (P4): this runtime
 * exposes `navigateToUnits` for it and never hides snapping inside nudges.
 */

import { useMotionValue, useSpring, type MotionValue } from 'motion/react'
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

import {
  DWELL_CENTER_OFFSET,
  SETTLE_POSITION_EPSILON,
  SETTLE_VELOCITY_EPSILON,
  SLOT_UNITS,
  decodeJourney,
  getDwellCenter,
  getIndexFloat,
  getNearestOrdinalForIndex,
  getTravelPulse,
  initialUnits,
} from '@/journey/timeline'
import { assertTimelineInvariants } from '@/journey/invariants'
import { createTopology, type JourneyTopology } from '@/journey/topology'
import type { JourneySample } from '@/journey/types'
import type { JourneyDirection, JourneyFrame } from '@/types/experience'

import { subscribeTick } from './scheduler'
import { useNarrativeStore } from './stores/narrative'

const SPRING_CONFIG = { stiffness: 115, damping: 24, mass: 0.9 }

export interface SettleInfo {
  index: number
  chapterId: string
  loopCount: number
  direction: JourneyDirection
}

export interface NavigateOptions {
  /**
   * true (default): resolve the chapter index to its nearest cyclic ordinal
   * from the current position. false: resolve to the ordinal reached by
   * traveling FORWARD only (loop-counter semantics for shortcuts).
   */
  nearest?: boolean
}

export interface JourneyRuntimeApi {
  /** Spring-smoothed render value; DOM choreography may bind directly. */
  unitsValue: MotionValue<number>
  getTopology(): JourneyTopology
  chapterCount(): number
  getUnits(): number
  getInputUnits(): number
  getVelocity(): number
  getLastInputDirection(): JourneyDirection
  isMoving(): boolean
  isPaused(): boolean
  /** Signals that a gesture is in flight even without a unit delta yet
   * (trackpad inertia, Safari gesture events). */
  markMoving(): void
  nudge(deltaUnits: number): void
  navigateToIndex(index: number, opts?: NavigateOptions): void
  /** Animated travel to arbitrary units (magnetic targets land on centers). */
  navigateToUnits(targetUnits: number): void
  /** Instant travel (reduced motion); publishes settle synchronously. */
  jumpToIndex(index: number, opts?: NavigateOptions): void
  jumpToUnits(targetUnits: number): void
  setPaused(paused: boolean): void
  subscribeSettle(listener: (info: SettleInfo) => void): () => void
  /** Frame fan-out while the journey moves (reused record per listener). */
  subscribeFrame(listener: (frame: JourneyFrame) => void): () => void
}

const JourneyRuntimeContext = createContext<JourneyRuntimeApi | null>(null)

interface JourneyRuntimeProviderProps {
  children: ReactNode
  /** Ordered chapter ids — the single source of truth for topology. */
  chapterIds: readonly string[]
}

/**
 * Fills a reused frame record from a decoded sample. No decoding, no
 * allocation — safe to call for every listener on every frame.
 */
function fillFrameFromSample(
  sample: JourneySample,
  units: number,
  velocity: number,
  record: JourneyFrame,
): void {
  record.units = units
  record.velocity = velocity
  record.direction = sample.direction
  record.mode = sample.mode
  record.loopCount = sample.loopCount
  record.travelPulse = getTravelPulse(sample)
  record.indexFloat = getIndexFloat(units)

  if (sample.mode === 'dwell') {
    record.currentIndex = sample.currentIndex
    record.outgoingIndex = sample.currentIndex
    record.incomingIndex = sample.currentIndex
  } else {
    record.currentIndex = sample.incomingIndex
    record.outgoingIndex = sample.outgoingIndex
    record.incomingIndex = sample.incomingIndex
  }
}

export function JourneyRuntimeProvider({ children, chapterIds }: JourneyRuntimeProviderProps) {
  const topology = useMemo(() => createTopology(chapterIds), [chapterIds])
  const count = topology.count

  // Dev-boot domain sweep for the real count (plan §7.3): runs once, never in
  // production.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      assertTimelineInvariants(count)
    }
  }, [count])

  const inputUnits = useMotionValue(initialUnits(count))
  const renderUnits = useSpring(inputUnits, SPRING_CONFIG)

  const pausedRef = useRef(false)
  const movingRef = useRef(false)
  const restFramesRef = useRef(0)
  const lastDirectionRef = useRef<JourneyDirection>(0)
  const settleUnsubscribeRef = useRef<(() => void) | null>(null)
  const settleListenersRef = useRef(new Set<(info: SettleInfo) => void>())
  const frameListenersRef = useRef(
    new Map<(frame: JourneyFrame) => void, { record: JourneyFrame }>(),
  )
  const lastPublishedPairRef = useRef('')
  const lastPublishedFocusRef = useRef('')

  const stopSettleWatcher = () => {
    if (settleUnsubscribeRef.current) {
      settleUnsubscribeRef.current()
      settleUnsubscribeRef.current = null
    }
  }

  const publishSettleFromSample = (sample: JourneySample) => {
    const narrative = useNarrativeStore.getState()

    if (sample.mode === 'dwell') {
      const chapterId = topology.idByIndex(sample.currentIndex)

      narrative.applySettled({
        chapterId,
        index: sample.currentIndex,
        loopCount: sample.loopCount,
        direction: sample.direction,
      })
      narrative.applyWindow(
        topology.windowIndices(sample.currentIndex, 1).map((index) => topology.idByIndex(index)),
      )
      lastPublishedPairRef.current = ''
      lastPublishedFocusRef.current = chapterId

      const info: SettleInfo = {
        index: sample.currentIndex,
        chapterId,
        loopCount: sample.loopCount,
        direction: sample.direction,
      }

      for (const listener of settleListenersRef.current) listener(info)
      return
    }

    // Settled inside a seam (a coordinator that skipped magnetic settling):
    // publish the visible pair truthfully instead of inventing a dwell.
    const outgoingId = topology.idByIndex(sample.outgoingIndex)
    const incomingId = topology.idByIndex(sample.incomingIndex)
    const focusableId = sample.easedTransitionT < 0.5 ? outgoingId : incomingId

    narrative.applyVisiblePair(outgoingId, incomingId, focusableId)
    lastPublishedPairRef.current = `${outgoingId}>${incomingId}`
    lastPublishedFocusRef.current = focusableId

    const info: SettleInfo = {
      index: sample.incomingIndex,
      chapterId: incomingId,
      loopCount: sample.loopCount,
      direction: sample.direction,
    }

    for (const listener of settleListenersRef.current) listener(info)
  }

  const startSettleWatcher = () => {
    if (settleUnsubscribeRef.current !== null) return

    restFramesRef.current = 0

    settleUnsubscribeRef.current = subscribeTick(() => {
      if (!movingRef.current) {
        stopSettleWatcher()
        return
      }

      const render = renderUnits.get()
      const input = inputUnits.get()
      const velocity = renderUnits.getVelocity()
      const settled =
        Math.abs(render - input) < SETTLE_POSITION_EPSILON &&
        Math.abs(velocity) < SETTLE_VELOCITY_EPSILON

      restFramesRef.current = settled ? restFramesRef.current + 1 : 0

      if (restFramesRef.current >= 2) {
        stopSettleWatcher()
        movingRef.current = false
        publishSettleFromSample(decodeJourney(render, count, lastDirectionRef.current))
      }
    })
  }

  const recordDirection = (delta: number) => {
    if (delta > 0) lastDirectionRef.current = 1
    else if (delta < 0) lastDirectionRef.current = -1
  }

  const beginTravel = (targetUnits: number) => {
    recordDirection(targetUnits - inputUnits.get())
    movingRef.current = true
    restFramesRef.current = 0
    startSettleWatcher()
    inputUnits.set(targetUnits)
  }

  // Frame fan-out: ONE decode per spring change; reused records per listener.
  useEffect(() => {
    const emit = () => {
      const units = renderUnits.get()
      const velocity = renderUnits.getVelocity()
      const direction = lastDirectionRef.current
      const sample = decodeJourney(units, count, direction)

      // Pass 1 — fill every record first, so a listener that (legitimately)
      // captured another subscriber's record observes this frame's values
      // rather than a half-updated mixture.
      for (const entry of frameListenersRef.current.values()) {
        fillFrameFromSample(sample, units, velocity, entry.record)
      }

      // Pass 2 — notify listeners; records are per-subscription and mutated in
      // place, so notification allocates nothing.
      for (const [listener, entry] of frameListenersRef.current) {
        listener(entry.record)
      }

      // Transition bookkeeping publishes at most a few times per hop: pair
      // identity, then the focus handoff at the eased midpoint.
      if (sample.mode === 'transition' && movingRef.current) {
        const outgoingId = topology.idByIndex(sample.outgoingIndex)
        const incomingId = topology.idByIndex(sample.incomingIndex)
        const pairKey = `${outgoingId}>${incomingId}`

        if (pairKey !== lastPublishedPairRef.current) {
          lastPublishedPairRef.current = pairKey
          lastPublishedFocusRef.current = outgoingId
          useNarrativeStore.getState().applyVisiblePair(outgoingId, incomingId, outgoingId)
        } else {
          const focusableId = sample.easedTransitionT < 0.5 ? outgoingId : incomingId

          if (focusableId !== lastPublishedFocusRef.current) {
            lastPublishedFocusRef.current = focusableId
            useNarrativeStore.getState().applyVisiblePair(outgoingId, incomingId, focusableId)
          }
        }
      }
    }

    return renderUnits.on('change', emit)
  }, [renderUnits, count, topology])

  // Initial publication: the deck must know its landing chapter at mount.
  useEffect(() => {
    publishSettleFromSample(decodeJourney(initialUnits(count), count, 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by design
  }, [])

  useEffect(() => {
    const settleListeners = settleListenersRef.current
    const frameListeners = frameListenersRef.current

    return () => {
      stopSettleWatcher()
      settleListeners.clear()
      frameListeners.clear()
    }
  }, [])

  const api = useMemo<JourneyRuntimeApi>(() => {
    const resolveOrdinal = (index: number, nearest: boolean): number => {
      const cyclicIndex = ((Math.trunc(index) % count) + count) % count
      const base = Math.round((inputUnits.get() - DWELL_CENTER_OFFSET) / SLOT_UNITS)

      if (nearest) {
        return getNearestOrdinalForIndex(inputUnits.get(), cyclicIndex, count)
      }

      // Forward-only resolution: used by digit shortcuts where pressing "3"
      // means "the third chapter, traveling forward".
      return base + ((((cyclicIndex - (base % count)) % count) + count) % count)
    }

    return {
      unitsValue: renderUnits,

      getTopology: () => topology,
      chapterCount: () => count,

      getUnits: () => renderUnits.get(),
      getInputUnits: () => inputUnits.get(),
      getVelocity: () => renderUnits.getVelocity(),
      getLastInputDirection: () => lastDirectionRef.current,
      isMoving: () => movingRef.current,
      isPaused: () => pausedRef.current,

      markMoving() {
        if (pausedRef.current) return

        movingRef.current = true
        restFramesRef.current = 0
        startSettleWatcher()
      },

      nudge(deltaUnits) {
        if (pausedRef.current || deltaUnits === 0) return

        beginTravel(inputUnits.get() + deltaUnits)
      },

      navigateToIndex(index, opts) {
        if (pausedRef.current) return

        beginTravel(getDwellCenter(resolveOrdinal(index, opts?.nearest ?? true)))
      },

      navigateToUnits(targetUnits) {
        if (pausedRef.current) return

        beginTravel(targetUnits)
      },

      jumpToIndex(index, opts) {
        if (pausedRef.current) return

        const target = getDwellCenter(resolveOrdinal(index, opts?.nearest ?? true))

        recordDirection(target - inputUnits.get())
        movingRef.current = false
        restFramesRef.current = 0
        lastPublishedPairRef.current = ''
        inputUnits.jump(target)
        renderUnits.jump(target)
        publishSettleFromSample(decodeJourney(target, count, lastDirectionRef.current))
      },

      jumpToUnits(targetUnits) {
        if (pausedRef.current) return

        recordDirection(targetUnits - inputUnits.get())
        movingRef.current = false
        restFramesRef.current = 0
        lastPublishedPairRef.current = ''
        inputUnits.jump(targetUnits)
        renderUnits.jump(targetUnits)
        publishSettleFromSample(decodeJourney(targetUnits, count, lastDirectionRef.current))
      },

      setPaused(paused) {
        if (pausedRef.current === paused) return

        pausedRef.current = paused

        if (paused) {
          // Freeze truthfully: input snaps to the rendered position so no
          // in-flight spring resumes on unpause.
          const currentRender = renderUnits.get()
          renderUnits.stop()
          inputUnits.jump(currentRender)

          if (movingRef.current) {
            movingRef.current = false
            stopSettleWatcher()
            publishSettleFromSample(decodeJourney(currentRender, count, lastDirectionRef.current))
          }
        }
      },

      subscribeSettle(listener) {
        settleListenersRef.current.add(listener)

        return () => {
          settleListenersRef.current.delete(listener)
        }
      },

      subscribeFrame(listener) {
        const record: JourneyFrame = {
          units: 0,
          velocity: 0,
          direction: 0,
          mode: 'dwell',
          currentIndex: 0,
          outgoingIndex: 0,
          incomingIndex: 0,
          travelPulse: 0,
          loopCount: 0,
          indexFloat: 0,
        }

        // Initialize with current truth so subscribers never observe a
        // zeroed frame before the first spring change.
        fillFrameFromSample(
          decodeJourney(renderUnits.get(), count, lastDirectionRef.current),
          renderUnits.get(),
          renderUnits.getVelocity(),
          record,
        )

        frameListenersRef.current.set(listener, { record })

        return () => {
          frameListenersRef.current.delete(listener)
        }
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- motion values, refs and topology identity are stable for the provider's life
  }, [renderUnits, inputUnits, topology, count])

  return <JourneyRuntimeContext.Provider value={api}>{children}</JourneyRuntimeContext.Provider>
}

export function useJourneyRuntime(): JourneyRuntimeApi {
  const api = useContext(JourneyRuntimeContext)

  if (!api) {
    throw new Error('useJourneyRuntime requires a JourneyRuntimeProvider ancestor.')
  }

  return api
}
