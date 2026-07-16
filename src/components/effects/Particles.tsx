"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PARTICLE_COUNT = 1200

export default function Particles() {
  const pointsRef = useRef<THREE.Points>(null)

  /*
    INITIAL POSITIONS
  */
  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Keep these bounds relatively close to the camera
      // so particles constantly spawn tightly around it
      array[i * 3] = (Math.random() - 0.5) * 120
      array[i * 3 + 1] = (Math.random() - 0.5) * 40
      array[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    return array
  }, [])

  /*
    MOTION (Refactored)
  */
  useFrame((state) => {
    if (!pointsRef.current) return

    // 1. Lock the particle system box to the camera's position
    // (Extracted directly from state.camera to optimize performance)
    // pointsRef.current.position.copy(state.camera.position)

    // 2. Apply your ambient rotations
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
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
