'use client'

import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { BlendFunction, BloomEffect } from 'postprocessing'

import { useAtmosphereRuntime } from '@/components/scene/AtmosphereContext'

function DynamicBloom() {
  const runtime = useAtmosphereRuntime()
  const bloom = useMemo(
    () =>
      new BloomEffect({
        blendFunction: BlendFunction.SCREEN,
        intensity: runtime.bloomIntensity,
        luminanceSmoothing: 0.3,
        luminanceThreshold: runtime.bloomThreshold,
        mipmapBlur: true,
      }),
    [runtime],
  )

  useEffect(() => () => bloom.dispose(), [bloom])

  useFrame(() => {
    bloom.intensity = runtime.bloomIntensity
    bloom.luminanceMaterial.threshold = runtime.bloomThreshold
  })

  return <primitive dispose={null} object={bloom} />
}

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <DynamicBloom />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.00035, 0.00035]} />
      <Vignette darkness={0.72} eskil={false} offset={0.22} />
    </EffectComposer>
  )
}
