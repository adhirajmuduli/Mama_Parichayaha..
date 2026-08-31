import * as THREE from 'three'

import { getDwellCameraAnchor, getDwellLookTarget, type RouteVector } from '@/lib/closedRoute'

export const DWELL_FOV = 42
export const TRANSITION_FOV_MAX = 47
export const TRANSITION_BANK_MAX_DEG = 3.5
export const TRANSITION_TARGET_LEAD = 1.4

export function buildClosedCameraCurve(lookYOffsets: readonly number[]): THREE.CatmullRomCurve3 {
  const points = lookYOffsets.map((_, index) => {
    const [x, y, z] = getDwellCameraAnchor(index, lookYOffsets[index] ?? 0)

    return new THREE.Vector3(x, y, z)
  })

  return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5)
}

export function buildClosedTargetCurve(lookYOffsets: readonly number[]): THREE.CatmullRomCurve3 {
  const points = lookYOffsets.map((lookYOffset, index) => {
    const [x, y, z] = getDwellLookTarget(index, lookYOffset)

    return new THREE.Vector3(x, y, z)
  })

  return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5)
}

export interface RouteCurveSample {
  position: RouteVector
  target: RouteVector
  tangent: RouteVector
}

const scratchPosition = new THREE.Vector3()
const scratchTarget = new THREE.Vector3()
const scratchTangent = new THREE.Vector3()

export function sampleClosedRoute(
  cameraCurve: THREE.CatmullRomCurve3,
  targetCurve: THREE.CatmullRomCurve3,
  segmentT: number,
  into?: RouteCurveSample,
): RouteCurveSample {
  const result: RouteCurveSample = into ?? {
    position: [0, 0, 0],
    target: [0, 0, 0],
    tangent: [0, 0, 1],
  }

  cameraCurve.getPoint(segmentT, scratchPosition)
  targetCurve.getPoint(segmentT, scratchTarget)
  cameraCurve.getTangent(segmentT, scratchTangent)

  result.position = [scratchPosition.x, scratchPosition.y, scratchPosition.z]
  result.target = [scratchTarget.x, scratchTarget.y, scratchTarget.z]
  result.tangent = [scratchTangent.x, scratchTangent.y, scratchTangent.z]

  return result
}
