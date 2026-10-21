'use client'

/**
 * Exhibit source registry (new_plan.md §7.5) — resolves exhibit metadata to
 * an `AsciiExhibitSource`.
 *
 * Resolution is SYNCHRONOUS for the placeholder medium: the deterministic
 * placeholder source is available at first render, so SSR, no-JS and
 * pre-hydration paint always carry a real frame in the slot (empty <pre>
 * would be an SEO/a11y regression).
 *
 * Owner-supplied animated adapters (P9b) load asynchronously via the
 * sources table and upgrade the slot in place; failures degrade to the
 * placeholder + an error availability flag — never a thrown error
 * (ADR-0009 lesson: availability must never depend on optional assets).
 */

import { useEffect, useState } from 'react'

import type { ClientExhibit } from '@/types/experience'
import { FEATURES } from '@/config/flags'
import { registerDiagnostics } from '@/runtime/diagnostics'
import { useExhibitsStore } from '@/runtime/stores/exhibits'

import type { AsciiExhibitSource } from './types'
import { describeSourceGrid, readSourceFrame } from './types'
import { createPlaceholderSource } from './sources/placeholder-source'
import { getSourceLoader } from './sources'

export interface ResolvedExhibit {
  source: AsciiExhibitSource
  /** True while the placeholder art is filling the slot. */
  placeholder: boolean
}

function validateSource(source: AsciiExhibitSource): string | null {
  if (source.fps <= 0 || source.fps > 30) {
    return `invalid fps (${source.fps})`
  }

  const frame = readSourceFrame(source, 0, 0)

  if (frame === null || frame.length === 0) {
    return 'no frames and no render function'
  }

  const grid = describeSourceGrid(source)

  if (grid.rows === 0 || grid.cols === 0) {
    return 'empty grid'
  }

  if (grid.cols > 80 || grid.rows > 40) {
    return `grid exceeds budget (${grid.cols}x${grid.rows})`
  }

  return null
}

export function useExhibitSource(exhibit: ClientExhibit | null): ResolvedExhibit | null {
  // Synchronous placeholder baseline: available on the very first render,
  // before any effect, so server HTML and pre-hydration paint are complete.
  const [resolved, setResolved] = useState<ResolvedExhibit | null>(() =>
    exhibit ? { source: createPlaceholderSource(exhibit.id), placeholder: true } : null,
  )

  const applyAvailability = useExhibitsStore((state) => state.applyAvailability)

  useEffect(() => {
    if (!exhibit) {
      setResolved(null)
      return
    }

    // Placeholder medium needs no adapter at all: publish and stop.
    if (!exhibit.animated || !FEATURES.exhibits) {
      applyAvailability(exhibit.id, 'placeholder')
      setResolved({ source: createPlaceholderSource(exhibit.id), placeholder: true })
      return
    }

    // Animated path (owner adapters, P9b): resolve the AUTHORED adapter key
    // asynchronously and upgrade; failures fall back to the placeholder with
    // an error flag.
    let cancelled = false

    getSourceLoader(exhibit.sourceKey, exhibit.id)()
      .then((source) => {
        if (cancelled) return

        const failure = validateSource(source)

        if (failure) {
          registerDiagnostics('exhibit-errors', () => ({ [exhibit.id]: failure }))
          applyAvailability(exhibit.id, 'error')
          setResolved({ source: createPlaceholderSource(exhibit.id), placeholder: true })
          return
        }

        applyAvailability(exhibit.id, 'ready')
        setResolved({ source, placeholder: false })
      })
      .catch(() => {
        if (cancelled) return

        applyAvailability(exhibit.id, 'error')
        setResolved({ source: createPlaceholderSource(exhibit.id), placeholder: true })
      })

    return () => {
      cancelled = true
    }
  }, [exhibit, applyAvailability])

  return resolved
}
