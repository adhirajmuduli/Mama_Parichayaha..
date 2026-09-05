'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

import SceneErrorBoundary from './SceneErrorBoundary'
import type { ExperienceProps } from './Experience'
import { getSceneRuntimeProfile, supportsWebGL, type SceneRuntimeProfile } from '@/lib/sceneRuntime'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

const Experience = dynamic<ExperienceProps>(() => import('./Experience'), { ssr: false })

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
  const setRendererAvailable = useSceneInteractionStore((state) => state.setRendererAvailable)
  const [profile, setProfile] = useState<SceneRuntimeProfile | null>(null)
  const [fallbackReason, setFallbackReason] = useState<SceneFallbackReason | null>(null)

  const disableRenderer = useCallback(
    (reason: SceneFallbackReason) => {
      setRendererAvailable(false)
      setProfile(null)
      setFallbackReason(reason)
    },
    [setRendererAvailable],
  )

  useEffect(() => {
    if (!supportsWebGL()) {
      disableRenderer('unsupported')
      return
    }

    const nextProfile = getSceneRuntimeProfile()

    if (nextProfile.tier === 'static') {
      disableRenderer('static_preference')
      return
    }

    setRendererAvailable(true)
    setProfile(nextProfile)
    setFallbackReason(null)
  }, [disableRenderer, setRendererAvailable])

  if (profile) {
    return (
      <SceneErrorBoundary name="webgl" onError={() => disableRenderer('renderer_error')}>
        <div data-scene-enhancement="webgl" className="pointer-events-none absolute inset-0 z-0">
          <Experience
            initialProfile={profile}
            onContextLost={() => disableRenderer('context_lost')}
          />
        </div>
      </SceneErrorBoundary>
    )
  }

  if (!fallbackReason) {
    return null
  }

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {fallbackMessages[fallbackReason]}
    </p>
  )
}
