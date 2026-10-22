'use client'

/**
 * Mock exhibit sources (new_plan.md §10.2) — owner-sanctioned interim
 * animations that exercise the full exhibit pipeline (registry → player →
 * controls) until the owner's real ASCII models land (P9b).
 *
 * "Secure sourcing": every animation below is an implementation of a
 * published, freely-reproduced technique — perspective projection with a
 * z-buffer and the `.,-~:;=!*#$@` luminance ramp from a1k0n's "donut math"
 * write-up, plus standard sine/parametric drawing — NOT copied artwork.
 * Deterministic per (index, elapsedMs): seeded noise only, no wall clock,
 * no Math.random. Every frame is exactly `grid.rows` lines, padded to
 * `grid.cols`, printable characters only.
 *
 * Source ids carry the `mock:` prefix so panels can mark themselves
 * (`data-mock`) and the swap to real models is a data change only.
 */

import type { AsciiExhibitSource } from '../types'

/** Published luminance ramp, dimmest → brightest. */
const RAMP = '.,-~:;=!*#$@'

function rampChar(intensity: number): string {
  const clamped = Math.min(Math.max(intensity, 0), 1)

  return RAMP[Math.round(clamped * (RAMP.length - 1))] ?? ' '
}

/** Deterministic hash noise in [0, 1) for seeded point clouds. */
function noise2(x: number, y: number): number {
  let state = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)

  state = Math.imul(state ^ (state >>> 13), 1274126177)

  return ((state ^ (state >>> 16)) >>> 0) / 4294967296
}

