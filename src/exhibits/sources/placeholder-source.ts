/**
 * Placeholder AsciiExhibitSource (new_plan.md §10.1) — the deterministic art
 * that fills every exhibit slot until the owner's animation sources land.
 *
 * Implements the real source interface so the player, controls, and layout
 * run the exact production path from day one (no mock surface).
 */

import type { AsciiExhibitSource } from '../types'

import { PLACEHOLDER_DEFAULT_GRID, createPlaceholderFrame } from './placeholder'

export function createPlaceholderSource(exhibitId: string): AsciiExhibitSource {
  const label = exhibitId.replace(/-/g, ' ').toUpperCase()

  const frame = createPlaceholderFrame({
    cols: PLACEHOLDER_DEFAULT_GRID.cols,
    rows: PLACEHOLDER_DEFAULT_GRID.rows,
    label,
    seed: exhibitId,
  })

  return {
    id: `placeholder:${exhibitId}`,
    fps: 12,
    // Placeholder art is a single static frame: the slot is honest about
    // being a slot (R6). Real animation arrives with owner sources.
    frames: Object.freeze([frame]),
    grid: { ...PLACEHOLDER_DEFAULT_GRID },
    meta: {
      label,
      description: `Placeholder ASCII panel for the ${label.toLowerCase()} exhibit.`,
    },
  }
}
