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

// bg, cytoplasm, membrane outer, membrane inner, nucleus, nucleolus/pores,
// mitochondrion, tracer/gate
const palette = [
  '#07131b',
  '#123243',
  '#48D8CF',
  '#1f8f8a',
  '#9B83FF',
  '#D6F4E8',
  '#F08A74',
  '#FFD08A',
]
const buffer = createArtworkBuffer(palette)

const CELL = { x: 42, y: 17, rx: 33, ry: 12 }
const NUCLEUS = { x: 34, y: 17, rx: 9, ry: 5 }
const GATE_X = 76

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const ripple = Math.sin(time * 0.5) * 0.5

  writeText(buffer, 2, 1, '01 / ORIGINS  -  CELLULAR LANDSCAPE', 2)

  // Cytoplasm: faint grain fill inside the cell.
  shadedEllipse(buffer, CELL.x, CELL.y, CELL.rx - 1, CELL.ry - 1, 1, time * 0.1)

  // Phospholipid bilayer: two membrane rings, heads as 'o', tails as ':'.
  ellipse(buffer, CELL.x, CELL.y, CELL.rx, CELL.ry + ripple, 'o', 2, time * 0.15)
  ellipse(buffer, CELL.x, CELL.y, CELL.rx - 2, CELL.ry - 1 + ripple, 'o', 3, time * 0.15)
  for (let step = 0; step < 90; step += 1) {
    const angle = (step / 90) * Math.PI * 2
    put(
      buffer,
      CELL.x + Math.cos(angle) * (CELL.rx - 1),
      CELL.y + Math.sin(angle) * (CELL.ry - 0.5 + ripple),
      ':',
      3,
    )
  }

  // Gated channel punched through the membrane on the right: break the rings
  // there and draw a pore with brackets.
  for (let y = CELL.y - 4; y <= CELL.y + 4; y += 1) {
    put(buffer, GATE_X, y, ' ', 0)
  }
  line(buffer, GATE_X - 1, CELL.y - 5, GATE_X - 1, CELL.y - 2, '|', 7)
  line(buffer, GATE_X - 1, CELL.y + 2, GATE_X - 1, CELL.y + 5, '|', 7)
  line(buffer, GATE_X + 1, CELL.y - 5, GATE_X + 1, CELL.y - 2, '|', 7)
  line(buffer, GATE_X + 1, CELL.y + 2, GATE_X + 1, CELL.y + 5, '|', 7)
  put(buffer, GATE_X, CELL.y - 4, '-', 7)
  put(buffer, GATE_X, CELL.y + 4, '-', 7)
  writeText(buffer, GATE_X - 2, CELL.y - 7, 'GATE', 7)

  // Nucleus: envelope ring with pores, shaded body, nucleolus.
  shadedEllipse(buffer, NUCLEUS.x, NUCLEUS.y, NUCLEUS.rx - 1, NUCLEUS.ry - 1, 4, time * 0.08)
  ellipse(buffer, NUCLEUS.x, NUCLEUS.y, NUCLEUS.rx, NUCLEUS.ry, 'o', 4, time * 0.1)
  for (let step = 0; step < 60; step += 1) {
    if (step % 7 === 0) {
      const angle = (step / 60) * Math.PI * 2
      put(
        buffer,
        NUCLEUS.x + Math.cos(angle) * NUCLEUS.rx,
        NUCLEUS.y + Math.sin(angle) * NUCLEUS.ry,
        '.',
        5,
      )
    }
  }
  shadedEllipse(buffer, NUCLEUS.x - 2, NUCLEUS.y + 1, 3, 1.6, 5, -time * 0.12)

  // Mitochondria: oval outline + cristae zigzags, gently bobbing.
  for (let mito = 0; mito < 2; mito += 1) {
    const x = mito === 0 ? 20 : 52
    const y = 13 + mito * 8 + Math.sin(time * 0.45 + mito * 2) * 1.2
    ellipse(buffer, x, y, 5, 2.4, '(', 6, time * 0.2 + mito)
    ellipse(buffer, x, y, 5, 2.4, ')', 6, time * 0.2 + mito)
    for (let c = -3; c <= 3; c += 1) {
      put(buffer, x + c, y + (c % 2 === 0 ? -1 : 1) * 0.8, c % 2 === 0 ? '≈' : '=', 6)
    }
  }

  // Endoplasmic reticulum: wavy parallel lines near the nucleus.
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      put(
        buffer,
        NUCLEUS.x + 12 + col,
        NUCLEUS.y - 3 + row * 2 + Math.sin(col * 0.9 + time * 0.6 + row) * 0.5,
        row % 2 === 0 ? '~' : '=',
        3,
      )
    }
  }

  // Cytoskeleton: sparse filaments radiating toward the membrane.
  for (let filament = 0; filament < 5; filament += 1) {
    const angle = Math.PI * (0.15 + filament * 0.18) + Math.sin(time * 0.2) * 0.05
    const x1 = NUCLEUS.x + Math.cos(angle) * (NUCLEUS.rx + 2)
    const y1 = NUCLEUS.y + Math.sin(angle) * (NUCLEUS.ry + 1)
    const x2 = CELL.x + Math.cos(angle) * (CELL.rx - 3)
    const y2 = CELL.y + Math.sin(angle) * (CELL.ry - 2)
    const steps = 6
    for (let s = 1; s < steps; s += 1) {
      const t = s / steps
      put(buffer, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, s % 2 === 0 ? '·' : '.', 1)
    }
  }

  // Vesicles drifting along an arc.
  for (let v = 0; v < 3; v += 1) {
    const angle = time * 0.35 + v * 2.1
    const x = CELL.x + Math.cos(angle) * (CELL.rx - 8)
    const y = CELL.y + Math.sin(angle) * (CELL.ry - 4)
    ellipse(buffer, x, y, 1.4, 0.8, 'o', 5, 0)
  }

  // Fluorescent tracer: crosses the membrane through the gate, loops outside.
  const pulse = (time % 9) / 9
  const tracerX = pulse < 0.55 ? 12 + pulse * 1.8 * (GATE_X - 12) : GATE_X + (pulse - 0.55) * 2 * 16
  const tracerY = CELL.y + Math.sin(time * 0.9) * 2
  for (let tail = 4; tail >= 0; tail -= 1) {
    put(
      buffer,
      tracerX - tail,
      tracerY,
      tail === 0 ? '@' : tail < 2 ? 'o' : '.',
      tail === 0 ? 7 : 2,
    )
  }

  // Extracellular molecules drifting.
  for (let dot = 0; dot < 22; dot += 1) {
    const x = ((dot * 41 + index * 2) % (CELL.rx * 2 + 12)) + 4
    const y = 3 + ((dot * 17 + Math.floor(time * 2) * 3) % (CELL.ry * 2 + 14))
    if (x < CELL.x - CELL.rx + 2 || x > CELL.x + CELL.rx - 2) {
      if (buffer.chars[y * buffer.cols + x] === ' ') {
        put(buffer, x, y, dot % 3 === 0 ? '*' : '.', 1)
      }
    }
  }

  writeText(buffer, 2, 32, 'MEMBRANE · NUCLEUS · MITOCHONDRIA · GATED TRANSPORT', 2)
  return finishArtwork(buffer)
}

export const originsArtwork = artworkSource(
  'origins',
  'Emergent cell',
  'A living cell: phospholipid bilayer membrane, porous nucleus with nucleolus, mitochondria with cristae, ER, cytoskeleton, vesicles, and a fluorescent tracer crossing a gated channel.',
  palette,
  render,
)
