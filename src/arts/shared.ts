import type { AsciiExhibitSource } from '@/exhibits/types'

export interface ArtworkFrame {
  text: string
  colorIndices: Uint8Array
}

export interface ArtworkBuffer {
  readonly rows: number
  readonly cols: number
  readonly palette: readonly string[]
  readonly chars: string[]
  readonly colors: Uint8Array
}

const ART_ROWS = 25
const ART_COLS = 72
const SHADE_RAMP = '░▒▓█'

export function createArtworkBuffer(palette: readonly string[]): ArtworkBuffer {
  return {
    rows: ART_ROWS,
    cols: ART_COLS,
    palette,
    chars: new Array<string>(ART_ROWS * ART_COLS).fill(' '),
    colors: new Uint8Array(ART_ROWS * ART_COLS),
  }
}

export function clearArtwork(buffer: ArtworkBuffer, background = 0): void {
  buffer.chars.fill(' ')
  buffer.colors.fill(background)
}

export function put(buffer: ArtworkBuffer, x: number, y: number, glyph: string, color = 1): void {
  const col = Math.round(x)
  const row = Math.round(y)

  if (col < 0 || col >= buffer.cols || row < 0 || row >= buffer.rows || glyph.length === 0) return

  const index = row * buffer.cols + col
  buffer.chars[index] = glyph[0] ?? ' '
  buffer.colors[index] = color % buffer.palette.length
}

export function writeText(
  buffer: ArtworkBuffer,
  x: number,
  y: number,
  text: string,
  color = 1,
): void {
  for (let index = 0; index < text.length; index += 1) {
    put(buffer, x + index, y, text[index] ?? ' ', color)
  }
}

export function line(
  buffer: ArtworkBuffer,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  glyph: string,
  color = 1,
): void {
  let x = Math.round(x0)
  let y = Math.round(y0)
  const endX = Math.round(x1)
  const endY = Math.round(y1)
  const dx = Math.abs(endX - x)
  const sx = x < endX ? 1 : -1
  const dy = -Math.abs(endY - y)
  const sy = y < endY ? 1 : -1
  let error = dx + dy

  while (true) {
    put(buffer, x, y, glyph, color)
    if (x === endX && y === endY) break

    const doubledError = 2 * error
    if (doubledError >= dy) {
      error += dy
      x += sx
    }
    if (doubledError <= dx) {
      error += dx
      y += sy
    }
  }
}

export function ellipse(
  buffer: ArtworkBuffer,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  glyph: string,
  color: number,
  phase = 0,
): void {
  for (let step = 0; step < 180; step += 1) {
    const angle = (step / 180) * Math.PI * 2 + phase
    put(
      buffer,
      centerX + Math.cos(angle) * radiusX,
      centerY + Math.sin(angle) * radiusY,
      glyph,
      color,
    )
  }
}

export function shadedEllipse(
  buffer: ArtworkBuffer,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  baseColor: number,
  phase = 0,
): void {
  const left = Math.max(0, Math.floor(centerX - radiusX))
  const right = Math.min(buffer.cols - 1, Math.ceil(centerX + radiusX))
  const top = Math.max(0, Math.floor(centerY - radiusY))
  const bottom = Math.min(buffer.rows - 1, Math.ceil(centerY + radiusY))
  const lightX = Math.cos(phase + 0.6) * 0.5
  const lightY = -0.58
  const lightZ = Math.sqrt(Math.max(0.1, 1 - lightX * lightX - lightY * lightY))

  for (let row = top; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      const nx = (col - centerX) / radiusX
      const ny = (row - centerY) / radiusY
      const distance = nx * nx + ny * ny
      if (distance > 1) continue

      const nz = Math.sqrt(1 - distance)
      const diffuse = Math.max(0, nx * lightX + ny * lightY + nz * lightZ)
      const highlight = Math.pow(Math.max(0, nz + nx * lightX - ny * lightY), 10) * 0.35
      const grain =
        (Math.sin(col * 1.71 + row * 0.83 + phase) +
          Math.sin(col * 0.43 - row * 1.31 - phase * 0.7)) *
        0.045
      const intensity = Math.min(1, Math.max(0, 0.08 + diffuse * 0.72 + highlight + grain))
      const rampIndex = Math.round(intensity * (SHADE_RAMP.length - 1))
      const colorBand = Math.min(buffer.palette.length - baseColor - 1, Math.floor(intensity * 3))
      const cell = row * buffer.cols + col

      buffer.chars[cell] = SHADE_RAMP[rampIndex] ?? '░'
      buffer.colors[cell] = Math.max(0, baseColor + colorBand)
    }
  }
}

export function box(
  buffer: ArtworkBuffer,
  left: number,
  top: number,
  width: number,
  height: number,
  color: number,
): void {
  const right = left + width - 1
  const bottom = top + height - 1
  line(buffer, left, top, right, top, '-', color)
  line(buffer, left, bottom, right, bottom, '-', color)
  line(buffer, left, top, left, bottom, '|', color)
  line(buffer, right, top, right, bottom, '|', color)
  put(buffer, left, top, '+', color)
  put(buffer, right, top, '+', color)
  put(buffer, left, bottom, '+', color)
  put(buffer, right, bottom, '+', color)
}

export function finishArtwork(buffer: ArtworkBuffer): ArtworkFrame {
  const lines: string[] = []

  for (let row = 0; row < buffer.rows; row += 1) {
    lines.push(buffer.chars.slice(row * buffer.cols, (row + 1) * buffer.cols).join(''))
  }

  return { text: lines.join('\n'), colorIndices: buffer.colors.slice() }
}

export function artworkSource(
  id: string,
  label: string,
  description: string,
  palette: readonly string[],
  renderArtwork: (index: number, elapsedMs: number) => ArtworkFrame,
): AsciiExhibitSource {
  return {
    id: `art:${id}`,
    fps: 12,
    grid: { rows: ART_ROWS, cols: ART_COLS },
    palette,
    renderColored: renderArtwork,
    render: (index, elapsedMs) => renderArtwork(index, elapsedMs).text,
    meta: { label, description },
  }
}
