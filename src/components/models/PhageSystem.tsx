"use client"

import { useRef } from "react"

import { useFrame } from "@react-three/fiber"

import * as THREE from "three"

import useScrollProgress from "@/hooks/useScrollProgress"

import Phage from "@/components/models/Phage"

export default function PhageSystem() {
  const groupRef =
    useRef<THREE.Group>(null)

  const scrollProgress =
    useScrollProgress()

  useFrame(() => {
    if (!groupRef.current) return

    /*
      PHAGES APPEAR
      DURING INTERESTS SECTION
    */

    const visible =
      scrollProgress > 0.18 &&
      scrollProgress < 0.55

    const targetY =
      visible ? 0 : 5

    groupRef.current.position.y =
      THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.03
      )

    groupRef.current.rotation.y += 0.0015
  })

  return (
    <group
      ref={groupRef}
      position={[0, 5, 0]}
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