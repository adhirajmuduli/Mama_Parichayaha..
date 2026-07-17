'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count: number
}

function createSeededRandom(seed: number) {
  let value = seed

  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let next = Math.imul(value ^ (value >>> 15), 1 | value)
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export default function Particles({ count }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const random = createSeededRandom(0x51ce5eed)
    const array = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      array[index * 3] = (random() - 0.5) * 120
      array[index * 3 + 1] = (random() - 0.5) * 40
      array[index * 3 + 2] = (random() - 0.5) * 80
    }

    return array
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) {
      return
    }

    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
  })

  if (count === 0) {
    return null
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color="#c084fc"
        transparent
        opacity={1}
        depthWrite={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
