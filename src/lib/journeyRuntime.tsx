'use client'

import { useMotionValue, useSpring } from 'motion/react'
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
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
  const settleListenersRef = useRef(new Set<() => void>())
  const settleStateRef = useRef({ pausedRef, movingRef, restFramesRef, settleListenersRef })
  settleStateRef.current = {
    pausedRef,
    movingRef,
    restFramesRef,
    settleListenersRef,
  }

  renderUnits.on('change', () => {
    const state = settleStateRef.current

    if (!state.movingRef.current) {
      return
    }

    const position = renderUnits.get()
    const target = inputUnits.get()
    const velocity = renderUnits.getVelocity()

    if (
      Math.abs(position - target) < SETTLE_POSITION_EPSILON &&
      Math.abs(velocity) < SETTLE_VELOCITY_EPSILON
    ) {
      state.restFramesRef.current += 1

      if (state.restFramesRef.current >= 2) {
        state.movingRef.current = false
        state.restFramesRef.current = 0

        for (const listener of state.settleListenersRef.current) {
          listener()
        }
      }

      return
    }

    state.restFramesRef.current = 0
  })

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
        inputUnits.set(inputUnits.get() + deltaUnits)
      },
      navigateTo(targetUnits: number) {
        if (pausedRef.current) {
          return
        }

        recordDirection(targetUnits - inputUnits.get())
        movingRef.current = true
        restFramesRef.current = 0
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
      },
      subscribeSettle(listener: () => void) {
        settleListenersRef.current.add(listener)

        return () => {
          settleListenersRef.current.delete(listener)
        }
      },
    }
  }, [inputUnits, renderUnits])

  return <JourneyRuntimeContext.Provider value={api}>{children}</JourneyRuntimeContext.Provider>
}

export function useJourneyRuntime(): JourneyRuntimeApi {
  const api = useContext(JourneyRuntimeContext)

  if (!api) {
    throw new Error('useJourneyRuntime requires a JourneyRuntimeProvider ancestor.')
  }

  return api
}
