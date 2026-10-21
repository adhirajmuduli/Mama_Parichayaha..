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

import type { CSSProperties, ReactNode } from 'react'

import type { ClientChapter, ClientProject, ClientPublicProfile } from '@/types/experience'

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
  publicProfiles: ClientPublicProfile[]
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

export function ChapterCard({
  chapter,
  cardState,
  immersive,
  isLanding,
  profileName,
  profileDiscipline,
  portrait,
  publicProfiles,
  privacyNotice,
  contactExtras,
  projects,
  children,
}: ChapterCardProps) {
  const visible = cardState !== 'idle'
  const Heading = isLanding ? 'h1' : 'h2'

  return (
    <section
      id={chapter.id}
      aria-labelledby={`${chapter.id}-heading`}
      className="stage-card"
      data-card-state={cardState}
      data-card-side={chapter.cardSide}
      aria-hidden={cardState === 'idle' ? 'true' : undefined}
      inert={cardState === 'idle' ? true : undefined}
    >
      <div className="stage-card__split">
        <div
          className="stage-card__surface"
          tabIndex={-1}
          data-scroll-region={immersive && visible ? '' : undefined}
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
                      {item.title}
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

          {contactExtras && publicProfiles.length > 0 ? (
            <div className="stage-card__detail">
              <p className="stage-card__detail-title">Public profiles</p>
              <ul className="stage-card__items">
                {publicProfiles.map((profile) => (
                  <li key={profile.href} className="stage-card__item">
                    <a
                      className="stage-card__item-title"
                      href={profile.href}
                      {...(profile.external
                        ? { target: '_blank', rel: 'noreferrer noopener' }
                        : {})}
                    >
                      {profile.label}
                    </a>
                  </li>
                ))}
              </ul>
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
