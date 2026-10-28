import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { buildClientContent } from '@/content/projection'
import { validatedContent } from '@/content/validate'

import ImmersiveStage from '@/ui/stage/ImmersiveStage'
import { useNarrativeStore } from '@/runtime/stores/narrative'

/**
 * Stage contract (new_plan.md §13 P5, P11): the server-projected content
 * renders a complete semantic document — every chapter section, its visual
 * slot, the skip link, the rotating copy and the contact extras — and the
 * runtime publishes the landing chapter at mount.
 *
 * Test environment has no boot script, so <html> stays data-experience=
 * "document": the stage renders in document mode (all sections visible),
 * which is exactly the no-JS baseline the contract promises. P11: the rail,
 * scroll cue and animation controls are removed — panels + plasma slots are
 * the visual contract now.
 */

const content = buildClientContent(validatedContent)

function renderStage() {
  return render(<ImmersiveStage content={content} />)
}

describe('immersive stage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders every chapter as a semantic section with its heading and slot', () => {
    renderStage()

    content.chapters.forEach((chapter) => {
      const section = document.getElementById(chapter.id)
      expect(section).not.toBeNull()
      expect(section?.getAttribute('aria-labelledby')).toBe(`${chapter.id}-heading`)
      expect(document.getElementById(`${chapter.id}-heading`)?.textContent).toContain(chapter.title)
    })

    expect(document.querySelectorAll('.stage-card').length).toBe(content.chapters.length)

    // Full-bleed chapters carry the solo composition; every non-spiral
    // chapter keeps its in-column slot.
    content.chapters.forEach((chapter) => {
      const split = document.querySelector(`#${chapter.id} .stage-card__split`)
      const composition = split?.getAttribute('data-composition')

      if (chapter.visual.kind === 'spiral') {
        expect(composition).toBe('solo')
        expect(document.querySelector(`#${chapter.id} .stage-card__visual-slot`)).toBeNull()
      } else {
        expect(composition).toBeNull()
        expect(document.querySelector(`#${chapter.id} .stage-card__visual-slot`)).not.toBeNull()
      }
    })
  })

  it('uses h1 for the landing chapter and h2 for the rest', () => {
    renderStage()

    expect(document.querySelectorAll('.stage-card h1').length).toBe(1)
    expect(document.querySelectorAll('.stage-card h2').length).toBe(content.chapters.length - 1)
  })

  it('renders the skip link to the first chapter', () => {
    renderStage()

    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link')
    expect(skipLink?.getAttribute('href')).toBe(`#${content.chapters[0]?.id}`)
  })

  it('renders the rotating copy block and the contact extras from data', () => {
    renderStage()

    const rotating = document.querySelector('.fx-rotating')
    expect(rotating).not.toBeNull()
    expect(rotating?.querySelector('.fx-rotating__sr')?.textContent?.length).toBeGreaterThan(0)

    const contactSection = document.getElementById(content.contact.id)
    expect(contactSection).not.toBeNull()

    const profileLinks = contactSection?.querySelectorAll('.stage-card__item-title')
    expect(profileLinks?.length).toBeGreaterThanOrEqual(content.profiles.length)

    const privacyLink = Array.from(contactSection?.querySelectorAll('a') ?? []).find(
      (link) => link.textContent === 'Privacy details',
    )
    expect(privacyLink?.getAttribute('href')).toBe('/privacy')
  })

  it('renders ascii panels with labeled figures and honest source markers', async () => {
    renderStage()

    const panels = document.querySelectorAll('.ascii-panel')
    expect(panels.length).toBeGreaterThan(0)

    panels.forEach((panel) => {
      expect(panel.getAttribute('role')).toBe('img')
      expect(panel.getAttribute('aria-label')?.length ?? 0).toBeGreaterThan(0)
      expect(panel.querySelector('pre')?.textContent?.length ?? 0).toBeGreaterThan(0)
    })

    await waitFor(() => {
      const resolved = Array.from(panels).filter((panel) => {
        const chapterId = panel.closest('.stage-card')?.id ?? ''
        const chapter = content.chapters.find((entry) => entry.id === chapterId)

        return chapter?.exhibit?.animated
      })

      expect(resolved.length).toBe(
        content.chapters.filter(
          (chapter) => chapter.exhibit?.animated && chapter.visual.kind === 'ascii',
        ).length,
      )

      resolved.forEach((panel) => {
        expect(panel.getAttribute('data-placeholder')).toBe('false')
        expect(panel.getAttribute('data-mock')).toBe('true')
      })
    })

    const decorativePanels = Array.from(panels).filter((panel) => {
      const chapterId = panel.closest('.stage-card')?.id ?? ''
      const chapter = content.chapters.find((entry) => entry.id === chapterId)

      return !chapter?.exhibit
    })

    expect(decorativePanels.length).toBeGreaterThan(0)
    decorativePanels.forEach((panel) => {
      expect(panel.getAttribute('data-placeholder')).toBe('true')
      expect(panel.getAttribute('data-mock')).toBe('false')
    })
  })

  it('renders the full-bleed spiral stage with real repository tiles', () => {
    renderStage()

    const spiralStage = document.querySelector('#research .spiral-stage')

    expect(spiralStage).not.toBeNull()

    const tiles = spiralStage?.querySelectorAll('.spiral__tile')

    expect(tiles?.length).toBe(content.projects.length)

    tiles?.forEach((tile) => {
      const anchor = tile as HTMLAnchorElement

      expect(anchor.getAttribute('href')).toMatch(/^https:\/\/github\.com\//)

      // P11: tiles are never uncolored — every tile carries its gradient.
      expect(anchor.style.getPropertyValue('--tile-gradient-from')).toMatch(/^#/)
      expect(anchor.style.getPropertyValue('--tile-gradient-to')).toMatch(/^#/)
    })

    const srLinks = spiralStage?.querySelectorAll('.spiral__sr-list a')

    expect(srLinks?.length).toBe(content.projects.length)
  })

  it('renders the plasma background with two palette layers', () => {
    renderStage()

    const background = document.querySelector('.stage-background')

    expect(background).not.toBeNull()

    const layers = background?.querySelectorAll('.stage-background__layer')

    expect(layers?.length).toBe(2)

    const blobs = background?.querySelectorAll('.stage-background__blob')

    expect(blobs?.length).toBe(6)
    expect(background?.querySelector('.stage-background__vignette')).not.toBeNull()
  })

  it('publishes the landing chapter and marks the settled card', async () => {
    renderStage()

    await waitFor(() => {
      expect(useNarrativeStore.getState().settledChapterId).toBe(content.chapters[0]?.id)
    })

    const settled = document.querySelector('[data-card-state="settled"]')
    expect(settled?.id).toBe(content.chapters[0]?.id)
  })

  it('omits the removed chrome (rail, cue, animation controls)', () => {
    renderStage()

    expect(document.querySelector('.progress-rail')).toBeNull()
    expect(document.querySelector('.progress-rail__cue')).toBeNull()
    expect(document.querySelector('[data-animation-controls]')).toBeNull()
  })
})
