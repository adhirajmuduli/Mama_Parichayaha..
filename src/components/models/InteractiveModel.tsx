"use client"

import {
  useGLTF,
  Center
} from "@react-three/drei"

import {
  useFrame,
  useThree
} from "@react-three/fiber"

import {
  useEffect,
  useRef,
  useState
} from "react"

import * as THREE from "three"

interface InteractiveModelProps {
  modelPath: string

  position?: [number, number, number]

  scale?: number

  rotation?: [number, number, number]

  color?: string

  emissive?: string
}

export default function InteractiveModel({
  modelPath,

  position = [0, 0, 0],

  scale = 1,

  rotation = [0, 0, 0],

  color = "#ffffff",

  emissive = "#000000"
}: InteractiveModelProps) {
  const groupRef =
    useRef<THREE.Group>(null)

  const isDragging =
    useRef(false)

  const velocity =
    useRef(0)

  const previousX =
    useRef(0)

  const [hovered, setHovered] =
    useState(false)

  const { scene } =
    useGLTF(modelPath)

  const { viewport } =
    useThree()

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material =
          new THREE.MeshPhysicalMaterial({
            color,

            emissive,

            emissiveIntensity:
              hovered ? 2 : 0.7,

            roughness: 0.18,

            metalness: 0.35,

            clearcoat: 1
          })

        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [
    scene,
    color,
    emissive,
    hovered
  ])

  useFrame(() => {
    if (!groupRef.current) return

    if (!isDragging.current) {
      velocity.current *= 0.94

      groupRef.current.rotation.y +=
        velocity.current

      groupRef.current.rotation.y +=
        0.0015
    }
  })

  const onPointerDown = (
    e: any
  ) => {
    e.stopPropagation()

    isDragging.current = true

    previousX.current = e.clientX
  }

  const onPointerUp = () => {
    isDragging.current = false
  }

  const onPointerMove = (
    e: any
  ) => {
    if (
      !isDragging.current ||
      !groupRef.current
    )
      return

    const delta =
      e.clientX - previousX.current

    previousX.current = e.clientX

    velocity.current =
      delta * 0.0009

    groupRef.current.rotation.y +=
      velocity.current
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={() =>
        setHovered(true)
      }
      onPointerLeave={() =>
        setHovered(false)
      }
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