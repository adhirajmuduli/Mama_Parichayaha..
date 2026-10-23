'use client'

/**
 * VisualSlot (new_plan.md §10.8, R15) — the per-chapter slot dispatcher.
 * One slot element per chapter section, rendered opposite the card. Every
 * kind falls back to the ASCII placeholder panel when its component or
 * capability gate is unavailable.
 *
 * Wiring: spiral chapters render ProjectSpiral (scheduler-bound, effect-
 * gated on `active`); lanyard chapters mount the lazy three.js island ONCE
 * per session (capability gates evaluated post-hydration — a stable root:
 * the island never unmounts on chapter travel, it self-parks via its own
 * IntersectionObserver when the card hides); ascii chapters run the full
 * AsciiPanel engine. This file remains the ONLY dispatch point.
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
  /** Lanyard portrait image (site data). */
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

  // Stable-root lanyard: eligibility settles once, post-hydration (the
  // SSR/first render always shows the fallback — no mismatch), and the
  // island then stays mounted for the session. Chapter travel only toggles
  // visibility; the island's IntersectionObserver parks its rAF when the
  // card hides. Re-initializing three.js per visit was a P7 finding.
  const [lanyardMounted, setLanyardMounted] = useState(false)

  useEffect(() => {
    if (
      kind === 'lanyard' &&
      FEATURES.lanyard &&
      !capabilities.coarsePointer &&
      !capabilities.reducedMotion &&
      supportsWebGL()
    ) {
      setLanyardMounted(true)
    }
  }, [kind, capabilities.coarsePointer, capabilities.reducedMotion])

  if (kind === 'spiral') {
    // Degenerate data (validate.ts forbids it, but the slot never breaks):
    // fall back to the ascii placeholder panel.
    if (projects.length === 0) {
      return (
        <div
          className="stage-card__visual-slot"
          data-visual-kind={kind}
          data-visual-active={active ? 'true' : 'false'}
        >
          <AsciiPanel
            exhibit={chapter.exhibit}
            accent={chapter.accent}
            aspect="wide"
            active={active}
            chapterId={chapter.id}
            caption="Project index"
          />
        </div>
      )
    }

    return (
      <div
        className="stage-card__visual-slot"
        data-visual-kind={kind}
        data-visual-active={active ? 'true' : 'false'}
      >
        <ProjectSpiral
          projects={projects}
          active={active}
          fpsCap={quality.fpsCap}
          accent={chapter.accent}
          reducedMotion={capabilities.reducedMotion}
        />
      </div>
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
