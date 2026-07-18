'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import SceneRendererBoundary from '@/components/scene/SceneRendererBoundary'
import { getSceneRuntimeProfile, supportsWebGL, type SceneRuntimeProfile } from '@/lib/sceneRuntime'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

const Experience = dynamic(() => import('./Experience'), {
  ssr: false,
  loading: () => null,
})

export default function SceneClient() {
  const [runtimeProfile, setRuntimeProfile] = useState<SceneRuntimeProfile | null>(null)
  const setRendererAvailable = useSceneInteractionStore((state) => state.setRendererAvailable)

  useEffect(() => {
    const nextProfile = supportsWebGL() ? getSceneRuntimeProfile() : null
    setRuntimeProfile(nextProfile)
    setRendererAvailable(nextProfile?.tier !== 'static')

    return () => {
      setRendererAvailable(false)
    }
  }, [setRendererAvailable])

  if (!runtimeProfile || runtimeProfile.tier === 'static') {
    return null
  }

  return (
    <div className="fixed inset-0 z-0" data-scene-enhancement="webgl">
      <SceneRendererBoundary onError={() => setRendererAvailable(false)}>
        <Experience initialProfile={runtimeProfile} />
      </SceneRendererBoundary>
    </div>
  )
}
