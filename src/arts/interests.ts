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

// bg, membrane, helix dark, helix light, ligand, signal, pocket, readout
const palette = [
  '#10102A',
  '#2A3B6E',
  '#4A3FA8',
  '#8F7CFF',
  '#59D7EA',
  '#C9F178',
  '#FF729D',
  '#F6E8FF',
]
const buffer = createArtworkBuffer(palette)

const MEMBRANE_Y = 19
const RECEPTOR_X = 46
const HELIX_COUNT = 7

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000

  writeText(buffer, 2, 1, '02 / INTERESTS  -  MOLECULAR SYSTEMS OBSERVATORY', 3)
  writeText(buffer, 4, 4, 'EXTRACELLULAR', 1)
  writeText(buffer, 4, 31, 'CYTOSOL', 1)

  // Phospholipid bilayer across the middle: heads 'o', tails ':'.
  for (let col = 4; col < 93; col += 1) {
    const wave = Math.sin(col * 0.11 + time * 0.7) * 0.4
    put(buffer, col, MEMBRANE_Y - 1 + wave, 'o', 1)
    put(buffer, col, MEMBRANE_Y + 1 + wave, 'o', 1)
    if (col % 2 === 0) put(buffer, col, MEMBRANE_Y + wave, ':', 1)
  }

  // Receptor: seven transmembrane helices as shaded vertical bars.
  for (let h = 0; h < HELIX_COUNT; h += 1) {
    const x = RECEPTOR_X - 9 + h * 3
    const lean = Math.sin(time * 0.6 + h) * 0.6
    for (let y = MEMBRANE_Y - 6; y <= MEMBRANE_Y + 6; y += 1) {
      const inside = y > MEMBRANE_Y - 3 && y < MEMBRANE_Y + 3
      const glyph = inside ? '▓' : '▒'
      put(buffer, x + lean * ((y - MEMBRANE_Y) / 6), y, glyph, 3)
    }
    put(buffer, x + lean * -1, MEMBRANE_Y - 7, 'T', 4)
  }
  // Binding pocket: a notch on the extracellular side.
  for (let col = RECEPTOR_X - 5; col <= RECEPTOR_X + 5; col += 1) {
    put(
      buffer,
      col,
      MEMBRANE_Y - 8,
      col === RECEPTOR_X - 5 || col === RECEPTOR_X + 5 ? '|' : ' ',
      6,
    )
  }
  put(buffer, RECEPTOR_X, MEMBRANE_Y - 8, 'v', 6)
  writeText(buffer, RECEPTOR_X - 4, MEMBRANE_Y - 10, 'RECEPTOR', 4)

  // Ligand: a diamond "key" approaching the pocket, docking on a cycle.
  const cycle = (time % 7) / 7
  const dock = cycle < 0.45 ? 1 - cycle / 0.45 : cycle < 0.6 ? 1 : 0 // ease in, hold, release
  const ligandX = 18 + (1 - dock) * (RECEPTOR_X - 18) * 0.9
  const ligandY = 8 + (1 - dock) * (MEMBRANE_Y - 9 - 8) + Math.sin(time * 1.3) * 0.7
  shadedEllipse(buffer, ligandX, ligandY, 2.6, 1.5, 4, time * 0.8)
  ellipse(buffer, ligandX, ligandY, 3.6, 2.2, 'o', 4, 0)
  if (dock >= 1)
    ellipse(buffer, RECEPTOR_X, MEMBRANE_Y - 8, 6 + Math.sin(time * 6) * 1.2, 2.2, '.', 5)
  writeText(buffer, 8, 5, 'LIGAND', 4)

  // Intracellular G-protein detaches and a signal wave travels right.
  const gx = RECEPTOR_X + 6 + Math.min(cycle * 30, 26)
  const gy = MEMBRANE_Y + 5
  shadedEllipse(buffer, gx, gy, 2.2, 1.3, 5, time * 0.5)
  ellipse(buffer, gx, gy, 3, 1.8, 'o', 5, 0)
  for (let pulse = 0; pulse < 4; pulse += 1) {
    const progress = (time * 0.5 + pulse * 0.25) % 1
    const x = RECEPTOR_X + 10 + progress * 36
    if (x < 92) {
      put(buffer, x, MEMBRANE_Y + 2, '>', 5)
      put(buffer, x - 1, MEMBRANE_Y + 2, '.', 5)
    }
  }
  writeText(buffer, RECEPTOR_X + 8, MEMBRANE_Y + 9, 'SIGNAL CASCADE', 5)

  // Readout panel bottom-right: animated activation meter.
  const act =
    dock >= 1 ? 0.9 - Math.abs(Math.sin(time * 2)) * 0.25 : 0.08 + 0.05 * Math.sin(time * 3)
  box(buffer, 70, 25, 24, 6, 7)
  writeText(buffer, 72, 26, 'GPCR  ACTIVE', 7)
  const barWidth = Math.round(act * 18)
  for (let i = 0; i < 18; i += 1)
    put(buffer, 72 + i, 28, i < barWidth ? '=' : '-', i < barWidth ? 5 : 1)
  put(buffer, 72 + 18, 28, '|', 7)
  writeText(buffer, 72, 29, act.toFixed(2), 6)

  // Ambient molecules.
  for (let dot = 0; dot < 16; dot += 1) {
    const x = 5 + ((dot * 53 + index) % 86)
    const y = dot % 2 === 0 ? 5 + ((dot * 11) % 10) : 24 + ((dot * 7) % 7)
    if (buffer.chars[y * buffer.cols + x] === ' ') put(buffer, x, y, dot % 4 === 0 ? '*' : '.', 1)
  }

  writeText(buffer, 2, 32, 'RECEPTOR  /  LIGAND DOCKING  /  SIGNAL TRANSDUCTION', 3)
  return finishArtwork(buffer)
}

export const interestsArtwork = artworkSource(
  'interests',
  'Molecular systems observatory',
  'A seven-helix membrane receptor with a ligand docking into its extracellular pocket, a G-protein detaching inside, and a signal cascade propagating along the cytosol with a live activation meter.',
  palette,
  render,
)
