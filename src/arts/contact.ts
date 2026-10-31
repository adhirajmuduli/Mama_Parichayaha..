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

const palette = ['#071B1C', '#43D9C1', '#79B8FF', '#F3BC69', '#ED86AA', '#D6FFF4']
const buffer = createArtworkBuffer(palette)

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000
  const nodes = [
    [8, 8],
    [18, 5],
    [24, 14],
    [15, 20],
    [35, 7],
    [38, 17],
    [52, 5],
    [56, 14],
    [50, 21],
    [66, 10],
  ] as const
  const edges = [
    [0, 1],
    [0, 3],
    [1, 2],
    [2, 3],
    [1, 4],
    [2, 5],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [7, 8],
    [7, 9],
    [8, 9],
  ] as const
  writeText(buffer, 2, 1, '07 / SIGNAL EXCHANGE', 1)
  writeText(buffer, 2, 23, 'A message moves through a network and finds a clear route.', 5)
  shadedEllipse(buffer, 37, 13, 30, 8, 0, time * 0.1)

  edges.forEach(([fromIndex, toIndex], edge) => {
    const from = nodes[fromIndex]
    const to = nodes[toIndex]
    if (!from || !to) return
    line(buffer, from[0], from[1], to[0], to[1], edge % 3 === 0 ? '~' : '.', edge % 2 ? 1 : 2)

    for (let particle = 0; particle < 3; particle += 1) {
      const progress = (time * 0.13 + particle / 3 + edge * 0.071) % 1
      put(
        buffer,
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
        progress > 0.9 ? '*' : 'o',
        progress > 0.9 ? 3 : 2,
      )
    }
  })

  nodes.forEach(([x, y], node) => {
    const active = (index + Math.floor(time * 1.2)) % nodes.length === node
    shadedEllipse(buffer, x, y, active ? 2.5 : 1.4, active ? 1.6 : 0.8, active ? 2 : 1, time + node)
    ellipse(buffer, x, y, active ? 2.5 : 1.4, active ? 1.6 : 0.8, '.', active ? 3 : 1, time)
    put(buffer, x, y, active ? '@' : '+', active ? 4 : 5)
  })

  const endpoint = nodes[9]
  if (endpoint) {
    ellipse(buffer, endpoint[0], endpoint[1], 4 + Math.sin(time) * 0.6, 2.4, ':', 3, time * 0.7)
    writeText(buffer, 58, 14, 'OPEN', 5)
  }
  writeText(buffer, 3, 4, 'ORIGIN', 5)
  writeText(buffer, 58, 5, 'REPLY', 5)
  return finishArtwork(buffer)
}

export const contactArtwork = artworkSource(
  'contact',
  'Signal exchange',
  'A recurring signal routes through a connected field toward an open endpoint, accompanying the portfolio’s actual contact paths without simulating a sent message.',
  palette,
  render,
)
