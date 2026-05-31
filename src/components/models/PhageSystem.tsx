"use client"

import { useRef } from "react"

import { useFrame } from "@react-three/fiber"

import usePresence from "@/hooks/usePresence"

import * as THREE from "three"

import { worldLayout } from "@/lib/worldLayout"

import Phage from "@/components/models/Phage"

export default function PhageSystem() {
  const groupRef =
    useRef<THREE.Group>(null)

  const presence =
    usePresence()

  useFrame(() => {
    if (!groupRef.current) return

    const targetScale =
      presence.phages.scale

    groupRef.current.scale.lerp(
      new THREE.Vector3(
        targetScale,
        targetScale,
        targetScale
      ),
      0.05
    )

    groupRef.current.rotation.y +=
      0.0015
  })

  return (
    <group
      ref={groupRef}
      position={[
        worldLayout.interests.center[0],
        0,
        0
      ]}
    >
      <Phage
        position={[-4, 1.5, -2]}
        scale={0.9}
        speed={1}
      />

      <Phage
        position={[0, 2.3, -3]}
        scale={1.1}
        speed={0.7}
      />

      <Phage
        position={[3.8, 1.2, -1]}
        scale={0.85}
        speed={1.3}
      />
    </group>
  )
}