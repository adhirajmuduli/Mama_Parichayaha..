import {
  artworkSource,
  box,
  clearArtwork,
  createArtworkBuffer,
  ellipse,
  finishArtwork,
  line,
  put,
  writeText,
} from './shared'

const palette = ['#10102A', '#8F7CFF', '#59D7EA', '#C9F178', '#FF729D', '#F6E8FF']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const phase = (time * 0.45) % 1
  writeText(buffer, 2, 1, '02 / MOLECULAR SYSTEMS OBSERVATORY', 2)

  for (let x = 4; x < 68; x += 1) {
    const ripple = Math.sin(x * 0.22 + time * 0.35) * 0.65
    put(buffer, x, 9 + ripple, x % 4 === 0 ? 'o' : '-', 1)
    put(buffer, x, 13 + ripple, x % 4 === 0 ? 'o' : '-', 1)
    if (x % 3 === 0) put(buffer, x, 10 + ripple, '.', 2)
  }
  writeText(buffer, 3, 7, 'EXTRACELLULAR', 5)
  writeText(buffer, 3, 15, 'CYTOSOL', 5)

  const receptorX = 36
  line(buffer, receptorX, 7, receptorX - 2, 5, '\\', 4)
  line(buffer, receptorX - 2, 5, receptorX - 4, 4, '/', 4)
  line(buffer, receptorX, 7, receptorX + 2, 5, '/', 4)
  line(buffer, receptorX + 2, 5, receptorX + 4, 4, '\\', 4)
  line(buffer, receptorX - 1, 8, receptorX - 1, 14, '|', 4)
  line(buffer, receptorX + 1, 8, receptorX + 1, 14, '|', 4)
  writeText(buffer, receptorX - 5, 6, 'R', 5)

  const ligandX = 7 + phase * 25
  const ligandY = 4 + Math.sin(time * 1.1) * 0.7
  ellipse(buffer, ligandX, ligandY, 2.2, 1.2, 'o', 3, time)
  put(buffer, ligandX, ligandY, '*', 5)
  line(buffer, ligandX + 2, ligandY, receptorX - 4, 5, '.', 3)

  const cascade = [
    [35, 16],
    [28, 19],
    [40, 20],
    [31, 22],
    [47, 18],
    [52, 22],
    [22, 21],
  ] as const
  for (let node = 0; node < cascade.length; node += 1) {
    const point = cascade[node]
    const nextPoint = cascade[(node + 1) % cascade.length]
    if (!point || !nextPoint) continue
    const [x, y] = point
    const [nextX, nextY] = nextPoint
    line(buffer, x, y, nextX, nextY, node % 2 ? ':' : '.', 1)
    const bright = (time * 0.7 + node * 0.19) % 1
    ellipse(buffer, x, y, 1.5 + bright, 0.8 + bright * 0.3, '.', 4, time + node)
    put(buffer, x, y, bright > 0.75 ? '@' : 'o', bright > 0.75 ? 5 : 2)
  }

  for (let pulse = 0; pulse < 5; pulse += 1) {
    const travel = (phase + pulse / 5) % 1
    const x = 38 + travel * 20
    const y = 16 + Math.sin(travel * Math.PI * 2 + pulse) * 3
    put(buffer, x, y, travel > 0.82 ? '*' : '.', 3)
  }
  box(buffer, 57, 17, 12, 6, 2)
  writeText(buffer, 59, 19, 'SIGNAL', 5)
  writeText(buffer, 59, 21, `WAVE ${String((index % 8) + 1).padStart(2, '0')}`, 3)

  return finishArtwork(buffer)
}

export const interestsArtwork = artworkSource(
  'interests',
  'Molecular systems observatory',
  'A ligand approaches a membrane receptor as a branching, pulsing signal cascade travels through a molecular systems landscape.',
  palette,
  render,
)
