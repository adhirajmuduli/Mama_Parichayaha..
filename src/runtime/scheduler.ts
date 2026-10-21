'use client'

/**
 * The single app-level animation loop (new_plan.md §7.4, §11.1).
 *
 * One rAF for the whole product: ASCII players, the journey settle watcher,
 * the project spiral and the optional dust canvas all subscribe here. The
 * loop exists ONLY while it has work — at rest the site performs zero
 * animation frames and costs nothing.
 *
 * Two participation modes:
 *   - `subscribeTick(cb)`  — keeps the loop alive (a real animator).
 *   - `observeFrameDelta`  — passive observer; called when the loop runs but
 *     NEVER keeps it alive (quality governor, diagnostics).
 *
 * The lanyard island (R11) keeps its own self-parking loop upstream; it is
 * the single sanctioned exception.
 *
 * Zero allocations per tick: callbacks receive scalars.
 */

export type TickCallback = (deltaMs: number, nowMs: number) => void
export type FrameDeltaObserver = (deltaMs: number, nowMs: number) => void
export type ActivityKind = 'journey' | 'exhibit' | 'spiral' | 'dust' | 'fx'

interface SchedulerState {
  tickCallbacks: Set<TickCallback>
  deltaObservers: Set<FrameDeltaObserver>
  activityTokens: Map<ActivityKind, number>
  frameHandle: number | null
  lastTickTime: number
  frameCounter: number
  runningSince: number
  listenersAttached: boolean
}

const state: SchedulerState = {
  tickCallbacks: new Set(),
  deltaObservers: new Set(),
  activityTokens: new Map(),
  frameHandle: null,
  lastTickTime: 0,
  frameCounter: 0,
  runningSince: 0,
  listenersAttached: false,
}

function hasKeepAliveWork(): boolean {
  return state.tickCallbacks.size > 0 || totalActivityTokens() > 0
}

function totalActivityTokens(): number {
  let total = 0

  for (const count of state.activityTokens.values()) {
    total += count
  }

  return total
}

function isDocumentHidden(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden'
}

function stopLoop(): void {
  if (state.frameHandle === null) return

  cancelAnimationFrame(state.frameHandle)
  state.frameHandle = null
  state.runningSince = 0
}

function tick(nowMs: number): void {
  state.frameHandle = null

  // Delta clamped: background-tab gaps must not produce a giant first step.
  const deltaMs =
    state.lastTickTime === 0 ? 0 : Math.min(Math.max(nowMs - state.lastTickTime, 0), 100)
  state.lastTickTime = nowMs
  state.frameCounter += 1

  // Tick callbacks may unsubscribe during iteration; copy-free iteration over
  // a Set while deleting the CURRENT entry is safe. Subscribing during a tick
  // starts at the next frame — acceptable and simple.
  for (const callback of state.tickCallbacks) {
    callback(deltaMs, nowMs)
  }

  for (const observer of state.deltaObservers) {
    observer(deltaMs, nowMs)
  }

  if (hasKeepAliveWork() && !isDocumentHidden()) {
    state.frameHandle = requestAnimationFrame(tick)
  } else {
    stopLoop()
  }
}

function startLoop(): void {
  if (state.frameHandle !== null || isDocumentHidden()) return

  state.lastTickTime = 0
  state.runningSince = performance.now()
  state.frameHandle = requestAnimationFrame(tick)
}

function ensureVisibilityListener(): void {
  if (state.listenersAttached || typeof document === 'undefined') return

  state.listenersAttached = true

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopLoop()
    } else if (hasKeepAliveWork()) {
      startLoop()
    }
  })
}

/** Registers a real animator. Keeps the loop alive while subscribed. */
export function subscribeTick(callback: TickCallback): () => void {
  state.tickCallbacks.add(callback)
  ensureVisibilityListener()

  if (state.tickCallbacks.size === 1) {
    startLoop()
  }

  return () => {
    state.tickCallbacks.delete(callback)

    if (state.tickCallbacks.size === 0 && totalActivityTokens() === 0) {
      stopLoop()
    }
  }
}

/** Registers a passive observer. Never keeps the loop alive. */
export function observeFrameDelta(observer: FrameDeltaObserver): () => void {
  state.deltaObservers.add(observer)

  return () => {
    state.deltaObservers.delete(observer)
  }
}

/**
 * Acquires a named activity token (render-adjacent work like an exhibit that
 * is "open but paused between ticks"). Idempotent per kind; pair every
 * acquire with its returned release.
 */
export function acquireActivity(kind: ActivityKind): () => void {
  const current = state.activityTokens.get(kind) ?? 0
  state.activityTokens.set(kind, current + 1)

  if (current === 0) {
    startLoop()
  }

  return () => {
    const count = state.activityTokens.get(kind) ?? 0
    if (count <= 1) state.activityTokens.delete(kind)
    else state.activityTokens.set(kind, count - 1)

    if (!hasKeepAliveWork()) {
      stopLoop()
    }
  }
}

export function isRunning(): boolean {
  return state.frameHandle !== null
}

export interface SchedulerStats {
  running: boolean
  tickSubscribers: number
  activityTokens: number
  frameCounter: number
}

/** Diagnostics snapshot; allocates only when read (2 Hz by the overlay). */
export function getSchedulerStats(): SchedulerStats {
  return {
    running: isRunning(),
    tickSubscribers: state.tickCallbacks.size,
    activityTokens: totalActivityTokens(),
    frameCounter: state.frameCounter,
  }
}

/**
 * TEST-ONLY isolation seam: drains subscribers/tokens and cancels the loop so
 * a failed assertion mid-test cannot leak a zombie rAF into the next test.
 * Never imported by application code (enforced by review, not boundaries).
 */
export function __resetSchedulerForTests(): void {
  stopLoop()
  state.tickCallbacks.clear()
  state.activityTokens.clear()
  state.frameCounter = 0
}