/** Renders a fixed-grid frame from a per-cell painter callback. */
function paintGrid(
  rows: number,
  cols: number,
  buffer: string[],
  paint: (row: number, col: number) => string,
): string {
  buffer.fill(' ')

  for (let row = 0; row < rows; row += 1) {
    const base = row * cols

    for (let col = 0; col < cols; col += 1) {
      buffer[base + col] = paint(row, col) || ' '
    }
  }

  const lines: string[] = []

  for (let row = 0; row < rows; row += 1) {
    lines.push(buffer.slice(row * cols, row * cols + cols).join(''))
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// DNA — rotating double helix with depth-sorted strands and base-pair rungs
// ---------------------------------------------------------------------------

const DNA_ROWS = 15
const DNA_COLS = 47
const dnaBuffer = new Array<string>(DNA_ROWS * DNA_COLS)
// Scratch per-frame strand geometry (module scope: zero per-frame allocation).
const dnaStrandX = new Int16Array(DNA_ROWS)
const dnaStrandFront = new Uint8Array(DNA_ROWS)

function renderDna(index: number, elapsedMs: number): string {
  const phase = elapsedMs * 0.0022 + index * 0.35
  const centerX = (DNA_COLS - 1) / 2
  const amplitude = DNA_COLS * 0.34

  // Per-row strand positions, computed once per frame into scratch buffers.
  for (let row = 0; row < DNA_ROWS; row += 1) {
    const angle = phase + row * 0.55
    dnaStrandX[row] = Math.round(centerX + Math.sin(angle) * amplitude)
    // cos > 0 → strand A is nearer the viewer on this rung.
    dnaStrandFront[row] = Math.cos(angle) >= 0 ? 1 : 0
  }

  return paintGrid(DNA_ROWS, DNA_COLS, dnaBuffer, (row, col) => {
    const xA = dnaStrandX[row] ?? centerX
    const xB = Math.round(2 * centerX - xA)
    const aIsFront = dnaStrandFront[row] === 1
    const frontX = aIsFront ? xA : xB
    const backX = aIsFront ? xB : xA

    if (col === frontX) return '#'
    if (col === backX) return ':'

    // Base-pair rungs every other row, spanning between the strands.
    if (row % 2 === 0 && col > Math.min(frontX, backX) && col < Math.max(frontX, backX)) {
      const centerOffset = Math.abs(col - centerX) / amplitude

      return centerOffset < 0.25 ? '=' : '-'
    }

    return ' '
  })
}

// ---------------------------------------------------------------------------
// Bacteriophage — capsid, contractile sheath, swaying tail fibers
// ---------------------------------------------------------------------------

const PHAGE_ROWS = 19
const PHAGE_COLS = 35
const phageBuffer = new Array<string>(PHAGE_ROWS * PHAGE_COLS)

function renderBacteriophage(index: number, elapsedMs: number): string {
  const bob = Math.sin(elapsedMs * 0.0021 + index) * 1.2
  const sheathPulse = Math.sin(elapsedMs * 0.0031)
  const centerX = (PHAGE_COLS - 1) / 2

  return paintGrid(PHAGE_ROWS, PHAGE_COLS, phageBuffer, (row, col) => {
    const y = row + bob
    const dx = col - centerX

    // Capsid: hexagonal icosahedral silhouette (rows 1..8).
    if (y >= 1 && y <= 8) {
      const halfWidth = y < 4.5 ? 3 + y * 1.2 : 3 + (9 - y) * 1.2
      const onEdge = Math.abs(Math.abs(dx) - halfWidth) < 0.9

      if (onEdge) return rampChar(0.85)

      if (Math.abs(dx) < halfWidth) {
        const interior = noise2(col * 7 + ((index % 12) | 0), row)

        return interior > 0.82 ? (sheathPulse > 0 ? 'o' : '.') : ' '
      }
    }

    // Collar.
    if (Math.abs(y - 9) < 0.5 && Math.abs(dx) <= 3) return '='

    // Contractile sheath: breathes vertically with the pulse.
    const sheathTop = 10
    const sheathBottom = 13 + (sheathPulse > 0.4 ? 1 : 0)

    if (y >= sheathTop && y <= sheathBottom && Math.abs(dx) <= 1) {
      return Math.abs(dx) === 1 ? '|' : 'H'
    }

    // Base plate.
    if (Math.abs(y - (sheathBottom + 1)) < 0.5 && Math.abs(dx) <= 3) return '='

    // Tail fibers: six kinked lines swaying out of the base plate.
    if (y > sheathBottom + 1 && y <= sheathBottom + 5) {
      const fiber = Math.floor((dx + 6) / 2.4)
      const sway = Math.sin(elapsedMs * 0.0034 + fiber * 1.3) * 1.4
      const legX = (fiber - 2.5) * 2.4 + sway * (y - sheathBottom - 1) * 0.55

      if (Math.abs(dx - legX) < 0.7 && Math.abs(fiber - 2.5) <= 2.5) return '/'
    }

    return ' '
  })
}

// ---------------------------------------------------------------------------
// Hemoglobin — four waving helical ribbons (bundle)
// ---------------------------------------------------------------------------

const HEME_ROWS = 15
const HEME_COLS = 47
const hemeBuffer = new Array<string>(HEME_ROWS * HEME_COLS)

function renderHemoglobin(index: number, elapsedMs: number): string {
  const phase = elapsedMs * 0.0018 + index * 0.3

  return paintGrid(HEME_ROWS, HEME_COLS, hemeBuffer, (row, col) => {
    const depth = row / (HEME_ROWS - 1)

    // Four ribbons, phase-shifted across the frame.
    for (let ribbon = 0; ribbon < 4; ribbon += 1) {
      const ribbonCenter =
        (HEME_COLS / 4) * ribbon + HEME_COLS / 8 + Math.sin(phase + ribbon * 1.7 + row * 0.22) * 4.2

      const distance = Math.abs(col - ribbonCenter)

      if (distance < 1.1) {
        // Bright core with dimmer edges; back ribbons (top rows) dimmer.
        const edgeShade = 1 - distance / 1.1
        const depthShade = 0.45 + 0.55 * depth

        return rampChar(edgeShade * depthShade)
      }
    }

    return ' '
  })
}

// ---------------------------------------------------------------------------
// Brain — rotating 3D point cloud (published perspective technique)
// ---------------------------------------------------------------------------

const BRAIN_ROWS = 17
const BRAIN_COLS = 41
const BRAIN_POINTS = 240
const brainBuffer = new Array<string>(BRAIN_ROWS * BRAIN_COLS)
const brainOoz = new Float32Array(BRAIN_ROWS * BRAIN_COLS)

interface Projected {
  x: number
  y: number
  z: number
}

const brainPoints: Projected[] = []

// Seeded noisy sphere (fixed for the session lifetime, deterministic).
for (let point = 0; point < BRAIN_POINTS; point += 1) {
  const theta = Math.acos(2 * noise2(point, 11) - 1)
  const phi = noise2(point, 29) * Math.PI * 2
  const jitter = 0.82 + noise2(point, 47) * 0.36

  brainPoints.push({
    x: jitter * Math.sin(theta) * Math.cos(phi),
    y: jitter * Math.cos(theta) * 0.9,
    z: jitter * Math.sin(theta) * Math.sin(phi),
  })
}

function renderBrain(index: number, elapsedMs: number): string {
  const a = elapsedMs * 0.00042 + index * 0.06
  const cosA = Math.cos(a)
  const sinA = Math.sin(a)
  const tilt = Math.sin(elapsedMs * 0.00019) * 0.42
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const k1 = BRAIN_COLS * 0.44
  const viewerDistance = 3.2

  brainOoz.fill(0)

  for (let p = 0; p < BRAIN_POINTS; p += 1) {
    const point = brainPoints[p]

    if (!point) continue

    // Rotate about y, then tilt about x.
    const x1 = point.x * cosA - point.z * sinA
    const z1 = point.x * sinA + point.z * cosA
    const y1 = point.y * cosT - z1 * sinT
    const z2 = point.y * sinT + z1 * cosT

    const ooz = 1 / (viewerDistance + z2)
    const xp = Math.round((BRAIN_COLS - 1) / 2 + k1 * ooz * x1)
    const yp = Math.round((BRAIN_ROWS - 1) / 2 - k1 * ooz * y1 * 0.55)

    if (xp < 0 || xp >= BRAIN_COLS || yp < 0 || yp >= BRAIN_ROWS) continue

    const cell = yp * BRAIN_COLS + xp

    if (ooz > (brainOoz[cell] ?? 0)) {
      brainOoz[cell] = ooz
      brainBuffer[cell] = rampChar(ooz * 1.4 - 0.2)
    }
  }

  // Assemble with the z-buffered cells, blanking the rest.
  const lines: string[] = []

  for (let row = 0; row < BRAIN_ROWS; row += 1) {
    for (let col = 0; col < BRAIN_COLS; col += 1) {
      const cell = row * BRAIN_COLS + col

      if ((brainOoz[cell] ?? 0) === 0) brainBuffer[cell] = ' '
    }

    lines.push(brainBuffer.slice(row * BRAIN_COLS, (row + 1) * BRAIN_COLS).join(''))
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Earth — rotating wireframe globe with drifting cloud bands
// ---------------------------------------------------------------------------

const EARTH_ROWS = 19
const EARTH_COLS = 37
const earthBuffer = new Array<string>(EARTH_ROWS * EARTH_COLS)
const earthOoz = new Float32Array(EARTH_ROWS * EARTH_COLS)

const EARTH_LATS = [-60, -30, 0, 30, 60]
const EARTH_LONS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function renderEarth(index: number, elapsedMs: number): string {
  const spin = elapsedMs * 0.00058 + index * 0.09
  const cloudDrift = elapsedMs * 0.00031
  const k1 = EARTH_COLS * 0.46
  const viewerDistance = 3.4

  const plot = (
    x3: number,
    y3: number,
    z3: number,
    intensity: number,
    front: string,
    back: string,
  ) => {
    const ooz = 1 / (viewerDistance + z3)
    const xp = Math.round((EARTH_COLS - 1) / 2 + k1 * ooz * x3)
    const yp = Math.round((EARTH_ROWS - 1) / 2 - k1 * ooz * y3 * 0.52)

    if (xp < 0 || xp >= EARTH_COLS || yp < 0 || yp >= EARTH_ROWS) return

    const cell = yp * EARTH_COLS + xp

    if (ooz > (earthOoz[cell] ?? 0)) {
      earthOoz[cell] = ooz
      earthBuffer[cell] = intensity > 0.5 ? front : back
    }
  }

  earthOoz.fill(0)

  // Latitude rings (sampled arcs).
  for (const latDeg of EARTH_LATS) {
    const lat = (latDeg * Math.PI) / 180
    const cosLat = Math.cos(lat)
    const y = Math.sin(lat)
    const visible = latDeg >= 0
    const intensity = visible ? 1 : 0

    for (let step = 0; step <= 44; step += 1) {
      const lon = (step / 44) * Math.PI * 2
      const x = cosLat * Math.cos(lon + spin)
      const z = cosLat * Math.sin(lon + spin)
      const front = Math.cos(lon + spin) > 0

      plot(x, y, z, intensity, front ? '-' : '.', front ? '-' : ',')
    }
  }

  // Rotating meridians.
  for (const lonDeg of EARTH_LONS) {
    const lon = (lonDeg * Math.PI) / 180 + spin

    for (let latDeg = -75; latDeg <= 75; latDeg += 5) {
      const lat = (latDeg * Math.PI) / 180
      const x = Math.cos(lat) * Math.cos(lon)
      const y = Math.sin(lat)
      const z = Math.cos(lat) * Math.sin(lon)
      const front = Math.sin(lon) > 0

      plot(x, y, z, front ? 1 : 0, ':', ';')
    }
  }

  // Drifting cloud band (two latitudes, offset by time).
  for (const cloudLat of [-14, 17]) {
    const lat = (cloudLat * Math.PI) / 180
    const y = Math.sin(lat)
    const cosLat = Math.cos(lat)

    for (let step = 0; step < 10; step += 1) {
      const lon = (step / 10) * Math.PI * 2 + cloudDrift
      const x = cosLat * Math.cos(lon)
      const z = cosLat * Math.sin(lon)

      plot(x, y, z, 1, '@', '@')
    }
  }

  const lines: string[] = []

  for (let row = 0; row < EARTH_ROWS; row += 1) {
    for (let col = 0; col < EARTH_COLS; col += 1) {
      const cell = row * EARTH_COLS + col

      if ((earthOoz[cell] ?? 0) === 0) earthBuffer[cell] = ' '
    }

    lines.push(earthBuffer.slice(row * EARTH_COLS, (row + 1) * EARTH_COLS).join(''))
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Source table
// ---------------------------------------------------------------------------

export const dnaMockSource: AsciiExhibitSource = {
  id: 'mock:dna',
  fps: 12,
  render: renderDna,
  grid: { rows: DNA_ROWS, cols: DNA_COLS },
  meta: {
    label: 'DNA',
    description: 'Rotating double helix with base-pair rungs (interim preview animation).',
  },
}

export const bacteriophageMockSource: AsciiExhibitSource = {
  id: 'mock:bacteriophage',
  fps: 12,
  render: renderBacteriophage,
  grid: { rows: PHAGE_ROWS, cols: PHAGE_COLS },
  meta: {
    label: 'Bacteriophage',
    description: 'Capsid, contractile sheath and swaying tail fibers (interim preview animation).',
  },
}

export const hemoglobinMockSource: AsciiExhibitSource = {
  id: 'mock:hemoglobin',
  fps: 12,
  render: renderHemoglobin,
  grid: { rows: HEME_ROWS, cols: HEME_COLS },
  meta: {
    label: 'Hemoglobin',
    description: 'Four waving helical ribbons (interim preview animation).',
  },
}

export const brainMockSource: AsciiExhibitSource = {
  id: 'mock:brain',
  fps: 12,
  render: renderBrain,
  grid: { rows: BRAIN_ROWS, cols: BRAIN_COLS },
  meta: {
    label: 'Brain',
    description: 'Rotating point cloud in perspective (interim preview animation).',
  },
}

export const earthMockSource: AsciiExhibitSource = {
  id: 'mock:earth',
  fps: 12,
  render: renderEarth,
  grid: { rows: EARTH_ROWS, cols: EARTH_COLS },
  meta: {
    label: 'Earth',
    description: 'Rotating wireframe globe with drifting clouds (interim preview animation).',
  },
}

/** Resolution helper for the sources table; unknown ids stay undefined. */
export function mockSourceFor(key: string): AsciiExhibitSource | undefined {
  switch (key) {
    case 'dna':
      return dnaMockSource
    case 'bacteriophage':
      return bacteriophageMockSource
    case 'hemoglobin':
      return hemoglobinMockSource
    case 'brain':
      return brainMockSource
    case 'earth':
      return earthMockSource
    default:
      return undefined
  }
}
