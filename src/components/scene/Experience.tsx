'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import ChapterCameraRig from '@/components/motion/ChapterCameraRig'
import AtmosphereController from '@/components/scene/AtmosphereController'

import SceneContent from './SceneContent'
import {
  getSceneProfileForTier,
  SceneQualityGovernor,
  type SceneQualityTier,
  type SceneRuntimeProfile,
} from '@/lib/sceneRuntime'

interface ExperienceProps {
  initialProfile: SceneRuntimeProfile
  onContextLost: () => void
}

function useDocumentVisibility() {
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')

  useEffect(() => {
    const syncVisibility = () => setIsVisible(document.visibilityState === 'visible')

    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

  return isVisible
}

function SceneContextMonitor({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }

    canvas.addEventListener('webglcontextlost', handleContextLost, { once: true })
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl, onContextLost])

  return null
}

function ScenePerformanceMonitor({
  tier,
  onTierChange,
}: {
  tier: Exclude<SceneQualityTier, 'static'>
  onTierChange: (tier: Exclude<SceneQualityTier, 'static'>) => void
}) {
  const governor = useRef(new SceneQualityGovernor(tier))

  useFrame((_, delta) => {
    const nextTier = governor.current.sample(delta)

    if (nextTier && nextTier !== 'static') {
      onTierChange(nextTier)
    }
  })

  return null
}

export default function Experience({ initialProfile, onContextLost }: ExperienceProps) {
  const initialTier = initialProfile.tier === 'static' ? 'low' : initialProfile.tier
  const [tier, setTier] = useState<Exclude<SceneQualityTier, 'static'>>(initialTier)
  const eventSource = useRef<HTMLDivElement>(null!)
  const profile = getSceneProfileForTier(tier)
  const isDocumentVisible = useDocumentVisibility()
  const handleTierChange = useCallback((nextTier: Exclude<SceneQualityTier, 'static'>) => {
    setTier((currentTier) => (currentTier === nextTier ? currentTier : nextTier))
  }, [])
  const configureRenderer = useCallback((state: { gl: THREE.WebGLRenderer }) => {
    state.gl.outputColorSpace = THREE.SRGBColorSpace
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
  }, [])

  return (
    <div ref={eventSource} className="h-full w-full">
      <Canvas
        aria-hidden="true"
        camera={{ position: [0, 0, 8], fov: 45 }}
        className="h-full w-full"
        dpr={[1, profile.dprCap]}
        eventPrefix="client"
        eventSource={eventSource}
        frameloop={isDocumentVisible ? 'always' : 'never'}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: profile.powerPreference,
          preserveDrawingBuffer: false,
        }}
        onCreated={configureRenderer}
        resize={{ debounce: { resize: 0, scroll: 50 }, scroll: false }}
      >
        <fog attach="fog" args={['#07020f', 12, 40]} />

        <SceneContextMonitor onContextLost={onContextLost} />
        <ScenePerformanceMonitor tier={tier} onTierChange={handleTierChange} />
        <ChapterCameraRig />
        <AtmosphereController
          particleCount={profile.particleCount}
          postProcessing={profile.postProcessing}
          tier={tier}
        />

        <Suspense fallback={null}>
          <SceneContent tier={tier} />
        </Suspense>
      </Canvas>
    </div>
  )
}
