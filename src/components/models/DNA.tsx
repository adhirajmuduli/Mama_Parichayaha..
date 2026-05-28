"use client"

import { useEffect, useRef } from "react"

import {
  useGLTF,
  useAnimations,
  Center
} from "@react-three/drei"

import { useFrame } from "@react-three/fiber"

import * as THREE from "three"

import { dnaMaterial } from "@/lib/materials"

import SceneController from "@/components/motion/SceneController"

export default function DNA() {
  const containerRef =
    useRef<THREE.Group>(null)

  const { scene, animations } = useGLTF(
    "/models/dna/dna.glb"
  )

  const { actions } = useAnimations(
    animations,
    containerRef
  )

  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action?.play()
    })

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = dnaMaterial

        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [actions, scene])

  useFrame((state) => {
    if (!containerRef.current) return

    const t = state.clock.elapsedTime

    containerRef.current.position.y =
      Math.sin(t * 0.8) * 0.12 - 0.6
  })

  return (
    <>
      <SceneController target={containerRef} />

      <group
        ref={containerRef}
        position={[-2.8, -0.5, 0]}
        rotation={[0.35, -0.45, 0.15]}
        scale={0.24}
      >
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </>
  )
}

useGLTF.preload("/models/dna/dna.glb")