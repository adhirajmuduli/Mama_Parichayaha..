'use client'

import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.2}

        luminanceThreshold={0.3}
        luminanceSmoothing={1.2}

        mipmapBlur
      />

      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}

        offset={[0.0006, 0.0006]}
      />

      <Vignette
        eskil={false}

        offset={0.15}
        darkness={0.9}
      />
    </EffectComposer>
  )
}
