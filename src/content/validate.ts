/**
 * Content validation gate (new_plan.md §7.2).
 *
 * Runs every schema once at module load and cross-validates the four content
 * surfaces (journey, chapters, scene, exhibits/projects) against each other.
 * A failure throws at import time — which means `next build` and the
 * `content:check` test both fail loudly on bad data.
 *
 * This module is SERVER/BUILD-ONLY: it imports zod and may never enter the
 * client graph (enforced by scripts/quality/check-boundaries.mjs).
 */

import { z } from 'zod'

import { journeySchema } from './schemas/journey.schema'
import { ChapterListSchema, ProfileSchema } from './schemas/chapters.schema'
import { SceneContentSchema } from './schemas/scene.schema'
import { ExhibitListSchema } from './schemas/exhibits.schema'
import { ProjectListSchema } from './schemas/projects.schema'
import { SiteContentSchema } from './schemas/site.schema'

import { journeyChapterIds } from './data/journey'
import { chapters as chapterData, profile as profileData } from './data/chapters'
import { sceneEntries as sceneData } from './data/scene'
import { exhibits as exhibitData } from './data/exhibits'
import { projects as projectData } from './data/projects'
import { siteContent as siteData } from './data/site'

export interface ValidatedContent {
  journey: z.infer<typeof journeySchema>
  profile: z.infer<typeof ProfileSchema>
  chapters: z.infer<typeof ChapterListSchema>
  scene: z.infer<typeof SceneContentSchema>
  exhibits: z.infer<typeof ExhibitListSchema>
  projects: z.infer<typeof ProjectListSchema>
  site: z.infer<typeof SiteContentSchema>
}

function crossValidate(content: ValidatedContent) {
  const { journey, chapters, scene, exhibits, projects, site } = content

  const journeyIds = journey.chapterIds
  const chapterIds = chapters.map((chapter) => chapter.id)
  const sceneIds = scene.map((entry) => entry.id)

  // Journey ↔ chapters ↔ scene must be the same roster, in the same order.
  if (chapterIds.length !== journeyIds.length) {
    throw new Error(
      `Content mismatch: ${journeyIds.length} journey chapters but ${chapterIds.length} chapter content entries.`,
    )
  }

  if (sceneIds.length !== journeyIds.length) {
    throw new Error(
      `Content mismatch: ${journeyIds.length} journey chapters but ${sceneIds.length} scene entries.`,
    )
  }

  journeyIds.forEach((chapterId, index) => {
    if (chapterIds[index] !== chapterId) {
      throw new Error(
        `Chapter content order diverges from journey at index ${index}: expected ${chapterId}, found ${chapterIds[index]}.`,
      )
    }

    if (sceneIds[index] !== chapterId) {
      throw new Error(
        `Scene entry order diverges from journey at index ${index}: expected ${chapterId}, found ${sceneIds[index]}.`,
      )
    }
  })

  // Exhibits must reference real chapters. Exhibit metadata is consumed by
  // the ASCII slot AND by the ascii *fallback* of lanyard/spiral chapters
  // (new_plan.md §10.8), so every visual kind may carry it. Chapters with no
  // exhibit entry render a decorative placeholder panel without controls.
  const sceneById = new Map(scene.map((entry) => [entry.id, entry]))
  const projectCount = projects.length

  exhibits.forEach((exhibit) => {
    const sceneEntry = sceneById.get(exhibit.chapter)

    if (!sceneEntry) {
      throw new Error(`Exhibit ${exhibit.id} references unknown chapter ${exhibit.chapter}.`)
    }
  })

  scene.forEach((entry) => {
    if (entry.visual.kind === 'spiral' && projectCount === 0) {
      throw new Error(`Chapter ${entry.id} uses the spiral visual but no projects are authored.`)
    }

    if (entry.visual.kind === 'lanyard' && !site.portrait) {
      throw new Error(
        `Chapter ${entry.id} uses the lanyard visual but no portrait image is configured.`,
      )
    }
  })

  // Site contact/publications ids are fixed literals in the schema; assert
  // they still correspond to real journey chapters so the regions keep their
  // anchors if the ring ever changes.
  const journeySet = new Set(journeyIds)

  if (!journeySet.has(site.contact.id)) {
    throw new Error(`Site contact id '${site.contact.id}' is not a journey chapter.`)
  }

  if (!journeySet.has(site.publications.id)) {
    throw new Error(`Site publications id '${site.publications.id}' is not a journey chapter.`)
  }
}

function validateContent(): ValidatedContent {
  const content: ValidatedContent = {
    journey: journeySchema.parse({ chapterIds: journeyChapterIds }),
    profile: ProfileSchema.parse(profileData),
    chapters: ChapterListSchema.parse(chapterData),
    scene: SceneContentSchema.parse(sceneData),
    exhibits: ExhibitListSchema.parse(exhibitData),
    projects: ProjectListSchema.parse(projectData),
    site: SiteContentSchema.parse(siteData),
  }

  crossValidate(content)

  return content
}

export const validatedContent: ValidatedContent = validateContent()
