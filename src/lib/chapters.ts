export const chapters = [
  "origins",
  "interests",
  "research",
  "computation",
  "future",
] as const

export type Chapter =
  (typeof chapters)[number]

export const chapterIndexMap = {
  origins: 0,
  interests: 1,
  research: 2,
  computation: 3,
  future: 4,
} as const

export const chapterCount =
  chapters.length