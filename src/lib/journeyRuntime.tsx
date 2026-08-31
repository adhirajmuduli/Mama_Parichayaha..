'use client'

import { useMotionValue, useSpring } from 'motion/react'
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { MotionValue } from 'motion/react'

import {
  INITIAL_UNITS,
  SETTLE_POSITION_EPSILON,
  SETTLE_VELOCITY_EPSILON,
  type JourneyDirection,
} from '@/lib/journeyTimeline'

const SPRING_CONFIG = { stiffness: 115, damping: 24, mass: 0.9 }

export interface JourneyRuntimeApi {
  inputUnits: MotionValue<number>
  renderUnits: MotionValue<number>
  getVelocity(): number
  getLastInputDirection(): JourneyDirection
  nudge(deltaUnits: number): void
  navigateTo(targetUnits: number): void
  jumpTo(targetUnits: number): void
  setPaused(paused: boolean): void
  isPaused(): boolean
  isMoving(): boolean
  markMoving(): void
  subscribeSettle(listener: () => void): () => void
}

const JourneyRuntimeContext = createContext<JourneyRuntimeApi | null>(null)

export function JourneyRuntimeProvider({ children }: { children: ReactNode }) {
  const inputUnits = useMotionValue(INITIAL_UNITS)
  const renderUnits = useSpring(inputUnits, SPRING_CONFIG)
  const pausedRef = useRef(false)
  const movingRef = useRef(false)
  const restFramesRef = useRef(0)
  const lastDirectionRef = useRef<JourneyDirection>(0)
  const restLoopRef = useRef<number | null>(null)
  const settleListenersRef = useRef(new Set<() => void>())
  const settleStateRef = useRef({ pausedRef, movingRef, restFramesRef, settleListenersRef })
  settleStateRef.current = {
    pausedRef,
    movingRef,
    restFramesRef,
    settleListenersRef,
  }

  const completeSettle = () => {
    const state = settleStateRef.current

    if (restLoopRef.current !== null) {
      cancelAnimationFrame(restLoopRef.current)
      restLoopRef.current = null
    }

    if (!state.movingRef.current) {
      return
    }

    state.movingRef.current = false
    state.restFramesRef.current = 0

    for (const listener of state.settleListenersRef.current) {
      listener()
    }
  }

  const startRestLoop = () => {
    if (restLoopRef.current !== null) {
      return
    }

    const tick = () => {
      restLoopRef.current = null
      const state = settleStateRef.current

      if (!state.movingRef.current) {
        return
      }

      const settled =
        Math.abs(renderUnits.get() - inputUnits.get()) < SETTLE_POSITION_EPSILON &&
        Math.abs(renderUnits.getVelocity()) < SETTLE_VELOCITY_EPSILON

      if (settled) {
        state.restFramesRef.current += 1
      } else {
        state.restFramesRef.current = 0
      }

      if (state.restFramesRef.current >= 2) {
        completeSettle()
        return
      }

      restLoopRef.current = requestAnimationFrame(tick)
    }

    restLoopRef.current = requestAnimationFrame(tick)
  }

  const runtimeRef = useRef({ startRestLoop })
  runtimeRef.current = { startRestLoop }

  const api = useMemo<JourneyRuntimeApi>(() => {
    const recordDirection = (delta: number) => {
      if (delta > 0) {
        lastDirectionRef.current = 1
      } else if (delta < 0) {
        lastDirectionRef.current = -1
      }
    }

    return {
      inputUnits,
      renderUnits,
      getVelocity: () => renderUnits.getVelocity(),
      getLastInputDirection: () => lastDirectionRef.current,
      nudge(deltaUnits: number) {
        if (pausedRef.current || deltaUnits === 0) {
          return
        }

        recordDirection(deltaUnits)
        movingRef.current = true
        restFramesRef.current = 0
        runtimeRef.current.startRestLoop()
        inputUnits.set(inputUnits.get() + deltaUnits)
      },
      navigateTo(targetUnits: number) {
        if (pausedRef.current) {
          return
        }

        recordDirection(targetUnits - inputUnits.get())
        movingRef.current = true
        restFramesRef.current = 0
        runtimeRef.current.startRestLoop()
        inputUnits.set(targetUnits)
      },
      jumpTo(targetUnits: number) {
        if (pausedRef.current) {
          return
        }

        recordDirection(targetUnits - inputUnits.get())
        movingRef.current = false
        restFramesRef.current = 0
        inputUnits.jump(targetUnits)
        renderUnits.jump(targetUnits)
      },
      setPaused(paused: boolean) {
        pausedRef.current = paused
      },
      isPaused: () => pausedRef.current,
      isMoving: () => movingRef.current,
      markMoving() {
        movingRef.current = true
        restFramesRef.current = 0
        runtimeRef.current.startRestLoop()
      },
      subscribeSettle(listener: () => void) {
        settleListenersRef.current.add(listener)

        return () => {
          settleListenersRef.current.delete(listener)
        }
      },
    }
  }, [inputUnits, renderUnits])

  useEffect(() => {
    return () => {
      if (restLoopRef.current !== null) {
        cancelAnimationFrame(restLoopRef.current)
        restLoopRef.current = null
      }
    }
  }, [])

  return <JourneyRuntimeContext.Provider value={api}>{children}</JourneyRuntimeContext.Provider>
}

export function useJourneyRuntime(): JourneyRuntimeApi {
  const api = useContext(JourneyRuntimeContext)

  if (!api) {
    throw new Error('useJourneyRuntime requires a JourneyRuntimeProvider ancestor.')
  }

  return api
}
