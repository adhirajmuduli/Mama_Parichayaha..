import {
  artworkSource,
  clearArtwork,
  createArtworkBuffer,
  ellipse,
  finishArtwork,
  line,
  put,
  shadedEllipse,
  writeText,
} from './shared'

const palette = ['#081820', '#48D8CF', '#F08A74', '#FFD08A', '#9B83FF', '#D6F4E8']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const pulse = (time % 8) / 8
  writeText(buffer, 2, 1, '01 / ORIGINS   -   CELLULAR LANDSCAPE', 1)

  shadedEllipse(buffer, 34, 13, 23, 7, 1, time * 0.2)
  ellipse(buffer, 34, 13, 27, 9, '.', 1, Math.sin(time * 0.18) * 0.08)
  ellipse(buffer, 34, 13, 25, 7, '-', 2, Math.sin(time * 0.18) * 0.08)

  for (let col = 8; col < 61; col += 1) {
    const wave = Math.sin(col * 0.23 + time * 0.55) * 1.15
    put(buffer, col, 7 + wave, col % 3 === 0 ? 'o' : ':', 2)
    put(buffer, col, 19 + wave, col % 4 === 0 ? 'o' : ':', 2)
    if (col % 2 === 0) put(buffer, col, 8 + wave, '.', 3)
  }

  shadedEllipse(buffer, 31, 13, 9, 4, 4, time * 0.12)
  ellipse(buffer, 31, 13, 9, 4, '~', 4, time * 0.09)
  ellipse(buffer, 31, 13, 6, 2, '.', 5, -time * 0.08)
  for (let organelle = 0; organelle < 2; organelle += 1) {
    const x = organelle === 0 ? 16 : 45
    const y = 12 + Math.sin(time * 0.4 + organelle) * 2
    shadedEllipse(buffer, x, y, 4, 1.5, 2, time * 0.18 + organelle)
    ellipse(buffer, x, y, 4, 1.5, '(', 3, time * 0.18 + organelle)
    line(buffer, x - 2, y, x + 2, y, '~', 4)
  }

  const channelX = 52
  for (let y = 8; y <= 19; y += 1) {
    put(buffer, channelX - 2, y, y % 2 ? '[' : '{', 5)
    put(buffer, channelX + 2, y, y % 2 ? ']' : '}', 5)
  }
  writeText(buffer, 46, 5, 'GATE', 5)

  const tracerX = 10 + pulse * 47
  const tracerY = 13 + Math.sin(time * 0.7) * 2
  for (let tail = 4; tail >= 0; tail -= 1) {
    put(
      buffer,
      tracerX - tail,
      tracerY,
      tail === 0 ? '@' : tail < 2 ? 'o' : '.',
      tail === 0 ? 3 : 1,
    )
  }
  ellipse(buffer, tracerX, tracerY, 3 + Math.sin(time * 1.2), 1.5, '.', 3, time)

  for (let dot = 0; dot < 18; dot += 1) {
    const x = ((dot * 37 + index * 3) % 66) + 3
    const y = 4 + ((dot * 13) % 17)
    if (buffer.chars[y * buffer.cols + x] === ' ') put(buffer, x, y, dot % 3 ? '.' : '*', 1)
  }

  writeText(buffer, 2, 23, 'MEMBRANE  /  TRANSPORT  /  FLUORESCENT TRACER', 2)
  return finishArtwork(buffer)
}

export const originsArtwork = artworkSource(
  'origins',
  'Emergent cell',
  'A recurring cellular landscape with a rippling membrane, organelles, a gated transport channel, and a moving fluorescent tracer.',
  palette,
  render,
)
