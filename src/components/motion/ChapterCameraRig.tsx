'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { useJourneyRuntime } from '@/lib/journeyRuntime'
import { decodeJourney, getCanonicalRouteT } from '@/lib/journeyTimeline'
import { chapterRegistry } from '@/lib/chapterRegistry'
import { getDwellCameraAnchor, getDwellLookTarget } from '@/lib/closedRoute'
import {
  buildClosedCameraCurve,
  buildClosedTargetCurve,
  DWELL_FOV,
  TRANSITION_BANK_MAX_DEG,
  TRANSITION_FOV_MAX,
  TRANSITION_TARGET_LEAD,
} from '@/lib/closedRouteCurves'

const DWELL_SNAP_EPSILON = 0.01
const TRACKING_RATE = 6

const lookYOffsets = chapterRegistry.map((entry) => entry.scene.lookYOffset)

export default function ChapterCameraRig() {
  const { camera } = useThree()
  const runtime = useJourneyRuntime()
  const perspectiveCamera = camera as THREE.PerspectiveCamera
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const currentTarget = useRef(new THREE.Vector3())
  const scratchTangent = useRef(new THREE.Vector3())
  const fovRef = useRef(DWELL_FOV)
  const bankRef = useRef(0)
  const initializedRef = useRef(false)

  const cameraCurve = useRef(buildClosedCameraCurve(lookYOffsets))
  const targetCurve = useRef(buildClosedTargetCurve(lookYOffsets))

  useFrame((_, delta) => {
    const units = runtime.renderUnits.get()
    const direction = runtime.getLastInputDirection()
    const sample = decodeJourney(units, direction)
    let targetFov = DWELL_FOV
    let targetBank = 0

    if (sample.mode === 'dwell') {
      const entry = chapterRegistry[sample.currentIndex]!
      const [px, py, pz] = getDwellCameraAnchor(sample.currentIndex, entry.scene.lookYOffset)
      const [tx, ty, tz] = getDwellLookTarget(sample.currentIndex, entry.scene.lookYOffset)

      desiredPosition.current.set(px, py, pz)
      desiredTarget.current.set(tx, ty, tz)

      if (!runtime.isMoving()) {
        camera.position.copy(desiredPosition.current)
        currentTarget.current.copy(desiredTarget.current)
        targetFov = DWELL_FOV
        bankRef.current = 0
      }
    } else {
      const segmentT = getCanonicalRouteT(sample)
      const position = cameraCurve.current.getPoint(segmentT)
      const target = targetCurve.current.getPoint(segmentT)

      cameraCurve.current.getTangent(segmentT, scratchTangent.current)

      const pulse = Math.sin(Math.PI * sample.routeCanonicalT) ** 2

      desiredPosition.current.copy(position)
      desiredTarget.current.copy(target)
      desiredTarget.current.addScaledVector(scratchTangent.current, TRANSITION_TARGET_LEAD * pulse)

      targetFov = DWELL_FOV + (TRANSITION_FOV_MAX - DWELL_FOV) * pulse
      targetBank = ((TRANSITION_BANK_MAX_DEG * Math.PI) / 180) * pulse * direction
    }

    if (!initializedRef.current) {
      camera.position.copy(desiredPosition.current)
      currentTarget.current.copy(desiredTarget.current)
      initializedRef.current = true
    }

    const settled =
      sample.mode === 'dwell' &&
      camera.position.distanceToSquared(desiredPosition.current) <
        DWELL_SNAP_EPSILON * DWELL_SNAP_EPSILON &&
      currentTarget.current.distanceToSquared(desiredTarget.current) <
        DWELL_SNAP_EPSILON * DWELL_SNAP_EPSILON

    if (!settled) {
      const alpha = 1 - Math.exp(-TRACKING_RATE * delta)

      camera.position.lerp(desiredPosition.current, alpha)
      currentTarget.current.lerp(desiredTarget.current, alpha)
    }

    camera.lookAt(currentTarget.current)

    bankRef.current += (targetBank - bankRef.current) * (1 - Math.exp(-TRACKING_RATE * delta))

    if (Math.abs(bankRef.current) > 1e-4) {
      camera.rotateZ(bankRef.current)
    }

    fovRef.current += (targetFov - fovRef.current) * (1 - Math.exp(-TRACKING_RATE * delta))

    if (Math.abs(fovRef.current - perspectiveCamera.fov) > 0.01) {
      perspectiveCamera.fov = fovRef.current
      camera.updateProjectionMatrix()
    }
  })

  return null
}
