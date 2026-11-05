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

// bg, node dark, input, hidden, output, edge, readout
const palette = ['#071B18', '#0E3A2C', '#52E0A5', '#7BCBFF', '#F1C96A', '#FA7897', '#D6FFF0']
const buffer = createArtworkBuffer(palette)

const LAYERS = [
  { x: 14, count: 4, color: 2, label: 'INPUT' },
  { x: 46, count: 6, color: 3, label: 'HIDDEN' },
  { x: 78, count: 3, color: 4, label: 'OUTPUT' },
]

function layerY(count: number, i: number) {
  // Layers span rows 7..22 so the bottom band (24..30) stays free for panels.
  return 7 + (i * 15) / Math.max(count - 1, 1)
}

function render(index: number, elapsedMs: number) {
  clearArtwork(buffer)
  const time = elapsedMs / 1000

  writeText(buffer, 2, 1, '04 / COMPUTATION  -  INFERENCE FIELD', 3)

  // Edges first (under the nodes): every input-hidden and hidden-output link.
  const nodePos = LAYERS.map((layer) => {
    const ys: number[] = []
    for (let i = 0; i < layer.count; i += 1) ys.push(layerY(layer.count, i))
    return ys
  })
  for (let layerIndex = 0; layerIndex < LAYERS.length - 1; layerIndex += 1) {
    const from = LAYERS[layerIndex]
    const to = LAYERS[layerIndex + 1]
    const fromYs = nodePos[layerIndex] ?? []
    const toYs = nodePos[layerIndex + 1] ?? []
    if (!from || !to) continue
    for (const y0 of fromYs) {
      for (const y1 of toYs) {
        const steps = 12
        for (let s = 0; s <= steps; s += 1) {
          const t = s / steps
          put(buffer, from.x + (to.x - from.x) * t, y0 + (y1 - y0) * t, s % 3 === 0 ? '.' : ' ', 1)
        }
      }
    }
  }

  // Signal pulses traveling along a subset of edges, left to right.
  const pulses: { x: number; y: number; color: number }[] = []
  for (let layerIndex = 0; layerIndex < LAYERS.length - 1; layerIndex += 1) {
    const from = LAYERS[layerIndex]
    const to = LAYERS[layerIndex + 1]
    if (!from || !to) continue
    const fromYs = nodePos[layerIndex] ?? []
    const toYs = nodePos[layerIndex + 1] ?? []
    for (let p = 0; p < 3; p += 1) {
      const progress = (time * 0.55 + p * 0.33 + layerIndex * 0.2) % 1
      const y0 = fromYs[p % from.count]
      const y1 = toYs[(p * 2 + layerIndex) % to.count]
      if (y0 === undefined || y1 === undefined) continue
      pulses.push({
        x: from.x + (to.x - from.x) * progress,
        y: y0 + (y1 - y0) * progress,
        color: to.color,
      })
    }
  }
  for (const pulse of pulses) {
    put(buffer, pulse.x, pulse.y, 'o', pulse.color)
    put(buffer, pulse.x - 1, pulse.y, '.', pulse.color)
  }

  // Nodes: shaded discs whose activation pulses in a wave per layer.
  LAYERS.forEach((layer, layerIndex) => {
    const ys = nodePos[layerIndex]
    if (!ys) return
    ys.forEach((y, i) => {
      const activation = 0.5 + 0.5 * Math.sin(time * 2 - layerIndex * 1.2 + i * 0.9)
      const radius = 2.2 + activation * 1.1
      shadedEllipse(buffer, layer.x, y, radius, radius * 0.55, layer.color, time * 0.7 + i)
      ellipse(buffer, layer.x, y, radius + 1.2, (radius + 1.2) * 0.55, 'o', layer.color, 0)
      writeText(buffer, layer.x - 3, layerY(layer.count, 0) - 3, layer.label, 6)
    })
  })

  // Weight annotation on the edges (in free space).
  writeText(buffer, 27, 5, 'w=0.83', 1)
  writeText(buffer, 57, 23, 'w=-0.41', 1)

  // Loss sparkline panel bottom-left: the curve descends over a cycle.
  box(buffer, 4, 24, 30, 7, 6)
  writeText(buffer, 6, 25, 'LOSS', 6)
  const cycle = (time % 12) / 12
  const points = 20
  for (let s = 0; s <= points; s += 1) {
    const t = s / points
    const x = 12 + t * 20
    const loss = 0.9 * Math.exp(-3.2 * t) + 0.06
    const y = 29 - loss * 3
    put(buffer, x, y, s < cycle * points ? '*' : '.', 6)
  }
  writeText(buffer, 6, 29, (0.9 * Math.exp(-3.2 * cycle) + 0.06).toFixed(3), 6)

  // Readout panel bottom-right.
  box(buffer, 64, 24, 30, 7, 6)
  writeText(buffer, 66, 25, 'f(x) = act(Wx + b)', 6)
  const outputYs = nodePos[2] ?? []
  const best = outputYs.reduce(
    (acc, y, i) =>
      Math.sin(time * 2 - 2.4 + i * 0.9) > acc.value
        ? { value: Math.sin(time * 2 - 2.4 + i * 0.9), i }
        : acc,
    { value: -2, i: 0 },
  )
  writeText(buffer, 66, 27, `OUTPUT  y=${best.i}  p=${(0.5 + 0.5 * best.value).toFixed(2)}`, 6)
  writeText(buffer, 66, 28, 'EPOCH 12/20', 1)
  put(buffer, 66 + Math.round(cycle * 18), 29, '^', 4)

  writeText(buffer, 2, 32, 'FORWARD PASS  /  ACTIVATIONS  /  LOSS DESCENT', 3)
  return finishArtwork(buffer)
}

export const computationArtwork = artworkSource(
  'computation',
  'Inference field',
  'A three-layer network with signal pulses traveling its edges, per-node activation shading, a live loss sparkline descending over each epoch, and a softmax readout naming the winning output.',
  palette,
  render,
)
