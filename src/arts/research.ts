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

// bg, chain dark, helix, sheet, active site, substrate, label
const palette = ['#071629', '#0E2A4A', '#4DB6D4', '#91E2D6', '#FF9C73', '#B6A1FF', '#EAF8FF']
const buffer = createArtworkBuffer(palette)

// A polypeptide chain that morphs between a vertical alpha-helix coil (left)
// and an extended horizontal beta strand: the helix pitch breathes with time,
// and a slow cycle refolds the chain between the two states.
function chainPoint(t: number, fold: number, time: number): { x: number; y: number } {
  const helixX = 30 + Math.sin(t * Math.PI * 4 + time * 0.9) * 6
  const helixY = 27 - t * 21
  const strandX = 22 + t * 58
  const strandY = 13 + Math.sin(t * Math.PI * 2) * 1.5
  return {
    x: helixX * (1 - fold) + strandX * fold,
    y: helixY * (1 - fold) + strandY * fold,
  }
}

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  // Slow refolding cycle: 0 = helix, 1 = sheet, easing at the turnarounds.
  const raw = (time % 14) / 14
  const fold =
    raw < 0.45 ? 0 : raw < 0.55 ? (raw - 0.45) / 0.1 : raw < 0.95 ? 1 : 1 - (raw - 0.95) / 0.05

  writeText(buffer, 2, 1, '03 / RESEARCH  -  PROTEIN FOLDSCAPE', 2)

  // Backdrop: faint secondary-structure field.
  for (let dot = 0; dot < 40; dot += 1) {
    const x = 3 + ((dot * 29 + index) % 90)
    const y = 3 + ((dot * 19) % 28)
    if (buffer.chars[y * buffer.cols + x] === ' ') put(buffer, x, y, '.', 1)
  }

  // Fold-state caption in the clear top band.
  if (fold < 0.5) {
    writeText(buffer, 42, 4, 'ALPHA HELIX - breathing', 3)
  } else {
    writeText(buffer, 42, 4, 'BETA STRAND - extended', 3)
  }

  // The polypeptide chain, drawn as a thick animated ribbon.
  const steps = 44
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps
    const { x, y } = chainPoint(t, fold, time)
    const shade = s % 4 === 0 ? '█' : s % 2 === 0 ? '▓' : '▒'
    put(buffer, x, y, shade, 2)
    put(buffer, x, y + 1, s % 3 === 0 ? '░' : ' ', 1)
    if (fold < 0.5) put(buffer, x + 1, y, '░', 1) // helix edge glow
  }
  // Chain termini.
  const head = chainPoint(0, fold, time)
  const tail = chainPoint(1, fold, time)
  ellipse(buffer, head.x, head.y, 1.8, 1.1, 'O', 3, 0)
  writeText(buffer, Math.max(2, head.x - 8), Math.min(30, head.y + 2), 'N-TERM', 3)
  put(buffer, tail.x, tail.y, 'C', 6)
  writeText(buffer, Math.min(88, tail.x + 2), Math.max(3, tail.y - 1), 'C-TERM', 6)

  // Beta-sheet hint: parallel arrows appear when extended.
  if (fold > 0.5) {
    for (let arrow = 0; arrow < 3; arrow += 1) {
      const y = 24 + arrow * 2
      for (let col = 62; col < 86; col += 1) put(buffer, col, y, '-', 4)
      put(buffer, 86, y, '>', 4)
    }
    writeText(buffer, 62, 22, 'SHEET', 4)
  }

  // Active site: a pocket in the clear right-middle that glows when folded.
  const siteX = 66
  const siteY = 17 + Math.sin(time * 0.8) * 1.2
  ellipse(buffer, siteX, siteY, 5, 2.6, 'o', 5, time * 0.4)
  ellipse(buffer, siteX, siteY, 3.4, 1.8, '(', 5, time * 0.4)
  ellipse(buffer, siteX, siteY, 3.4, 1.8, ')', 5, time * 0.4)
  writeText(buffer, siteX - 5, siteY + 4, 'ACTIVE SITE', 5)

  // Substrate binds periodically.
  const bind = (time % 6) / 6
  const attached = bind > 0.35 && bind < 0.85
  const subX = attached ? siteX : 88 - bind * 22
  const subY = attached ? siteY : 7 + bind * 8
  shadedEllipse(buffer, subX, subY, 2.2, 1.3, 6, time * 0.6)
  ellipse(buffer, subX, subY, 3, 1.8, 'o', 6, 0)
  if (attached) ellipse(buffer, siteX, siteY, 6.5 + Math.sin(time * 5) * 0.8, 3.4, '.', 6)
  writeText(buffer, 80, 4, 'SUB', 6)

  // Hydrogen-bond dashes along the helix when coiled.
  if (fold < 0.5) {
    for (let s = 4; s < steps - 2; s += 4) {
      const { x, y } = chainPoint(s / steps, fold, time)
      put(buffer, x + 5, y - 1, '-', 1)
      put(buffer, x + 6, y - 1, '-', 1)
    }
  }

  writeText(buffer, 2, 32, 'FOLDING  /  ALPHA HELIX  /  BETA SHEET  /  ACTIVE SITE', 2)
  return finishArtwork(buffer)
}

export const researchArtwork = artworkSource(
  'research',
  'Protein foldscape',
  'A polypeptide chain that refolds between an alpha-helix coil and a beta strand, with hydrogen-bond dashes, a glowing active-site pocket, and a substrate that binds periodically.',
  palette,
  render,
)
