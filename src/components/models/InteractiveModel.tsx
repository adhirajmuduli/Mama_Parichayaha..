"use client"

import { Center, useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface InteractiveModelProps {
  modelPath: string
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  color?: string
  emissive?: string
  emissiveIntensity?: number
}

export default function InteractiveModel({
  modelPath,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  color = "#ffffff",
  emissive = "#000000",
  emissiveIntensity = 0.7,
}: InteractiveModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const velocity = useRef(0)
  const previousX = useRef(0)
  const [hovered, setHovered] = useState(false)
  const { scene } = useGLTF(modelPath)

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color,
          emissive,
          emissiveIntensity: hovered ? 2.4 : emissiveIntensity,
          roughness: 0.18,
          metalness: 0.35,
          clearcoat: 1,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene, color, emissive, emissiveIntensity, hovered])

  useFrame(() => {
    if (!groupRef.current || isDragging.current) return

    velocity.current *= 0.94
    groupRef.current.rotation.y += velocity.current + 0.0015
  })

  const onPointerDown = (event: { stopPropagation: () => void; clientX: number }) => {
    event.stopPropagation()
    isDragging.current = true
    previousX.current = event.clientX
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  const onPointerMove = (event: { clientX: number }) => {
    if (!isDragging.current || !groupRef.current) return

    const delta = event.clientX - previousX.current
    previousX.current = event.clientX
    velocity.current = delta * 0.0009
    groupRef.current.rotation.y += velocity.current
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}