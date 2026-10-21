'use client'

/**
 * VisualSlot (new_plan.md §10.8, R15) — the per-chapter slot dispatcher.
 * One slot element per chapter section, rendered opposite the card. Every
 * kind falls back to the ASCII placeholder panel when its component or
 * capability gate is unavailable.
 *
 * Wiring (P6): spiral chapters render ProjectSpiral (scheduler-bound,
 * quality-capped, reduced-motion static fan); lanyard chapters render the
 * static portrait fallback until the lazy three.js island is integrated;
 * ascii chapters render the full AsciiPanel engine. This file remains the
 * ONLY dispatch point.
 */

import type { CSSProperties } from 'react'

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

  const lanyardEligible =
    kind === 'lanyard' &&
    FEATURES.lanyard &&
    !capabilities.coarsePointer &&
    !capabilities.reducedMotion &&
    supportsWebGL() &&
    active

  return (
    <div
      className="stage-card__visual-slot"
      data-visual-kind={kind}
      data-visual-active={active ? 'true' : 'false'}
    >
      {lanyardEligible ? (
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
