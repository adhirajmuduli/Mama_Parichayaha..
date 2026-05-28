"use client"

import useScrollProgress from "@/hooks/useScrollProgress"

import { useFrame } from "@react-three/fiber"

import { useRef } from "react"

import * as THREE from "three"

import InteractiveModel from "@/components/models/InteractiveModel"

export default function ProteinShowcase() {
  const groupRef =
    useRef<THREE.Group>(null)

  const progress =
    useScrollProgress()

  useFrame(() => {
    if (!groupRef.current) return

    const visible =
      progress > 0.45

    const targetZ =
      visible ? 0 : -10

    groupRef.current.position.z =
      THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        0.05
      )
  })

  return (
    <group ref={groupRef}>
      <InteractiveModel
        modelPath="/models/Proteins/apoptosome.glb"
        position={[3.5, -0.8, -2]}
        scale={0.03}
        rotation={[0.2, 0.5, 0.5]}
      />
    </group>
  )
}