/**
 * Placeholder exhibit frames (new_plan.md §10.1) — deterministic ASCII art
 * that fills every exhibit slot until the owner's animation sources land.
 *
 * The frames are pure functions of (id, label, grid): identical across SSR
 * and client, so no-JS visitors see the same art as script users. Seeded
 * noise keeps each chapter visually distinct without any runtime randomness.
 */

export interface PlaceholderFrameOptions {
  /** Grid columns; frames never exceed this width. */
  cols: number
  /** Grid rows. */
  rows: number
  /** Uppercase slot label rendered inside the top border. */
  label: string
  /** Any string; seeds the deterministic dot field. */
  seed: string
}

export const PLACEHOLDER_DEFAULT_GRID = Object.freeze({ cols: 44, rows: 12 })

/** Deterministic LCG from a string seed; identical output everywhere. */
function createSeedRandom(seed: string): () => number {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  let state = hash >>> 0

  return () => {
    // Numerical Recipes constants: small, fast, decent visual spread.
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function createPlaceholderFrame(options: PlaceholderFrameOptions): string {
  const cols = Math.max(20, Math.min(80, Math.round(options.cols)))
  const rows = Math.max(6, Math.min(40, Math.round(options.rows)))
  const label = options.label
    .trim()
    .slice(0, cols - 6)
    .toUpperCase()
  const random = createSeedRandom(`${options.seed}:${label}`)

  const innerWidth = cols - 2
  const top = `┌${'─'.repeat(innerWidth)}┐`

  const labelRow = Math.max(1, Math.min(rows - 2, 2))
  const lines: string[] = [top]

  // Two phase-shifted sine ridges: a deliberate, quiet field instead of
  // random noise (which read as debug output next to the real exhibits).
  const phase = random() * Math.PI * 2
  const phaseTwo = random() * Math.PI * 2
  const amplitude = Math.max(1, Math.floor(rows / 6))
  const span = Math.max(2, Math.floor(innerWidth / 3))

  for (let row = 1; row < rows - 1; row += 1) {
    let content = ''

    if (row === labelRow) {
      const labelStart = Math.max(1, Math.floor((innerWidth - label.length) / 2))
      const left = ' '.repeat(labelStart)
      const right = ' '.repeat(Math.max(0, innerWidth - label.length - labelStart))
      content = `${left}${label}${right}`
    } else {
      const characters: string[] = []

      for (let column = 0; column < innerWidth; column += 1) {
        const waveA = Math.sin((column / span) * Math.PI + phase) * amplitude
        const waveB = Math.sin((column / (span * 1.7)) * Math.PI + phaseTwo) * amplitude
        const distance = Math.abs(row - 1 - rows / 2 - waveA - waveB * 0.4)

        if (distance < 0.45) characters.push('•')
        else if (distance < 1.05) characters.push('·')
        else if (distance < 1.8) characters.push('˙')
        else characters.push(' ')
      }

      content = characters.join('')
    }

    lines.push(`│${content.slice(0, innerWidth).padEnd(innerWidth, ' ')}│`)
  }

  lines.push(`└${'─'.repeat(innerWidth)}┘`)

  return lines.join('\n')
}
