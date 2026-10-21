/**
 * Journey topology data (new_plan.md §7.2) — the single source for chapter
 * count and order. Every derived system (timeline, rail, windows, layout)
 * consumes this list; no code may encode a chapter count or a fixed roster.
 */

export const journeyChapterIds = [
  'origins',
  'interests',
  'research',
  'computation',
  'future',
  'publications',
  'contact',
] as const
