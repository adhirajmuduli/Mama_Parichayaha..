import {
  artworkSource,
  clearArtwork,
  createArtworkBuffer,
  ellipse,
  finishArtwork,
  line,
  put,
  writeText,
} from './shared'

const palette = ['#11152D', '#7584FF', '#60E4C0', '#FF937E', '#EBD58A', '#E8EEFF']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const pulse = (time * 0.18) % 1
  writeText(buffer, 2, 1, '05 / SYSTEMS ATTRACTOR CHAMBER', 1)

  const nodes = [
    [13, 9],
    [25, 6],
    [37, 10],
    [53, 7],
    [20, 17],
    [34, 18],
    [49, 17],
    [62, 12],
  ] as const
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [2, 5],
    [2, 6],
    [1, 5],
    [3, 6],
  ] as const

  for (let edge = 0; edge < edges.length; edge += 1) {
    const edgePair = edges[edge]
    if (!edgePair) continue
    const [fromIndex, toIndex] = edgePair
    const from = nodes[fromIndex]
    const to = nodes[toIndex]
    if (!from || !to) continue
    line(buffer, from[0], from[1], to[0], to[1], edge % 3 ? '.' : '-', edge % 2 ? 1 : 2)

    for (let dot = 0; dot < 4; dot += 1) {
      const progress = (pulse + dot / 4 + edge * 0.11) % 1
      put(
        buffer,
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
        progress > 0.85 ? '*' : '.',
        progress > 0.82 ? 4 : 3,
      )
    }
  }

  nodes.forEach(([x, y], node) => {
    const wave = 0.5 + 0.5 * Math.sin(time * (0.7 + node * 0.04) + node)
    ellipse(buffer, x, y, 2 + wave, 1 + wave * 0.4, '.', node % 2 ? 2 : 1, time * 0.1)
    put(
      buffer,
      x,
      y,
      node === index % nodes.length ? '@' : 'O',
      node === index % nodes.length ? 4 : 5,
    )
    writeText(buffer, x - 2, y + 2, `G${node + 1}`, 1)
  })

  ellipse(buffer, 37, 12, 23 + Math.sin(time * 0.2) * 2, 9, ':', 4, time * 0.04)
  writeText(buffer, 2, 23, 'FEEDBACK  /  OSCILLATION  /  EMERGENT STATE', 2)
  return finishArtwork(buffer)
}

export const futureArtwork = artworkSource(
  'future',
  'Systems attractor chamber',
  'A changing regulatory network routes recurrent signals between coupled nodes, showing an abstract systems-biology landscape rather than a specific measured pathway.',
  palette,
  render,
)
