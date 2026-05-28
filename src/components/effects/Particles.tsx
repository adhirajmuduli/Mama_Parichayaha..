"use client"

import { useMemo, useRef } from "react"

import { useFrame } from "@react-three/fiber"

import * as THREE from "three"

const PARTICLE_COUNT = 1200

export default function Particles() {
  const pointsRef =
    useRef<THREE.Points>(null)

  /*
    INITIAL POSITIONS
  */

  const positions = useMemo(() => {
    const array =
      new Float32Array(
        PARTICLE_COUNT * 3
      )

    for (
      let i = 0;
      i < PARTICLE_COUNT;
      i++
    ) {
      array[i * 3] =
        (Math.random() - 0.5) * 25

      array[i * 3 + 1] =
        (Math.random() - 0.5) * 18

      array[i * 3 + 2] =
        (Math.random() - 0.5) * 20
    }

    return array
  }, [])

  /*
    MOTION
  */

  useFrame((state) => {
    if (!pointsRef.current) return

    pointsRef.current.rotation.y =
      state.clock.elapsedTime * 0.01

    pointsRef.current.rotation.x =
      Math.sin(
        state.clock.elapsedTime * 0.05
      ) * 0.05
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
        size={0.03}

        color="#c084fc"

        transparent

        opacity={0.75}

        depthWrite={false}

        blending={
          THREE.AdditiveBlending
        }
      />
    </points>
  )
}