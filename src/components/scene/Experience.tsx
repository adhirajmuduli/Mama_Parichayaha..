"use client"

import { Suspense } from "react"

import { Canvas } from "@react-three/fiber"

import {
  Environment,
  Float
} from "@react-three/drei"

import Lighting from "@/components/scene/Lighting"

import DNA from "@/components/models/DNA"

import useChapter from "@/hooks/useChapter"

import ChapterCameraRig from "@/components/motion/ChapterCameraRig"

import PhageSystem from "@/components/models/PhageSystem"

import ProteinShowcase from "@/components/models/ProteinShowcase"

import PostProcessing from "@/components/effects/PostProcessing"

import Particles from "@/components/effects/Particles"

export default function Experience() {

  const { chapter } = useChapter()

  return (
    <Canvas
      camera={{
        position: [0, 0, 8],
        fov: 45
      }}

      gl={{
        antialias: true,
        alpha: true
      }}

      dpr={[1, 2]}

      className="h-full w-full"
    >
      {/* SAFE BACKGROUND */}
      <color
        attach="background"
        args={["#07020f"]}
      />

      {/* TEMPORARY SAFE FOG */}
      <fog
        attach="fog"
        args={["#07020f", 12, 40]}
      />

      {/* SAFE LIGHTING */}
      <ambientLight intensity={1.8} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={3}
      />

      <pointLight
        position={[0, 2, 3]}
        intensity={15}
        color="#c084fc"
      />

      <Environment preset="city" />

      <ChapterCameraRig 
        chapter={chapter}
      />

      <Lighting />

      <Particles />

      <Suspense fallback={null}>

        <DNA />

        <PhageSystem />

        <ProteinShowcase />

      </Suspense>

      <PostProcessing />
      
    </Canvas>
  )
}