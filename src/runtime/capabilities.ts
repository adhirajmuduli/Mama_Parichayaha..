'use client'

/**
 * Capability detection (new_plan.md §7.4) — one snapshot, lazily measured on
 * the client, server-defaulted for SSR determinism.
 *
 * Probes are side-effect free (no WebGL contexts, no layout reads beyond
 * innerWidth). Changes (reduced motion, pointer type, save-data, viewport)
 * bump a version and notify subscribers; `useCapabilities` re-renders via
 * useSyncExternalStore.
 */

import { useSyncExternalStore } from 'react'

export interface CapabilitySnapshot {
  reducedMotion: boolean
  coarsePointer: boolean
  saveData: boolean
  /** GiB, 0.25..8 per the Device Memory API; 8 when unknown. */
  deviceMemory: number
  cores: number
  viewportClass: 'compact' | 'regular'
}

const DEFAULT_SNAPSHOT: CapabilitySnapshot = Object.freeze({
  reducedMotion: false,
  coarsePointer: false,
  saveData: false,
  deviceMemory: 8,
  cores: 8,
  viewportClass: 'regular',
})

let snapshot: CapabilitySnapshot = DEFAULT_SNAPSHOT
let measured = false
const listeners = new Set<() => void>()
let mediaCleanups: (() => void)[] = []

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

function readCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(pointer: coarse)').matches
    : false
}

function readReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

function readSaveData(): boolean {
  const connection =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      : undefined

  return connection?.saveData === true
}

function readDeviceMemory(): number {
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory

  return typeof deviceMemory === 'number' && deviceMemory > 0 ? deviceMemory : 8
}

function readCores(): number {
  return typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number'
    ? Math.max(1, navigator.hardwareConcurrency)
    : 8
}

function readViewportClass(): CapabilitySnapshot['viewportClass'] {
  return typeof window !== 'undefined' && window.innerWidth < 768 ? 'compact' : 'regular'
}

function measure(): CapabilitySnapshot {
  return {
    reducedMotion: readReducedMotion(),
    coarsePointer: readCoarsePointer(),
    saveData: readSaveData(),
    deviceMemory: readDeviceMemory(),
    cores: readCores(),
    viewportClass: readViewportClass(),
  }
}

function refresh(): void {
  const next = measure()
  const changed =
    next.reducedMotion !== snapshot.reducedMotion ||
    next.coarsePointer !== snapshot.coarsePointer ||
    next.saveData !== snapshot.saveData ||
    next.deviceMemory !== snapshot.deviceMemory ||
    next.cores !== snapshot.cores ||
    next.viewportClass !== snapshot.viewportClass

  if (!changed) return

  snapshot = Object.freeze(next)
  notify()
}

function attachMediaListeners(): void {
  if (typeof window === 'undefined' || !window.matchMedia) return

  const queries: string[] = [
    '(prefers-reduced-motion: reduce)',
    '(pointer: coarse)',
    '(max-width: 767px)',
  ]

  mediaCleanups = queries.map((query) => {
    const list = window.matchMedia(query)
    const handler = () => refresh()

    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', handler)
      return () => list.removeEventListener('change', handler)
    }

    // Safari < 14 fallback.
    list.addListener(handler)
    return () => list.removeListener(handler)
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', refresh)
    mediaCleanups.push(() => window.removeEventListener('resize', refresh))
  }
}

/** Current snapshot; measures on first client call. */
export function readCapabilities(): CapabilitySnapshot {
  if (!measured && typeof window !== 'undefined') {
    measured = true
    snapshot = Object.freeze(measure())
  }

  return snapshot
}

export function subscribeCapabilities(listener: () => void): () => void {
  if (listeners.size === 0) {
    attachMediaListeners()
  }

  listeners.add(listener)

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0) {
      for (const cleanup of mediaCleanups) cleanup()
      mediaCleanups = []
    }
  }
}

export function useCapabilities(): CapabilitySnapshot {
  return useSyncExternalStore(subscribeCapabilities, readCapabilities, () => DEFAULT_SNAPSHOT)
}
