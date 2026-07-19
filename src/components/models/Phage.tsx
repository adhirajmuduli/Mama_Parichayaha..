'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const headGeometry = new THREE.IcosahedronGeometry(0.45, 1)
const tailGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 16)
const legGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8)
const headMaterial = new THREE.MeshPhysicalMaterial({
  color: '#c084fc',
  emissive: '#7c3aed',
  emissiveIntensity: 1,
  metalness: 0.4,
  roughness: 0.2,
})
const tailMaterial = new THREE.MeshPhysicalMaterial({
  color: '#f97316',
  emissive: '#ea580c',
  emissiveIntensity: 1.2,
})
const legMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff' })
const legOffsets = [-0.3, -0.15, 0.15, 0.3] as const

interface PhageProps {
  position: [number, number, number]
  scale?: number
  speed?: number
}

export default function Phage({ position, scale = 1, speed = 1 }: PhageProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!ref.current) {
      return
    }

    const elapsed = state.clock.elapsedTime * speed
    ref.current.rotation.y += delta * speed * 0.18
    ref.current.position.y = position[1] + Math.sin(elapsed) * 0.15
    ref.current.rotation.z = Math.sin(elapsed * 0.5) * 0.08
  })

  return (
    <group ref={ref} dispose={null} position={position} scale={scale}>
      <mesh>
        <primitive attach="geometry" object={headGeometry} />
        <primitive attach="material" object={headMaterial} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <primitive attach="geometry" object={tailGeometry} />
        <primitive attach="material" object={tailMaterial} />
      </mesh>
      {legOffsets.map((offset) => (
        <mesh key={offset} position={[offset, -1.45, 0]} rotation={[0, 0, offset]}>
          <primitive attach="geometry" object={legGeometry} />
          <primitive attach="material" object={legMaterial} />
        </mesh>
      ))}
    </group>
  )
}
