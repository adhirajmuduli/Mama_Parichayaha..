import {
  artworkSource,
  box,
  clearArtwork,
  createArtworkBuffer,
  finishArtwork,
  put,
  shadedEllipse,
  writeText,
} from './shared'

// bg, contour dark, basin, trajectory, ball, readout
const palette = ['#11152D', '#232B66', '#7584FF', '#60E4C0', '#FF937E', '#EBD58A']
const buffer = createArtworkBuffer(palette)

const BASIN = { x: 62, y: 16, rx: 20, ry: 9 }

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000

  writeText(buffer, 2, 1, '05 / FUTURE  -  SYSTEMS ATTRACTOR CHAMBER', 2)

  // Potential landscape: nested contour rings of the basin (a shaded well).
  for (let ring = 4; ring >= 1; ring -= 1) {
    const pulse = 1 + Math.sin(time * 1.1 + ring * 0.7) * 0.03
    for (let step = 0; step < 120; step += 1) {
      const angle = (step / 120) * Math.PI * 2
      const x = BASIN.x + Math.cos(angle) * BASIN.rx * (ring / 4) * pulse
      const y = BASIN.y + Math.sin(angle) * BASIN.ry * (ring / 4) * pulse
      put(buffer, x, y, ring % 2 === 0 ? 'o' : '.', ring === 1 ? 4 : 1)
    }
  }
  shadedEllipse(buffer, BASIN.x, BASIN.y, 11, 5, 2, time * 0.5)
  writeText(buffer, BASIN.x - 7, BASIN.y + 11, 'ATTRACTOR BASIN', 4)

  // Three trajectories spiraling into the basin from different starts.
  const starts = [
    { x: 12, y: 6 },
    { x: 16, y: 27 },
    { x: 40, y: 4 },
  ]
  for (let trajectory = 0; trajectory < starts.length; trajectory += 1) {
    const start = starts[trajectory]
    if (!start) continue
    const head = (time * 0.24 + trajectory * 0.33) % 1
    for (let s = 0; s < 26; s += 1) {
      const t = (head - s * 0.028 + 1) % 1
      const angle = t * Math.PI * 5 + trajectory * 2.1
      const radius = 1 - t * 0.82
      const x = BASIN.x + (start.x - BASIN.x) * (1 - t) + Math.cos(angle) * 14 * radius
      const y = BASIN.y + (start.y - BASIN.y) * (1 - t) + Math.sin(angle) * 6 * radius
      put(buffer, x, y, s === 0 ? '@' : s < 4 ? 'o' : '.', 3)
    }
  }
  writeText(buffer, 6, 10, 'TRAJECTORIES', 3)

  // The system state: a ball that has settled near the basin floor, with a
  // residual wobble.
  const ballX = BASIN.x + Math.sin(time * 0.9) * 1.5
  const ballY = BASIN.y + Math.cos(time * 0.7) * 0.8
  shadedEllipse(buffer, ballX, ballY, 2.4, 1.3, 4, time * 0.3)
  put(buffer, ballX, ballY, 'O', 5)

  // Energy readout: E decays toward the minimum each cycle.
  box(buffer, 4, 24, 34, 7, 5)
  writeText(buffer, 6, 25, 'POTENTIAL  E(t)', 5)
  const cycle = (time % 10) / 10
  const energy = Math.exp(-4 * cycle) + 0.03
  for (let s = 0; s <= 20; s += 1) {
    const t = s / 20
    const x = 6 + t * 28
    const y = 29 - (Math.exp(-4 * t) + 0.03) * 3
    put(buffer, x, y, s <= cycle * 20 ? '*' : '.', 5)
  }
  writeText(buffer, 6, 29, energy.toFixed(3), 5)
  writeText(buffer, 26, 25, 'E -> min', 2)

  // Direction-of-time arrow into the basin.
  for (let col = 88; col >= 74; col -= 2) put(buffer, col, 30, '-', 2)
  put(buffer, 72, 30, '<', 2)
  writeText(buffer, 74, 31, 'LOW ENERGY', 2)

  writeText(buffer, 2, 32, 'ATTRACTORS  /  TRAJECTORIES  /  ENERGY MINIMA', 2)
  return finishArtwork(buffer)
}

export const futureArtwork = artworkSource(
  'future',
  'Systems attractor chamber',
  'A potential landscape drawn as nested contour rings of an attractor basin; three trajectories spiral inward, the system ball settles at the floor with a residual wobble, and a live potential readout decays toward the minimum.',
  palette,
  render,
)
