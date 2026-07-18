'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

import SceneRendererBoundary from '@/components/scene/SceneRendererBoundary'
import { getSceneRuntimeProfile, supportsWebGL, type SceneRuntimeProfile } from '@/lib/sceneRuntime'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

const Experience = dynamic(() => import('./Experience'), {
  ssr: false,
  loading: () => null,
})

type SceneFallbackReason = 'context_lost' | 'renderer_error' | 'static_preference' | 'unsupported'

const fallbackMessages: Record<SceneFallbackReason, string> = {
  context_lost:
    'The interactive 3D scene was stopped after graphics context loss. The complete portfolio content remains available.',
  renderer_error:
    'The interactive 3D scene is unavailable. The complete portfolio content remains available.',
  static_preference:
    'The interactive 3D scene is paused to respect this device or motion preference. The complete portfolio content remains available.',
  unsupported:
    'This device does not support the interactive 3D scene. The complete portfolio content remains available.',
}

export default function SceneClient() {
  const [runtimeProfile, setRuntimeProfile] = useState<SceneRuntimeProfile | null>(null)
  const [fallbackReason, setFallbackReason] = useState<SceneFallbackReason | null>(null)
  const setRendererAvailable = useSceneInteractionStore((state) => state.setRendererAvailable)

  const handleRendererFailure = useCallback(
    (reason: Exclude<SceneFallbackReason, 'static_preference' | 'unsupported'>) => {
      setFallbackReason(reason)
      setRendererAvailable(false)
    },
    [setRendererAvailable],
  )

  useEffect(() => {
    if (!supportsWebGL()) {
      setRuntimeProfile(null)
      setFallbackReason('unsupported')
      setRendererAvailable(false)
      return
    }

    const nextProfile = getSceneRuntimeProfile()
    setRuntimeProfile(nextProfile)
    setFallbackReason(nextProfile.tier === 'static' ? 'static_preference' : null)
    setRendererAvailable(nextProfile.tier !== 'static')

    return () => {
      setRendererAvailable(false)
    }
  }, [setRendererAvailable])

  if (fallbackReason || !runtimeProfile || runtimeProfile.tier === 'static') {
    const reason = fallbackReason ?? 'static_preference'

    return (
      <p className="sr-only" role="status" aria-live="polite">
        {fallbackMessages[reason]}
      </p>
    )
  }

  return (
    <div className="fixed inset-0 z-0" data-scene-enhancement="webgl">
      <SceneRendererBoundary onError={() => handleRendererFailure('renderer_error')}>
        <Experience
          initialProfile={runtimeProfile}
          onContextLost={() => handleRendererFailure('context_lost')}
        />
      </SceneRendererBoundary>
    </div>
  )
}
