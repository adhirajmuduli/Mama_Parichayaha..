import { describe, expect, it } from 'vitest'

import { buildClientContent } from '@/content/projection'
import { validatedContent } from '@/content/validate'

import type { ClientContent } from '@/types/experience'

/**
 * Content contract gate (npm run content:check).
 *
 * Importing `@/content/validate` runs every zod schema plus cross-validation
 * at module load — if authored data regresses, this file fails to even
 * collect. The assertions below then pin the *projection* contract the
 * client stage depends on.
 */

describe('validated content', () => {
  it('validates all schemas and cross-references without throwing', () => {
    expect(validatedContent.chapters.length).toBe(validatedContent.journey.chapterIds.length)
    expect(validatedContent.scene.length).toBe(validatedContent.journey.chapterIds.length)
  })

  it('keeps journey order canonical across every content surface', () => {
    const ids = validatedContent.journey.chapterIds

    ids.forEach((chapterId, index) => {
      expect(validatedContent.chapters[index]?.id).toBe(chapterId)
      expect(validatedContent.scene[index]?.id).toBe(chapterId)
    })
  })

  it('accepts any chapter count ≥ 3 (data-driven topology)', () => {
    expect(validatedContent.journey.chapterIds.length).toBeGreaterThanOrEqual(3)
  })
})

describe('client projection', () => {
  let content: ClientContent

  it('projects without throwing', () => {
    content = buildClientContent(validatedContent)
  })

  it('mirrors journey order and derives nav labels', () => {
    const ids = validatedContent.journey.chapterIds

    expect(content.chapters.map((chapter) => chapter.id)).toEqual(ids)

    content.chapters.forEach((chapter) => {
      expect(chapter.navLabel.length).toBeGreaterThan(0)
    })
  })

  it('strips every provenance source claim (R10)', () => {
    const serialized = JSON.stringify(content)

    expect(serialized).not.toContain('"source"')
    expect(serialized).not.toContain('phase2-content-provenance')
    expect(serialized).not.toContain('phase8-content-provenance')
  })

  it('maps exhibit metadata coherently for every chapter (ascii slot + fallbacks)', () => {
    const withExhibit = content.chapters.filter((chapter) => chapter.exhibit !== null)

    expect(withExhibit.length).toBeGreaterThan(0)

    content.chapters.forEach((chapter) => {
      if (chapter.exhibit) {
        expect(chapter.exhibit.chapterId).toBe(chapter.id)
        expect(chapter.exhibit.fps).toBeGreaterThan(0)
        expect(chapter.exhibit.fps).toBeLessThanOrEqual(30)
        expect(chapter.exhibit.label.length).toBeGreaterThan(0)
        expect(chapter.exhibit.description.length).toBeGreaterThan(0)
      }
    })
  })

  it('carries at least one project for the spiral slot (R15)', () => {
    const spiralChapters = content.chapters.filter((chapter) => chapter.visual.kind === 'spiral')

    expect(spiralChapters.length).toBeGreaterThan(0)
    spiralChapters.forEach((chapter) => {
      // The slot reads ClientContent.projects globally; per-chapter gating is
      // a presentation concern. Data must simply exist.
      expect(chapter.id).toBeTruthy()
    })

    expect(content.projects.length).toBeGreaterThanOrEqual(1)

    content.projects.forEach((project) => {
      expect(project.href).toMatch(/^https:\/\//)
      expect(project.external).toBe(true)
    })
  })

  it('keeps actions anchor/external coherent for every chapter', () => {
    content.chapters.forEach((chapter) => {
      expect(chapter.actions.length).toBeLessThanOrEqual(3)

      chapter.actions.forEach((action) => {
        if (action.external) {
          expect(action.href).toMatch(/^https?:\/\//)
        } else {
          expect(action.href).toMatch(/^#[a-z][a-z0-9-]*$/i)
        }
      })
    })
  })

  it('keeps the rotating copy block well-formed where authored', () => {
    const rotating = content.chapters
      .map((chapter) => chapter.rotating)
      .filter((block): block is NonNullable<typeof block> => block !== undefined)

    expect(rotating.length).toBeGreaterThan(0)

    rotating.forEach((block) => {
      expect(block.items.length).toBeGreaterThanOrEqual(2)
      block.items.forEach((item) => expect(item.length).toBeGreaterThan(0))
    })
  })

  it('preserves the credits surface, including open-source attribution', () => {
    expect(content.credits.models.length).toBeGreaterThanOrEqual(1)
    expect(content.credits.components).toMatch(/React Bits/)

    content.credits.models.forEach((model) => {
      expect(model.links.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('keeps public profiles and the mailto contract intact', () => {
    expect(content.profiles.length).toBeGreaterThanOrEqual(1)

    const mailto = content.profiles.filter((profile) => !profile.external)
    expect(mailto.length).toBeGreaterThanOrEqual(1)
    expect(mailto[0]?.href).toMatch(/^mailto:/)
  })

  it('is JSON-serializable (server → client payload)', () => {
    expect(() => JSON.parse(JSON.stringify(content))).not.toThrow()
  })
})
