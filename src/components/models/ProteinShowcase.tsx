"use client"

import { useRef } from "react"

import { useFrame } from "@react-three/fiber"

import * as THREE from "three"

import InteractiveModel from "@/components/models/InteractiveModel"

import { worldLayout } from "@/lib/worldLayout"

export default function ProteinShowcase() {

  const groupRef =
    useRef<THREE.Group>(null)

  useFrame((state) => {

    if (!groupRef.current)
      return

    groupRef.current.rotation.y =
      Math.sin(
        state.clock.elapsedTime * 0.3
      ) * 0.15
  })

  return (
    <group
      ref={groupRef}
      position={[
        worldLayout.research.center[0],
        0,
        0
      ]}
    >
      <InteractiveModel
        modelPath="/models/Proteins/apoptosome.glb"
        position={[0, -0.8, -2]}
        scale={0.03}
        rotation={[0.2, 0.5, 0.5]}
      />
    </group>
  )
}