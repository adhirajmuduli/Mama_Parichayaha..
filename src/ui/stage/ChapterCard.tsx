'use client'

/**
 * ChapterCard (new_plan.md §7.6) — one semantic chapter section. The same DOM
 * serves document mode (stacked, all visible) and immersive mode (overlay
 * windows); only CSS + inert/visibility differ.
 *
 * Contract notes:
 *   - heading levels: h1 for the landing chapter (origins), h2 after,
 *   - the surface scroller carries data-scroll-region ONLY while visible
 *     (immersive), so the coordinator's wheel arbitration is exact,
 *   - the card element is focusable (tabIndex -1) as the keyboard-focus
 *     target for the focus token,
 *   - contact extras (profiles, privacy/credits links, rotating copy for
 *     interests) fold in as plain JSX — no separate supplement component.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import type { ClientChapter, ClientProject } from '@/types/experience'

import { RotatingText } from '@/ui/fx/RotatingText'
import { VisualSlot } from './VisualSlot'

export interface ChapterCardProps {
  chapter: ClientChapter
  /** settled | outgoing | incoming | idle */
  cardState: 'settled' | 'outgoing' | 'incoming' | 'idle'
  immersive: boolean
  /** Landing chapter renders h1; the rest h2 (accessibility contract). */
  isLanding: boolean
  profileName: string
  profileDiscipline: string
  portrait: string
  privacyNotice: string
  /** Whether this chapter hosts the contact extras (deck decides, from data). */
  contactExtras: boolean
  /** Project tiles for spiral visual slots. */
  projects: ClientProject[]
  children?: ReactNode
}

const STATUS_LABEL: Record<string, string> = {
  active: 'active',
  completed: 'completed',
  experimental: 'exploratory',
}

/**
 * Tracks whether a bounded scroll region actually overflows, and whether the
 * reader has reached its end. Two attributes on the element let CSS express
 * the truncation honestly: a scrollable copy fades at its cut (an affordance,
 * not a glitch) and the fade lifts once the reader reaches the end — so a
 * call-to-action at the bottom is never permanently half-hidden.
 *
 * The measurement is event-driven (resize observer + font readiness + passive
 * scroll), never per frame; a short copy never renders the affordance.
 */
function useOverflowState(surfaceRef: React.RefObject<HTMLDivElement | null>, visible: boolean) {
  const [state, setState] = useState({ scrollable: false, atEnd: true })

  useEffect(() => {
    const surface = surfaceRef.current

    if (!surface || !visible) {
      setState({ scrollable: false, atEnd: true })
      return
    }

    let frame = 0
    let lastScrollable: boolean | null = null
    let lastAtEnd: boolean | null = null

    const measure = () => {
      frame = 0
      const scrollable = surface.scrollHeight > surface.clientHeight + 1
      const atEnd = !scrollable || surface.scrollTop + surface.clientHeight >= surface.scrollHeight - 1

      if (scrollable !== lastScrollable || atEnd !== lastAtEnd) {
        lastScrollable = scrollable
        lastAtEnd = atEnd
        setState({ scrollable, atEnd })
      }
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }

    measure()

    const observer = new ResizeObserver(schedule)
    observer.observe(surface)
    surface.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Font swap changes text metrics without resizing the capped box; the
    // loading promise is the only reliable signal for that transition.
    void document.fonts?.ready.then(schedule).catch(() => {})

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      observer.disconnect()
      surface.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [surfaceRef, visible])

  return state
}

export function ChapterCard({
  chapter,
  cardState,
  immersive,
  isLanding,
  profileName,
  profileDiscipline,
  portrait,
  privacyNotice,
  contactExtras,
  projects,
  children,
}: ChapterCardProps) {
  const visible = cardState !== 'idle'
  const Heading = isLanding ? 'h1' : 'h2'
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const overflow = useOverflowState(surfaceRef, visible)

  return (
    <section
      id={chapter.id}
      aria-labelledby={`${chapter.id}-heading`}
      className="stage-card"
      data-card-state={cardState}
      data-card-side={chapter.cardSide}
      // Hiding is an IMMERSIVE-stage concern. The SSR document (no JS) has
      // an empty narrative store, so every card renders "idle" there —
      // gating on immersive keeps the semantic document fully readable
      // for no-JS visitors and screen readers (R3).
      aria-hidden={immersive && cardState === 'idle' ? 'true' : undefined}
      inert={immersive && cardState === 'idle' ? true : undefined}
    >
      <div
        className="stage-card__split"
        data-composition={chapter.visual.kind === 'spiral' ? 'solo' : undefined}
      >
        <div
          ref={surfaceRef}
          className="stage-card__surface"
          tabIndex={-1}
          data-scroll-region={immersive && visible ? '' : undefined}
          data-scrollable={overflow.scrollable ? 'true' : undefined}
          data-at-end={overflow.atEnd ? 'true' : undefined}
          style={{ '--card-accent': chapter.accent } as CSSProperties}
        >
          <p className="stage-card__eyebrow">{chapter.eyebrow}</p>
          <Heading id={`${chapter.id}-heading`} className="stage-card__title">
            {chapter.title}
          </Heading>
          <p className="stage-card__description">{chapter.description}</p>

          {chapter.rotating ? (
            <div className="stage-card__rotating">
              <RotatingText
                texts={chapter.rotating.items}
                prefix={chapter.rotating.prefix}
                interval={2600}
              />
            </div>
          ) : null}

          {chapter.detail.items.length > 0 ? (
            <div className="stage-card__detail">
              <p className="stage-card__detail-title">{chapter.detail.title}</p>
              <ul className="stage-card__items">
                {chapter.detail.items.map((item) => (
                  <li key={item.title} className="stage-card__item">
                    <p className="stage-card__item-title">
                      {item.href ? (
                        <a
                          href={item.href}
                          {...(item.external
                            ? { target: '_blank', rel: 'noreferrer noopener' }
                            : {})}
                        >
                          {item.title}
                        </a>
                      ) : (
                        item.title
                      )}
                      {item.status ? (
                        <span className="stage-card__item-status">
                          {STATUS_LABEL[item.status] ?? item.status}
                        </span>
                      ) : null}
                    </p>
                    <p className="stage-card__item-description">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {chapter.id === 'research' ? (
            <div className="stage-card__projects">
              <p className="stage-card__detail-title">Selected computational projects</p>
              <ul>
                {projects.map((project) => (
                  <li key={project.href}>
                    <a href={project.href} target="_blank" rel="noreferrer noopener">
                      <span>{project.title}</span>
                      <span>{project.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {chapter.actions.length > 0 ? (
            <div className="stage-card__actions">
              {chapter.actions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="stage-card__action"
                  {...(action.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}

          {contactExtras ? (
            <div className="stage-card__detail">
              <p className="stage-card__detail-title">Privacy and credits</p>
              <p className="stage-card__item-description">{privacyNotice}</p>
              <p className="stage-card__item-description">
                <a className="stage-card__item-title" href="/privacy">
                  Privacy details
                </a>{' '}
                ·{' '}
                <a className="stage-card__item-title" href="/credits">
                  Credits
                </a>
              </p>
            </div>
          ) : null}

          {children}
        </div>

        <VisualSlot
          chapter={chapter}
          active={visible}
          portrait={portrait}
          profileName={profileName}
          profileDiscipline={profileDiscipline}
          projects={projects}
        />
      </div>
    </section>
  )
}
