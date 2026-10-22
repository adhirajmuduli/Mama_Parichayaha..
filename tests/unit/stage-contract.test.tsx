import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { buildClientContent } from '@/content/projection'
import { validatedContent } from '@/content/validate'

import ImmersiveStage from '@/ui/stage/ImmersiveStage'
import { useNarrativeStore } from '@/runtime/stores/narrative'

/**
 * Stage contract (new_plan.md §13 P5): the server-projected content renders
 * a complete semantic document — every chapter section, its visual slot, the
 * rail, the skip link, the rotating copy and the contact extras — and the
 * runtime publishes the landing chapter at mount.
 *
 * Test environment has no boot script, so <html> stays data-experience=
 * "document": the stage renders in document mode (all sections visible),
 * which is exactly the no-JS baseline the contract promises.
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
      expect(section?.querySelector('.stage-card__visual-slot')).not.toBeNull()
      expect(section?.getAttribute('data-card-side')).toBe(chapter.cardSide)
    })

    expect(document.querySelectorAll('.stage-card').length).toBe(content.chapters.length)
  })

  it('uses h1 for the landing chapter and h2 for the rest', () => {
    renderStage()

    expect(document.querySelectorAll('.stage-card h1').length).toBe(1)
    expect(document.querySelectorAll('.stage-card h2').length).toBe(content.chapters.length - 1)
  })

  it('renders the skip link to the first chapter and the rail with real anchors', () => {
    renderStage()

    const skipLink = document.querySelector<HTMLAnchorElement>('.skip-link')
    expect(skipLink?.getAttribute('href')).toBe(`#${content.chapters[0]?.id}`)

    const railLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.progress-rail__link'),
    )

    expect(railLinks.length).toBe(content.chapters.length)

    railLinks.forEach((link, index) => {
      expect(link.getAttribute('href')).toBe(`#${content.chapters[index]?.id}`)
    })
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

    // Mock era: chapters with animated exhibit metadata resolve real (mock)
    // sources — placeholder=false + data-mock=true; decorative panels (no
    // exhibit metadata) stay placeholder=true.
    await waitFor(() => {
      const animatedPanels = Array.from(panels).filter(
        (panel) =>
          panel.closest('.stage-card')?.querySelector('[data-animation-controls]') !== null,
      )

      const withExhibits = content.chapters.filter((chapter) => chapter.exhibit?.animated)

      // The adapter load is async; every exhibit-bearing panel eventually
      // reports a non-placeholder, mock-marked source.
      const resolved = animatedPanels.filter((panel) => {
        const section = panel.closest('.stage-card')
        const chapterId = section?.id ?? ''
        const chapter = content.chapters.find((entry) => entry.id === chapterId)

        return chapter?.exhibit?.animated
      })

      expect(resolved.length).toBe(
        withExhibits.filter((chapter) => chapter.visual.kind === 'ascii').length,
      )

      resolved.forEach((panel) => {
        expect(panel.getAttribute('data-placeholder')).toBe('false')
        expect(panel.getAttribute('data-mock')).toBe('true')
      })
    })

    // Decorative panels (publications/contact) keep the placeholder art.
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

    const controlGroups = document.querySelectorAll('[data-animation-controls]')
    expect(controlGroups.length).toBeGreaterThan(0)

    controlGroups.forEach((group) => {
      const label = group.getAttribute('aria-label') ?? ''
      expect(label.endsWith('animation controls')).toBe(true)

      const buttons = group.querySelectorAll('button')
      expect(buttons.length).toBe(2)
    })
  })

  it('publishes the landing chapter and marks the settled card', async () => {
    renderStage()

    await waitFor(() => {
      expect(useNarrativeStore.getState().settledChapterId).toBe(content.chapters[0]?.id)
    })

    const settled = document.querySelector('[data-card-state="settled"]')
    expect(settled?.id).toBe(content.chapters[0]?.id)

    const activeRailLink = document.querySelector('.progress-rail__link[aria-current="step"]')
    expect(activeRailLink?.getAttribute('href')).toBe(`#${content.chapters[0]?.id}`)
  })

  it('marks the settled card surface as the wheel scroll region', async () => {
    renderStage()

    await waitFor(() => {
      expect(document.querySelector('[data-card-state="settled"]')).not.toBeNull()
    })

    const settledSurface = document.querySelector<HTMLElement>(
      '[data-card-state="settled"] .stage-card__surface',
    )

    // Document mode never carries the region marker: native scrolling owns.
    expect(settledSurface?.hasAttribute('data-scroll-region')).toBe(false)
  })
})
