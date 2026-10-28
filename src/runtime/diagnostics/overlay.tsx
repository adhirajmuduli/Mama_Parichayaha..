'use client'

/**
 * Dev diagnostics overlay (new_plan.md §7.4) — a collapsible fixed panel that
 * polls the registered sources at 2 Hz. Mounted only when FEATURES.diagnostics
 * is on (development by default). Never read by tests or production paths.
 *
 * Collapsed by default: an open panel painted over the stage made the dev
 * build look broken (it covered the chapter copy). The pill toggles it.
 */

import { useEffect, useState } from 'react'

import { FEATURES } from '@/config/flags'
import { getSchedulerStats } from '@/runtime/scheduler'
import { getQualityProfile } from '@/runtime/quality'
import { readDiagnosticsSnapshot, registerDiagnostics } from './index'

export function DiagnosticsOverlay() {
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!FEATURES.diagnostics) return

    const read = () => setSnapshot(readDiagnosticsSnapshot())

    registerDiagnostics('scheduler', () => getSchedulerStats())
    registerDiagnostics('quality', () => getQualityProfile())
    read()

    const interval = window.setInterval(read, 500)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  if (!snapshot) return null

  if (!expanded) {
    return (
      <button
        type="button"
        data-diagnostics=""
        onClick={() => setExpanded(true)}
        style={{
          position: 'fixed',
          bottom: '0.75rem',
          left: '0.75rem',
          zIndex: 90,
          padding: '0.3rem 0.55rem',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '0.5rem',
          background: 'rgba(5,7,13,0.7)',
          color: 'rgba(220,230,240,0.8)',
          font: '11px/1.4 ui-monospace, monospace',
          cursor: 'pointer',
        }}
      >
        journey diagnostics
      </button>
    )
  }

  return (
    <aside
      data-diagnostics=""
      style={{
        position: 'fixed',
        bottom: '0.75rem',
        left: '0.75rem',
        zIndex: 90,
        maxWidth: '34rem',
        maxHeight: '60vh',
        overflow: 'auto',
        padding: '0.6rem 0.8rem',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0.5rem',
        background: 'rgba(5,7,13,0.85)',
        color: 'rgba(220,230,240,0.9)',
        font: '11px/1.5 ui-monospace, monospace',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap',
      }}
    >
      {JSON.stringify(snapshot, null, 1)}
    </aside>
  )
}
