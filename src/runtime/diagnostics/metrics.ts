'use client'

/**
 * Long-task metrics (dev-only observer). Registered only when diagnostics is
 * enabled; PerformanceObserver keeps no reference after disconnect.
 */

import { FEATURES } from '@/config/flags'
import { registerDiagnostics } from './index'

let connected = false
let longTaskCount = 0
let longestTaskMs = 0

export function observeLongTasks(): void {
  if (connected || typeof window === 'undefined' || !('PerformanceObserver' in window)) return
  if (!FEATURES.diagnostics) return

  connected = true

  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      longTaskCount += 1
      longestTaskMs = Math.max(longestTaskMs, entry.duration)
    }
  })

  observer.observe({ entryTypes: ['longtask'] })

  registerDiagnostics('metrics', () => ({
    longTaskCount,
    longestTaskMs: Math.round(longestTaskMs),
  }))
}
