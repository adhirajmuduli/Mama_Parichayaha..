'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import useChapterPresence from '@/hooks/useChapterPresence'
import { getChapterEntry } from '@/lib/chapterRegistry'

const [centerX, centerY, centerZ] = getChapterEntry('research').scene.center

const helixTurns = 3.25
const helixHeight = 3.4

function createBackboneGeometry() {
  const points: THREE.Vector3[] = []
  const steps = 160

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps
    const angle = t * helixTurns * Math.PI * 2
    points.push(
      new THREE.Vector3(Math.cos(angle) * 0.55, (t - 0.5) * helixHeight, Math.sin(angle) * 0.55),
    )
  }

  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 200, 0.075, 10, false)
}

const backboneGeometry = createBackboneGeometry()
const sideChainGeometry = new THREE.SphereGeometry(0.09, 12, 12)

const sideChainPositions: [number, number, number][] = Array.from({ length: 13 }, (_, index) => {
  const t = (index + 0.5) / 13
  const angle = t * helixTurns * Math.PI * 2
  return [Math.cos(angle) * 0.78, (t - 0.5) * helixHeight, Math.sin(angle) * 0.78]
})

const backboneMaterial = new THREE.MeshStandardMaterial({
  color: '#67e8f9',
  emissive: '#0e7490',
  emissiveIntensity: 0.35,
  metalness: 0.1,
  roughness: 0.45,
})

const sideChainMaterial = new THREE.MeshStandardMaterial({
  color: '#22d3ee',
  emissive: '#155e75',
  emissiveIntensity: 0.5,
  metalness: 0.1,
  roughness: 0.4,
})

export default function HelixExhibit() {
  const groupRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Group>(null)
  const targetScaleRef = useRef(new THREE.Vector3())
  const presence = useChapterPresence('research')
  const sideChains = useMemo(() => sideChainPositions, [])

  useFrame((_, delta) => {
    if (!groupRef.current || !spinRef.current) {
      return
    }

    targetScaleRef.current.setScalar(presence.active ? 1 : 0.55)
    groupRef.current.scale.lerp(targetScaleRef.current, 1 - Math.exp(-3 * delta))
    groupRef.current.visible = presence.distance <= 2
    spinRef.current.rotation.y += delta * 0.06
  })

  return (
    <group ref={groupRef} position={[centerX, centerY - 0.3, centerZ]} scale={0.55}>
      <group ref={spinRef}>
        <mesh geometry={backboneGeometry} material={backboneMaterial} />
        {sideChains.map((position) => (
          <mesh
            key={position.join(',')}
            geometry={sideChainGeometry}
            material={sideChainMaterial}
            position={position}
          />
        ))}
      </group>
    </group>
  )
}
