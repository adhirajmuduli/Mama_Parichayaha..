import { positiveModulo } from '@/lib/journeyTimeline'

export const ROUTE_RADIUS = 22
export const ROUTE_CHORD = 2 * ROUTE_RADIUS * Math.sin(Math.PI / 5)
export const DWELL_CAMERA_DISTANCE = 10.5
export const DWELL_CAMERA_HEIGHT = 2.6

const START_ANGLE = -Math.PI / 2
const Y_OFFSETS = [0, 2.4, -1.3, 1.9, 0.5] as const

export type RouteVector = readonly [number, number, number]

export function getRingAngle(index: number): number {
  return START_ANGLE + positiveModulo(index, 5) * ((2 * Math.PI) / 5)
}

export function getModelCenter(index: number): RouteVector {
  const angle = getRingAngle(index)
  const yOffset = Y_OFFSETS[positiveModulo(index, 5)] ?? 0

  return [
    Number((ROUTE_RADIUS * Math.cos(angle)).toFixed(3)),
    yOffset,
    Number((ROUTE_RADIUS * Math.sin(angle)).toFixed(3)),
  ]
}

export function getRadialBasis(index: number): RouteVector {
  const angle = getRingAngle(index)

  return [Number(Math.cos(angle).toFixed(6)), 0, Number(Math.sin(angle).toFixed(6))]
}

export function getRingTangentBasis(index: number): RouteVector {
  const angle = getRingAngle(index)

  return [Number(-Math.sin(angle).toFixed(6)), 0, Number(Math.cos(angle).toFixed(6))]
}

export function getScreenRightBasis(index: number): RouteVector {
  const radial = getRadialBasis(index)

  return [radial[2], 0, -radial[0]]
}

export function getInteriorYaw(index: number): number {
  const center = getModelCenter(index)
  const directionX = -center[0]
  const directionZ = -center[2]

  return Math.atan2(directionX, directionZ)
}

export function getDwellCameraAnchor(index: number, lookYOffset: number): RouteVector {
  const center = getModelCenter(index)
  const radial = getRadialBasis(index)

  return [
    Number((center[0] + radial[0] * DWELL_CAMERA_DISTANCE).toFixed(3)),
    Number((center[1] + DWELL_CAMERA_HEIGHT).toFixed(3)),
    Number((center[2] + radial[2] * DWELL_CAMERA_DISTANCE).toFixed(3)),
  ]
}

export function getDwellLookTarget(index: number, lookYOffset: number): RouteVector {
  const center = getModelCenter(index)

  return [center[0], Number((center[1] + lookYOffset).toFixed(3)), center[2]]
}
