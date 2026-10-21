'use client'

/**
 * Diagnostics registry (new_plan.md §7.4) — a 2 Hz snapshot surface, zero
 * production cost when the flag is off.
 *
 * Sources register getters (no per-frame work); the dev overlay polls the
 * merged snapshot on an interval. `window.__JOURNEY__` exposes the same
 * snapshot for ad-hoc inspection in development.
 */

import { FEATURES } from '@/config/flags'

export type DiagnosticsSource = () => unknown

const sources = new Map<string, DiagnosticsSource>()

export interface JourneyDiagnostics {
  snapshot(): Record<string, unknown>
  register(source: string, read: DiagnosticsSource): () => void
}

function mergedSnapshot(): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    at: new Date().toISOString(),
  }

  for (const [name, read] of sources) {
    try {
      merged[name] = read()
    } catch (error) {
      merged[name] = { error: String(error) }
    }
  }

  return merged
}

export function registerDiagnostics(source: string, read: DiagnosticsSource): () => void {
  sources.set(source, read)

  return () => {
    sources.delete(source)
  }
}

export function readDiagnosticsSnapshot(): Record<string, unknown> {
  return mergedSnapshot()
}

if (typeof window !== 'undefined' && FEATURES.diagnostics) {
  const surface: JourneyDiagnostics = {
    snapshot: mergedSnapshot,
    register: (source, read) => {
      sources.set(source, read)
      return () => sources.delete(source)
    },
  }

  const targetWindow = window as typeof window & { __JOURNEY__?: JourneyDiagnostics }
  targetWindow.__JOURNEY__ = surface
}
