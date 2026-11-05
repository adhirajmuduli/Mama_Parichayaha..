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

// bg, edge, paper, cited, this-work, legend
const palette = ['#171820', '#262A38', '#F3E9D2', '#8BC9D8', '#E69B7A', '#A2D3A7']
const buffer = createArtworkBuffer(palette)

// Paper nodes: position, radius (citation count), whether cited this cycle.
const PAPERS = [
  { x: 14, y: 8, r: 2.2 },
  { x: 26, y: 5, r: 1.6 },
  { x: 38, y: 10, r: 3 },
  { x: 22, y: 17, r: 1.8 },
  { x: 44, y: 20, r: 2.4 },
  { x: 58, y: 7, r: 1.5 },
  { x: 66, y: 15, r: 2.8 },
  { x: 80, y: 9, r: 2 },
  { x: 74, y: 24, r: 1.7 },
  { x: 34, y: 27, r: 1.4 },
  { x: 54, y: 28, r: 2 },
  { x: 88, y: 18, r: 1.6 },
]
// Citation edges as index pairs; strength 1 = faint, 2 = strong.
const EDGES: [number, number, number][] = [
  [0, 1, 1],
  [0, 3, 2],
  [1, 2, 1],
  [2, 4, 2],
  [3, 4, 1],
  [2, 5, 1],
  [5, 6, 2],
  [6, 7, 1],
  [6, 8, 2],
  [4, 8, 1],
  [4, 10, 1],
  [9, 10, 1],
  [7, 11, 1],
  [8, 11, 2],
  [2, 6, 1],
  [0, 2, 1],
]
const THIS_WORK = 6

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000

  writeText(buffer, 2, 1, '06 / PUBLICATIONS  -  EVIDENCE CONSTELLATION', 2)

  // Citation edges (under nodes); strong edges get a second pass of dots.
  for (const [a, b, strength] of EDGES) {
    const from = PAPERS[a]
    const to = PAPERS[b]
    if (!from || !to) continue
    const steps = 16
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps
      put(
        buffer,
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        strength === 2 && s % 2 === 0 ? '=' : '.',
        1,
      )
    }
  }

  // Citation pulses travel along the strong edges.
  for (const [a, b, strength] of EDGES) {
    if (strength !== 2) continue
    const from = PAPERS[a]
    const to = PAPERS[b]
    if (!from || !to) continue
    const progress = (time * 0.4 + a * 0.13) % 1
    put(buffer, from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress, 'o', 3)
  }

  // Paper nodes: shaded discs; the "this work" node gets a ring + halo.
  PAPERS.forEach((paper, i) => {
    const cited = (time * 0.5 + i * 0.17) % 1 < 0.25
    shadedEllipse(buffer, paper.x, paper.y, paper.r, paper.r * 0.55, 2, time * 0.4 + i)
    ellipse(buffer, paper.x, paper.y, paper.r + 0.9, (paper.r + 0.9) * 0.55, 'o', cited ? 3 : 2, 0)
    if (i === THIS_WORK) {
      ellipse(
        buffer,
        paper.x,
        paper.y,
        paper.r + 2.2 + Math.sin(time * 3) * 0.4,
        (paper.r + 2.2) * 0.55,
        '.',
        4,
      )
      writeText(buffer, paper.x - 5, paper.y - 4, 'THIS WORK', 4)
    }
  })

  // Legend / counters panel.
  box(buffer, 4, 29, 40, 3, 5)
  writeText(
    buffer,
    6,
    30,
    `${PAPERS.length} PAPERS · ${EDGES.filter((e) => e[2] === 2).length} STRONG CITATIONS`,
    5,
  )

  // Reading: every node is evidence; edges are citations.
  writeText(buffer, 50, 30, 'NODES = PAPERS · EDGES = CITATIONS', 1)

  writeText(buffer, 2, 32, 'EVIDENCE  /  CITATION FLOW  /  CURRENT WORK', 2)
  return finishArtwork(buffer)
}

export const publicationsArtwork = artworkSource(
  'publications',
  'Evidence constellation',
  'A constellation of paper nodes sized by citation count, linked by citation edges; pulses travel the strong edges, the current work is ringed and labelled, and a legend panel counts papers and strong citations.',
  palette,
  render,
)
