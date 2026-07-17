'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import SceneRendererBoundary from '@/components/scene/SceneRendererBoundary'
import { getSceneRuntimeProfile, supportsWebGL, type SceneRuntimeProfile } from '@/lib/sceneRuntime'

const Experience = dynamic(() => import('./Experience'), {
  ssr: false,
  loading: () => null,
})

export default function SceneClient() {
  const [runtimeProfile, setRuntimeProfile] = useState<SceneRuntimeProfile | null>(null)

  useEffect(() => {
    if (supportsWebGL()) {
      setRuntimeProfile(getSceneRuntimeProfile())
    }
  }, [])

  if (!runtimeProfile || runtimeProfile.tier === 'static') {
    return null
  }

  return (
    <div className="fixed inset-0 z-0" data-scene-enhancement="webgl">
      <SceneRendererBoundary>
        <Experience initialProfile={runtimeProfile} />
      </SceneRendererBoundary>
    </div>
  )
}
