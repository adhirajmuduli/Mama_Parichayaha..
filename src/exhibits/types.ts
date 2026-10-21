'use client'

/**
 * ASCII exhibit source contract (new_plan.md §10.2) — the ONLY interface the
 * owner's animation code must implement. Frames are pure strings on a fixed
 * grid; adapters may ship precomputed `frames` or a deterministic `render`.
 */

export interface AsciiGrid {
  rows: number
  cols: number
}

export interface AsciiExhibitSource {
  id: string
  /** Nominal authored frame rate; the player caps it per quality tier. */
  fps: number
  /** Optional precomputed frame set; the player indexes it modulo length. */
  frames?: readonly string[]
  /**
   * Pure renderer for generative sources. `index` advances at the effective
   * frame rate; `elapsedMs` is wall-clock since playback start. Must be
   * deterministic: same inputs, same frame. Ignored when `frames` is set.
   */
  render?: (index: number, elapsedMs: number) => string
  /** Declared grid when stable; inferred from frame 0 otherwise. */
  grid?: AsciiGrid
  meta?: {
    label?: string
    description?: string
  }
}

export interface ResolvedAsciiSource {
  source: AsciiExhibitSource
  /** 'placeholder' while the deterministic placeholder art fills the slot. */
  placeholder: boolean
}

/** Validates a resolved source once at registry resolution (dev-strict). */
export function describeSourceGrid(source: AsciiExhibitSource): AsciiGrid {
  if (source.grid) {
    return source.grid
  }

  const frame = source.frames?.[0] ?? source.render?.(0, 0) ?? ''
  const rows = frame ? frame.split('\n').length : 0
  const cols = frame.split('\n').reduce((width, line) => Math.max(width, line.length), 0)

  return { rows, cols }
}

/** Frame accessor honoring both source shapes; returns null when empty. */
export function readSourceFrame(
  source: AsciiExhibitSource,
  index: number,
  elapsedMs: number,
): string | null {
  if (source.frames && source.frames.length > 0) {
    return (
      source.frames[
        ((index % source.frames.length) + source.frames.length) % source.frames.length
      ] ?? null
    )
  }

  if (source.render) {
    return source.render(index, elapsedMs)
  }

  return null
}
