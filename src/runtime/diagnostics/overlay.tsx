'use client'

/**
 * Dev diagnostics overlay (new_plan.md §7.4) — a dismissible fixed panel that
 * polls the registered sources at 2 Hz. Mounted only when FEATURES.diagnostics
 * is on (development by default). Never read by tests or production paths.
 */

import { useEffect, useState } from 'react'

import { FEATURES } from '@/config/flags'
import { getSchedulerStats } from '@/runtime/scheduler'
import { getQualityProfile } from '@/runtime/quality'
import { readDiagnosticsSnapshot, registerDiagnostics } from './index'

interface OverlayState {
  visible: boolean
  snapshot: Record<string, unknown>
}

export function DiagnosticsOverlay() {
  const [state, setState] = useState<OverlayState | null>(null)

  useEffect(() => {
    if (!FEATURES.diagnostics) return

    const read = () =>
      setState({
        visible: true,
        snapshot: readDiagnosticsSnapshot(),
      })

    registerDiagnostics('scheduler', () => getSchedulerStats())
    registerDiagnostics('quality', () => getQualityProfile())
    read()

    const interval = window.setInterval(read, 500)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  if (!state?.visible) return null

  return (
    <aside
      aria-hidden="true"
      data-diagnostics=""
      style={{
        position: 'fixed',
        bottom: '0.75rem',
        left: '0.75rem',
        zIndex: 90,
        maxWidth: '34rem',
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
      {JSON.stringify(state.snapshot, null, 1)}
    </aside>
  )
}
