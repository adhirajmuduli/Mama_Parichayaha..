import {
  artworkSource,
  box,
  clearArtwork,
  createArtworkBuffer,
  finishArtwork,
  line,
  put,
  writeText,
} from './shared'

const palette = ['#071B18', '#52E0A5', '#7BCBFF', '#F1C96A', '#FA7897', '#D6FFF0']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const sweep = (time * 8) % 56
  writeText(buffer, 2, 1, '04 / INFERENCE FIELD   -   SIGNAL INTO STRUCTURE', 1)

  box(buffer, 2, 4, 18, 17, 1)
  writeText(buffer, 4, 5, 'INPUT / SEQUENCE', 5)
  const bases = 'ACGT'
  for (let row = 0; row < 11; row += 1) {
    const text = Array.from(
      { length: 12 },
      (_, col) => bases[(row * 3 + col * 7 + Math.floor(time * 1.5)) % bases.length],
    ).join('')
    writeText(buffer, 4, 7 + row, text, row % 3 === 0 ? 3 : 1)
  }

  box(buffer, 24, 4, 20, 17, 2)
  writeText(buffer, 26, 5, 'FEATURE / CONFIDENCE', 5)
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      const score = (Math.sin(row * 0.72 + col * 0.51 + time * 0.8) + 1) / 2
      const glyph = score > 0.82 ? '@' : score > 0.65 ? '#' : score > 0.43 ? '+' : '.'
      const color = score > 0.78 ? 4 : score > 0.52 ? 1 : 2
      put(buffer, 27 + col, 7 + row, glyph, color)
    }
  }
  line(buffer, 20, 12, 24, 12, '>', 3)
  line(buffer, 44, 12, 49, 12, '>', 3)

  box(buffer, 49, 4, 21, 17, 1)
  writeText(buffer, 51, 5, 'MODEL / FIELD', 5)
  const modelPoints: Array<[number, number]> = []
  for (let step = 0; step < 25; step += 1) {
    const t = step / 24
    const x = 52 + t * 15
    const y = 13 + Math.sin(t * Math.PI * 3 + time * 0.5) * (2 + Math.cos(time * 0.25))
    modelPoints.push([x, y])
    put(buffer, x, y, step % 4 === 0 ? 'o' : '.', step % 5 === 0 ? 3 : 2)
  }
  for (let step = 0; step < modelPoints.length - 1; step += 2) {
    const start = modelPoints[step]
    const end = modelPoints[step + 1]
    if (start && end) line(buffer, start[0], start[1], end[0], end[1], '~', 1)
  }

  const scanX = 5 + sweep
  line(buffer, scanX, 3, scanX, 22, '|', 3)
  writeText(
    buffer,
    3,
    23,
    `PASS ${String(index % 99).padStart(2, '0')}  /  HYPOTHESIS -> TEST -> REVISE`,
    5,
  )
  return finishArtwork(buffer)
}

export const computationArtwork = artworkSource(
  'computation',
  'Inference field',
  'An abstract recurring visualization moves from sequence-like input through a shifting confidence field toward a reconstructed model; it represents a workflow, not a scientific result.',
  palette,
  render,
)
