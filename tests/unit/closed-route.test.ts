import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import {
  getDwellCameraAnchor,
  getDwellLookTarget,
  getInteriorYaw,
  getModelCenter,
  getRadialBasis,
  getRingTangentBasis,
  getScreenRightBasis,
  ROUTE_CHORD,
  ROUTE_RADIUS,
} from '@/lib/closedRoute'
import { buildClosedCameraCurve, buildClosedTargetCurve } from '@/lib/closedRouteCurves'
import { decodeJourney, getCanonicalRouteT } from '@/lib/journeyTimeline'

const LOOK_Y_OFFSETS = [0, 0.3, -0.1, 0.2, 0.1]

describe('closed route geometry', () => {
  it('matches the plan center table to three decimals', () => {
    const expectedCenters: Array<readonly [number, number, number]> = [
      [0, 0, -22],
      [20.923, 2.4, -6.798],
      [12.931, -1.3, 17.799],
      [-12.931, 1.9, 17.799],
      [-20.923, 0.5, -6.798],
    ]

    expectedCenters.forEach((expected, index) => {
      const center = getModelCenter(index)

      expect(Math.abs(center[0] - expected[0])).toBeLessThanOrEqual(0.0011)
      expect(Math.abs(center[1] - expected[1])).toBeLessThanOrEqual(0.0011)
      expect(Math.abs(center[2] - expected[2])).toBeLessThanOrEqual(0.0011)
    })

    expect(getModelCenter(5)).toEqual(getModelCenter(0))
    expect(getModelCenter(-1)).toEqual(getModelCenter(4))
  })

  it('keeps every adjacent planar chord at 25.86 units including the seam', () => {
    expect(ROUTE_CHORD).toBeCloseTo(25.86, 2)
    expect(ROUTE_RADIUS).toBe(22)

    for (let index = 0; index < 5; index += 1) {
      const current = getModelCenter(index)
      const next = getModelCenter(index + 1)
      const chord = Math.hypot(next[0] - current[0], next[2] - current[2])

      expect(Math.abs(chord - 25.86)).toBeLessThanOrEqual(0.05)
    }
  })

  it('provides orthogonal unit bases and interior-facing yaw', () => {
    for (let index = 0; index < 5; index += 1) {
      const radial = getRadialBasis(index)
      const tangent = getRingTangentBasis(index)
      const right = getScreenRightBasis(index)

      expect(Math.hypot(radial[0], radial[2])).toBeCloseTo(1, 6)
      expect(Math.hypot(tangent[0], tangent[2])).toBeCloseTo(1, 6)
      expect(radial[0] * tangent[0] + radial[2] * tangent[2]).toBeCloseTo(0, 6)
      expect(right[0] * radial[0] + right[2] * radial[2]).toBeCloseTo(0, 6)

      const center = getModelCenter(index)
      const yaw = getInteriorYaw(index)
      const forwardX = Math.sin(yaw)
      const forwardZ = Math.cos(yaw)
      const toInterior = new THREE.Vector3(-center[0], 0, -center[2]).normalize()

      expect(forwardX * toInterior.x + forwardZ * toInterior.z).toBeGreaterThan(0.99)
    }
  })

  it('derives dwell anchors outside the model looking back at it', () => {
    for (let index = 0; index < 5; index += 1) {
      const center = getModelCenter(index)
      const anchor = getDwellCameraAnchor(index, LOOK_Y_OFFSETS[index] ?? 0)
      const target = getDwellLookTarget(index, LOOK_Y_OFFSETS[index] ?? 0)
      const planarDistance = Math.hypot(anchor[0] - center[0], anchor[2] - center[2])

      expect(planarDistance).toBeCloseTo(10.5, 3)
      expect(anchor[1]).toBeCloseTo(center[1] + 2.6, 3)
      expect(target[0]).toBe(center[0])
      expect(target[2]).toBe(center[2])
      expect(target[1]).toBeCloseTo(center[1] + (LOOK_Y_OFFSETS[index] ?? 0), 6)

      const radial = getRadialBasis(index)
      const outwardDot = (anchor[0] - center[0]) * radial[0] + (anchor[2] - center[2]) * radial[2]

      expect(outwardDot).toBeGreaterThan(0)
    }
  })
})

describe('closed route curves', () => {
  it('passes exactly through every dwell anchor at segment boundaries', () => {
    const cameraCurve = buildClosedCameraCurve(LOOK_Y_OFFSETS)
    const targetCurve = buildClosedTargetCurve(LOOK_Y_OFFSETS)

    for (let index = 0; index < 5; index += 1) {
      const t = index / 5
      const anchor = getDwellCameraAnchor(index, LOOK_Y_OFFSETS[index] ?? 0)
      const target = getDwellLookTarget(index, LOOK_Y_OFFSETS[index] ?? 0)
      const point = cameraCurve.getPoint(t)
      const targetPoint = targetCurve.getPoint(t)

      expect(point.x).toBeCloseTo(anchor[0], 3)
      expect(point.y).toBeCloseTo(anchor[1], 3)
      expect(point.z).toBeCloseTo(anchor[2], 3)
      expect(targetPoint.x).toBeCloseTo(target[0], 3)
      expect(targetPoint.y).toBeCloseTo(target[1], 3)
      expect(targetPoint.z).toBeCloseTo(target[2], 3)
    }
  })

  it('closes the loop with no seam gap in position or target', () => {
    const cameraCurve = buildClosedCameraCurve(LOOK_Y_OFFSETS)
    const targetCurve = buildClosedTargetCurve(LOOK_Y_OFFSETS)
    const before = cameraCurve.getPoint(0.9999)
    const after = cameraCurve.getPoint(0.0001)
    const targetBefore = targetCurve.getPoint(0.9999)
    const targetAfter = targetCurve.getPoint(0.0001)

    expect(before.distanceTo(after)).toBeLessThan(0.05)
    expect(targetBefore.distanceTo(targetAfter)).toBeLessThan(0.05)
    expect(cameraCurve.getPoint(0).distanceTo(cameraCurve.getPoint(1))).toBeLessThan(1e-6)
  })

  it('moves monotonically along the canonical segment with eased transition samples', () => {
    const cameraCurve = buildClosedCameraCurve(LOOK_Y_OFFSETS)
    let previous = cameraCurve.getPoint(getCanonicalRouteT(decodeJourney(245, 1) as never))

    for (let units = 245.5; units <= 254.5; units += 0.5) {
      const sample = decodeJourney(units, 1)

      if (sample.mode !== 'transition') {
        throw new Error(`expected transition at ${units}`)
      }

      const current = cameraCurve.getPoint(getCanonicalRouteT(sample))

      expect(current.distanceTo(previous)).toBeGreaterThan(0)
      previous = current
    }
  })
})
