'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('future').scene.center

const coreGeometry = new THREE.IcosahedronGeometry(0.34, 1)
const ringGeometry = new THREE.TorusGeometry(1, 0.014, 8, 96)
const nodeGeometry = new THREE.SphereGeometry(0.07, 10, 10)

const coreMaterial = new THREE.MeshStandardMaterial({
  color: '#c4b5fd',
  emissive: '#6d28d9',
  emissiveIntensity: 0.4,
  metalness: 0.3,
  roughness: 0.35,
})

const ringMaterial = new THREE.MeshStandardMaterial({
  color: '#cbd5e1',
  emissive: '#475569',
  emissiveIntensity: 0.2,
  metalness: 0.6,
  roughness: 0.35,
})

const nodeMaterial = new THREE.MeshStandardMaterial({
  color: '#ccfbf1',
  emissive: '#14b8a6',
  emissiveIntensity: 0.55,
  metalness: 0.1,
  roughness: 0.4,
})

const ringDefinitions = [
  { radius: 1.15, rotation: [Math.PI / 2.4, 0.2, 0] },
  { radius: 1.7, rotation: [Math.PI / 1.9, -0.5, 0.3] },
  { radius: 2.25, rotation: [Math.PI / 2.9, 0.9, -0.2] },
] as const

export default function OrbitExhibit() {
  const groupRef = useRef<THREE.Group>(null)
  const orbitRefs = useRef<(THREE.Group | null)[]>([null, null, null])
  const targetScaleRef = useRef(new THREE.Vector3())
  const presence = useChapterPresence('future')

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    targetScaleRef.current.setScalar(presence.nearby ? 1 : 0.1)
    groupRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-3 * delta))
    groupRef.current.visible = presence.distance <= 2

    const elapsed = state.clock.elapsedTime

    orbitRefs.current.forEach((orbit, index) => {
      if (!orbit) {
        return
      }

      orbit.rotation.z += delta * (0.14 - index * 0.035)
      orbit.rotation.y = Math.sin(elapsed * 0.18 + index) * 0.12
    })
  })

  return (
    <group ref={groupRef} position={[centerX, centerY, centerZ]} scale={0.1}>
      <mesh geometry={coreGeometry} material={coreMaterial} />
      {ringDefinitions.map((ring, index) => (
        <group
          key={ring.radius}
          ref={(node) => {
            orbitRefs.current[index] = node
          }}
          rotation={[ring.rotation[0], ring.rotation[1], ring.rotation[2]]}
        >
          <mesh geometry={ringGeometry} material={ringMaterial} scale={ring.radius} />
          <mesh geometry={nodeGeometry} material={nodeMaterial} position={[ring.radius, 0, 0]} />
        </group>
      ))}
    </group>
  )
}
