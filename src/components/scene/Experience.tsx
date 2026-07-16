'use client'

import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'

import Lighting from '@/components/scene/Lighting'
import SceneContent from './SceneContent'
import ChapterCameraRig from '@/components/motion/ChapterCameraRig'
import PostProcessing from '@/components/effects/PostProcessing'
import Particles from '@/components/effects/Particles'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')

    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function SceneFallback() {
  return <div aria-hidden="true" className="h-full w-full bg-[#07020f]" />
}

export default function Experience() {
  const [hasWebGL, setHasWebGL] = useState(false)

  useEffect(() => {
    setHasWebGL(supportsWebGL())
  }, [])

  if (!hasWebGL) {
    return <SceneFallback />
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      className="h-full w-full"
    >
      <color attach="background" args={['#07020f']} />
      <fog attach="fog" args={['#07020f', 12, 40]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 5, 5]} intensity={3} />
      <pointLight position={[0, 2, 3]} intensity={15} color="#c084fc" />

      <ChapterCameraRig />
      <Lighting />
      <Particles />

      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>

      <PostProcessing />
    </Canvas>
  )
}
