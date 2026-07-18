'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import PostProcessing from '@/components/effects/PostProcessing'
import Particles from '@/components/effects/Particles'
import useChapter from '@/hooks/useChapter'
import { createAtmosphereRuntime, transitionAtmosphereRuntime } from '@/lib/atmosphere'
import { getChapterEntry } from '@/lib/chapterRegistry'
import type { SceneQualityTier } from '@/lib/sceneRuntime'

import Lighting from './Lighting'
import NebulaBackground from './NebulaBackground'
import { AtmosphereRuntimeProvider } from './AtmosphereContext'

interface AtmosphereControllerProps {
  particleCount: number
  postProcessing: boolean
  tier: Exclude<SceneQualityTier, 'static'>
}

function useReducedMotionPreference() {
  const preference = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      preference.current = mediaQuery.matches
    }

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return preference
}

export default function AtmosphereController({
  particleCount,
  postProcessing,
  tier,
}: AtmosphereControllerProps) {
  const { chapter } = useChapter()
  const reducedMotion = useReducedMotionPreference()
  const initialChapter = getChapterEntry('origins')
  const runtime = useMemo(
    () => createAtmosphereRuntime(initialChapter.scene.atmosphere, initialChapter.scene.center),
    [initialChapter.scene.atmosphere, initialChapter.scene.center],
  )

  useFrame((state, delta) => {
    const target = getChapterEntry(chapter)

    transitionAtmosphereRuntime(runtime, target.scene.atmosphere, target.scene.center, delta, {
      reduceMotion: reducedMotion.current,
    })

    state.scene.background = runtime.background
    state.gl.toneMappingExposure = runtime.exposure

    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.copy(runtime.fogColor)
      state.scene.fog.near = runtime.fogNear
      state.scene.fog.far = runtime.fogFar
    }
  })

  return (
    <AtmosphereRuntimeProvider value={runtime}>
      <NebulaBackground tier={tier} />
      <Lighting />
      <Particles count={particleCount} />
      {postProcessing ? <PostProcessing /> : null}
    </AtmosphereRuntimeProvider>
  )
}
