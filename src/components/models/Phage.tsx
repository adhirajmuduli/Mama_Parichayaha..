'use client'

import { useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import * as THREE from 'three'

interface PhageProps {
  position: [number, number, number]

  scale?: number

  speed?: number
}

export default function Phage({ position, scale = 1, speed = 1 }: PhageProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return

    const t = state.clock.elapsedTime * speed

    ref.current.rotation.y += 0.003

    ref.current.position.y = position[1] + Math.sin(t) * 0.15

    ref.current.rotation.z = Math.sin(t * 0.5) * 0.08
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* HEAD */}
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />

        <meshPhysicalMaterial
          color="#c084fc"

          emissive="#7c3aed"
          emissiveIntensity={1}

          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* TAIL */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 16]} />

        <meshPhysicalMaterial
          color="#f97316"

          emissive="#ea580c"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* LEGS */}
      {[-0.3, -0.15, 0.15, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -1.45, 0]} rotation={[0, 0, x]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />

          <meshPhysicalMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}
