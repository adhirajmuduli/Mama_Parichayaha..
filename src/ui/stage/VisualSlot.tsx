'use client'

/**
 * VisualSlot (new_plan.md §10.8, R15) — the per-chapter slot dispatcher.
 *
 * P11 open-world wiring:
 *   - spiral chapters render the ProjectSpiral as a FULL-BLEED stage layer
 *     (fixed viewport, behind the card text, above the plasma) — the spiral
 *     is a section in itself, never boxed in a column;
 *   - lanyard chapters mount the lazy three.js island once per session
 *     (capability gates evaluated post-measurement; stable root);
 *   - ascii chapters run the full AsciiPanel engine in-column;
 *   - every kind falls back to the ascii placeholder panel when its
 *     component or capability gate is unavailable.
 *
 * This file remains the ONLY dispatch point.
 */

import { useEffect, useState, type CSSProperties } from 'react'

import type { ClientChapter, ClientProject } from '@/types/experience'

import { AsciiPanel } from '@/exhibits/AsciiPanel'
import { ProjectSpiral } from '@/ui/fx/ProjectSpiral'
import { LanyardIsland } from '@/ui/fx/lanyard/LanyardIsland'
import { LanyardFallback } from '@/ui/fx/lanyard/LanyardFallback'
import { supportsWebGL } from '@/runtime/webglSupport'
import { useCapabilities } from '@/runtime/capabilities'
import { useQualityProfile } from '@/runtime/quality'
import { FEATURES } from '@/config/flags'

export interface VisualSlotProps {
  chapter: ClientChapter
  /** settled/outgoing/incoming vs idle. */
  active: boolean
  /** Lanyard portrait image (site data: public/images/portrait.jpg). */
  portrait: string
  profileName: string
  profileDiscipline: string
  /** Project tiles for spiral chapters. */
  projects: ClientProject[]
}

export function VisualSlot({
  chapter,
  active,
  portrait,
  profileName,
  profileDiscipline,
  projects,
}: VisualSlotProps) {
  const capabilities = useCapabilities()
  const quality = useQualityProfile()
  const kind = chapter.visual.kind

  // Stable-root lanyard: eligibility settles once the capabilities are
  // MEASURED (the unmeasured defaults are hydration placeholders — a P7
  // finding had the island latch onto them and mount on touch devices),
  // then the island stays mounted for the session. Chapter travel only
  // toggles visibility; the island's IntersectionObserver parks its rAF
  // when the card hides.
  const [lanyardMounted, setLanyardMounted] = useState(false)

  useEffect(() => {
    if (
      !(
        capabilities.measured &&
        kind === 'lanyard' &&
        FEATURES.lanyard &&
        !capabilities.coarsePointer &&
        !capabilities.reducedMotion &&
        supportsWebGL()
      )
    ) {
      return
    }

    // The island's three.js bootstrap (environment map, shader compile) costs
    // a long task. It must never land inside hydration: mount it once the
    // browser is idle, with the static portrait card covering the wait.
    let cancelled = false
    let idleHandle: number | undefined
    let timeoutHandle: number | undefined

    const mount = () => {
      if (cancelled) return
      setLanyardMounted(true)
    }

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(mount, { timeout: 1500 })
    } else {
      timeoutHandle = window.setTimeout(mount, 250)
    }

    return () => {
      cancelled = true

      if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle)
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle)
    }
  }, [kind, capabilities, capabilities.measured])

  if (kind === 'spiral') {
    // The spiral is a full-bleed stage layer (CSS positions it fixed,
    // centered on the viewport) — never confined to a column box.
    return (
      <ProjectSpiral
        projects={projects}
        active={active}
        fpsCap={quality.fpsCap}
        accent={chapter.accent}
        reducedMotion={capabilities.reducedMotion}
      />
    )
  }

  return (
    <div
      className="stage-card__visual-slot"
      data-visual-kind={kind}
      data-visual-active={active ? 'true' : 'false'}
    >
      {lanyardMounted ? (
        <LanyardIsland
          chapter={chapter}
          portrait={portrait}
          profileName={profileName}
          profileDiscipline={profileDiscipline}
        />
      ) : kind === 'lanyard' ? (
        // §10.8: a lanyard chapter gated off the island degrades to the
        // static portrait card — its own fallback, not the ascii panel.
        <LanyardFallback
          portrait={portrait}
          profileName={profileName}
          profileDiscipline={profileDiscipline}
          accent={chapter.accent}
        />
      ) : (
        <AsciiPanel
          exhibit={chapter.exhibit}
          accent={chapter.accent}
          aspect="square"
          active={active}
          chapterId={chapter.id}
          caption={chapter.exhibit ? chapter.exhibit.label : chapter.navLabel}
        />
      )}
    </div>
  )
}
