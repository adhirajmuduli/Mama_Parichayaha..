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

const palette = ['#171820', '#F3E9D2', '#8BC9D8', '#E69B7A', '#B4A3E8', '#A2D3A7']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const drift = Math.floor((time * 2) % 7)
  writeText(buffer, 2, 1, '06 / EVIDENCE CONSTELLATION', 2)
  writeText(buffer, 2, 2, 'An open archive surface - no publications are implied.', 1)

  const cards = [
    { x: 4, y: 6, w: 17, h: 12, color: 2, label: 'FIGURE / A' },
    { x: 27, y: 5, w: 18, h: 14, color: 4, label: 'SIGNAL / B' },
    { x: 51, y: 7, w: 16, h: 11, color: 3, label: 'NOTES / C' },
  ]
  cards.forEach((card, cardIndex) => {
    box(buffer, card.x, card.y, card.w, card.h, card.color)
    writeText(buffer, card.x + 2, card.y + 1, card.label, 5)
    for (let row = 0; row < card.h - 4; row += 1) {
      const signal =
        card.y +
        card.h -
        3 -
        Math.round((card.h - 5) * (0.5 + 0.38 * Math.sin(row * 0.9 + time * 0.65 + cardIndex)))
      const x = card.x + 2 + row
      line(buffer, x, signal, x + 1, signal - 1, '/', card.color)
      put(buffer, x, signal, row === (index + drift + cardIndex) % (card.h - 4) ? '*' : '.', 1)
    }
    for (let row = 0; row < 3; row += 1) {
      const barWidth = 4 + ((row * 3 + cardIndex + drift) % (card.w - 6))
      line(
        buffer,
        card.x + 2,
        card.y + card.h - 2 - row,
        card.x + 1 + barWidth,
        card.y + card.h - 2 - row,
        '=',
        card.color,
      )
    }
  })

  line(buffer, 21, 12, 27, 11, '.', 2)
  line(buffer, 45, 11, 51, 12, '.', 4)
  for (let point = 0; point < 28; point += 1) {
    const angle = point * 2.4 + time * 0.12
    const radius = 3 + (point % 4) * 1.6
    const x = 36 + Math.cos(angle) * radius
    const y = 21 + Math.sin(angle) * radius * 0.35
    put(buffer, x, y, point % 7 === 0 ? '*' : '.', point % 2 ? 2 : 4)
  }
  writeText(buffer, 4, 22, 'METHODS   -   OBSERVATIONS   -   QUESTIONS   -   CITATIONS', 1)
  writeText(buffer, 55, 22, 'INDEX / 00', 5)
  return finishArtwork(buffer)
}

export const publicationsArtwork = artworkSource(
  'publications',
  'Evidence constellation',
  'An abstract archive of figure-like panels and evidence signals; intentionally no paper titles, citations, or publication claims are represented.',
  palette,
  render,
)
