'use client'

import { useEffect, useState, type CSSProperties } from 'react'

import useChapter from '@/hooks/useChapter'
import { getChapterEntry } from '@/lib/chapterRegistry'
import { getSceneRuntimeProfile, type SceneRuntimeProfile } from '@/lib/sceneRuntime'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

type PosterStyle = CSSProperties &
  Record<'--scene-fallback-base' | '--scene-fallback-mid' | '--scene-fallback-accent', string>

export default function ScenePoster() {
  const rendererAvailable = useSceneInteractionStore((state) => state.rendererAvailable)
  const [profile, setProfile] = useState<SceneRuntimeProfile | null>(null)
  const { chapter } = useChapter()
  const atmosphere = getChapterEntry(chapter).scene.atmosphere
  const particles = Array.from({ length: 20 }, (_, index) => ({
    left: `${(index * 61 + 13) % 100}%`,
    top: `${(index * 37 + 7) % 100}%`,
    animationDelay: `${-index * 1.7}s`,
    animationDuration: `${12 + (index % 7) * 2}s`,
    width: `${2 + (index % 3)}px`,
    height: `${2 + (index % 3)}px`,
  }))
  const style: PosterStyle = {
    '--scene-fallback-accent': atmosphere.palette[2],
    '--scene-fallback-base': atmosphere.palette[0],
    '--scene-fallback-mid': atmosphere.palette[1],
  }

  useEffect(() => {
    setProfile(getSceneRuntimeProfile())
  }, [])

  if (rendererAvailable) {
    return null
  }

  const particleCount = profile
    ? profile.tier === 'static'
      ? 12
      : Math.min(20, Math.max(8, Math.ceil(profile.particleCount / 16)))
    : 12

  return (
    <div
      aria-hidden="true"
      className="scene-poster fixed inset-0 z-0 overflow-hidden"
      data-quality-tier={profile?.tier ?? 'static'}
      style={style}
    >
      <div className="scene-poster__boundary" />
      <div className="scene-poster__particles">
        {particles.slice(0, particleCount).map((particle, i) => (
          <div key={i} className="scene-poster__particle" style={particle} />
        ))}
      </div>
    </div>
  )
}
