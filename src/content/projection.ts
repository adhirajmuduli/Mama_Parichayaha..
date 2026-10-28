/**
 * Client content projection (new_plan.md §7.2, §6).
 *
 * Pure function: validated (server-side) content in, JSON-safe `ClientContent`
 * out. Strips every provenance `source` claim (R10), maps exhibits into their
 * chapter entries, and derives presentation defaults. No zod, no React, no
 * directives — the client graph imports nothing but types from here.
 */

import type {
  ClientChapter,
  ClientChapterAction,
  ClientChapterDetailItem,
  ClientContent,
  ClientCreditsModel,
  ClientExhibit,
  ClientProject,
  ClientPublicProfile,
} from '@/types/experience'

import type { ValidatedContent } from './validate'

export function buildClientContent(content: ValidatedContent): ClientContent {
  const { journey, profile, chapters, scene, exhibits, projects, site } = content

  const sceneByChapterId = new Map(scene.map((entry) => [entry.id, entry]))
  const exhibitsByChapterId = new Map(exhibits.map((exhibit) => [exhibit.chapter, exhibit]))

  const clientChapters: ClientChapter[] = journey.chapterIds.map((chapterId, index) => {
    const chapter = chapters[index]
    const sceneEntry = sceneByChapterId.get(chapterId)
    const exhibit = exhibitsByChapterId.get(chapterId)

    if (!chapter || chapter.id !== chapterId) {
      // validate.ts already guarantees order; this is a type-level guard for
      // future refactors that might loosen that coupling.
      throw new Error(`Chapter projection diverged at index ${index}: expected ${chapterId}.`)
    }

    if (!sceneEntry) {
      throw new Error(`Missing scene presentation for chapter ${chapterId}.`)
    }

    const actions: ClientChapterAction[] = chapter.actions.map((action) => ({
      label: action.label,
      href: action.href,
      external: action.external,
    }))

    const clientExhibit: ClientExhibit | null = exhibit
      ? {
          id: exhibit.id,
          chapterId: exhibit.chapter,
          label: exhibit.label,
          description: exhibit.description,
          fps: exhibit.fps,
          animated: exhibit.animated,
          sourceKey: exhibit.sourceKey,
        }
      : null

    const clientChapter: ClientChapter = {
      id: chapterId,
      navLabel: chapter.navLabel ?? chapter.eyebrow,
      eyebrow: chapter.eyebrow,
      title: chapter.title,
      description: chapter.description,
      detail: {
        eyebrow: chapter.detail.eyebrow,
        title: chapter.detail.title,
        items: chapter.detail.items.map((item) => {
          const clientItem: ClientChapterDetailItem = {
            title: item.title,
            description: item.description,
          }

          // exactOptionalPropertyTypes: never assign an explicit undefined.
          if (item.status !== undefined) {
            clientItem.status = item.status
          }

          if (item.href !== undefined) {
            clientItem.href = item.href
          }

          if (item.external !== undefined) {
            clientItem.external = item.external
          }

          return clientItem
        }),
      },
      actions,
      cardSide: sceneEntry.cardSide,
      accent: sceneEntry.accent,
      background: [...sceneEntry.background] as [string, string, string],
      visual: { kind: sceneEntry.visual.kind },
      exhibit: clientExhibit,
    }

    if (chapter.rotating) {
      clientChapter.rotating = {
        prefix: chapter.rotating.prefix,
        items: [...chapter.rotating.items],
      }
    }

    return clientChapter
  })

  const clientProjects: ClientProject[] = projects.map((project) => ({
    title: project.title,
    description: project.description,
    href: project.href,
    external: true,
    gradient: [...project.gradient] as [string, string],
  }))

  const clientProfiles: ClientPublicProfile[] = site.publicProfiles.map((publicProfile) => ({
    label: publicProfile.label,
    href: publicProfile.href,
    external: publicProfile.external,
  }))

  const clientCreditsModels: ClientCreditsModel[] = site.credits.models.map((model) => ({
    assetId: model.assetId,
    title: model.title,
    attribution: model.attribution,
    license: model.license,
    links: model.links.map((link) => ({ label: link.label, href: link.href })),
  }))

  return {
    profile: {
      name: profile.name,
      discipline: profile.discipline,
      positioning: profile.positioning,
    },
    portrait: site.portrait,
    chapters: clientChapters,
    publications: {
      eyebrow: site.publications.eyebrow,
      title: site.publications.title,
      description: site.publications.description,
    },
    contact: {
      id: site.contact.id,
      eyebrow: site.contact.eyebrow,
      title: site.contact.title,
      description: site.contact.description,
      privacyNotice: site.contact.privacyNotice,
    },
    profiles: clientProfiles,
    projects: clientProjects,
    credits: {
      title: site.credits.title,
      description: site.credits.description,
      components: site.credits.components,
      models: clientCreditsModels,
    },
  }
}
