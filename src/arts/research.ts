import {
  artworkSource,
  box,
  clearArtwork,
  createArtworkBuffer,
  ellipse,
  finishArtwork,
  line,
  put,
  shadedEllipse,
  writeText,
} from './shared'

const palette = ['#071629', '#4DB6D4', '#91E2D6', '#FF9C73', '#B6A1FF', '#EAF8FF']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const phase = time * 0.32
  writeText(buffer, 2, 1, '03 / PROTEIN FOLDSCAPE   -   ENSEMBLE, NOT ONE POSE', 1)

  shadedEllipse(buffer, 26, 12, 19, 6, 1, phase)
  const points: Array<[number, number]> = []
  for (let step = 0; step < 45; step += 1) {
    const t = step / 44
    const x = 5 + t * 43
    const fold = Math.sin(t * Math.PI * 3.2 + phase) * (4 + Math.sin(phase * 0.6) * 1.4)
    const y = 12 + fold + Math.sin(t * Math.PI * 7 - phase * 0.7) * 1.2
    points.push([x, y])
    if (step % 4 === 0) shadedEllipse(buffer, x, y, 2.4, 1.1, 2, phase + step * 0.1)
    put(buffer, x, y, step % 5 === 0 ? 'o' : step % 2 === 0 ? '.' : ':', step % 7 === 0 ? 3 : 1)
  }

  for (let step = 0; step < points.length - 1; step += 1) {
    const point = points[step]
    const nextPoint = points[step + 1]
    if (!point || !nextPoint) continue
    const [x, y] = point
    const [nextX, nextY] = nextPoint
    if (step % 2 === 0) line(buffer, x, y, nextX, nextY, '~', 2)
  }

  const contacts = [
    [7, 18],
    [15, 5],
    [25, 18],
    [34, 6],
    [44, 17],
  ] as const
  for (let contact = 0; contact < contacts.length; contact += 1) {
    const position = contacts[contact]
    if (!position) continue
    const [x, y] = position
    const anchor = points[(contact * 9 + index) % points.length]
    if (anchor) {
      line(buffer, anchor[0], anchor[1], x, y, '.', 4)
      put(buffer, x, y, 'x', 3)
    }
  }

  ellipse(buffer, 51, 11, 6 + Math.sin(phase) * 0.8, 3.3, ':', 4, phase)
  ellipse(buffer, 51, 11, 3.6, 1.7, '.', 2, -phase)
  put(buffer, 51 + Math.sin(time * 0.5) * 3, 11 + Math.cos(time * 0.7), '@', 3)

  box(buffer, 59, 5, 10, 15, 1)
  writeText(buffer, 61, 7, 'STATE', 5)
  for (let bar = 0; bar < 8; bar += 1) {
    const level = Math.round(1 + 5 * (0.5 + 0.5 * Math.sin(time * 0.8 + bar * 0.65)))
    for (let height = 0; height < level; height += 1) {
      put(buffer, 61 + bar, 17 - height, bar % 3 === 0 ? '#' : '=', bar % 2 ? 2 : 1)
    }
  }
  writeText(buffer, 3, 22, 'CONTACTS SHIFT  /  CONFORMATIONS BREATHE  /  CONFIDENCE IS A FIELD', 2)

  return finishArtwork(buffer)
}

export const researchArtwork = artworkSource(
  'research',
  'Protein foldscape',
  'A changing conformational ensemble links a flexible backbone, transient contacts, and an abstract energy basin; it does not depict a single experimentally determined structure.',
  palette,
  render,
)
