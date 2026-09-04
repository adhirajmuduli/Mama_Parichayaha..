'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

import useChapter from '@/hooks/useChapter'
import { getChapterEntry } from '@/lib/chapterRegistry'
import { getSceneRuntimeProfile, type SceneRuntimeProfile } from '@/lib/sceneRuntime'

type PosterStyle = CSSProperties &
  Record<'--scene-fallback-base' | '--scene-fallback-mid' | '--scene-fallback-accent', string>

export default function ScenePoster() {
  const [isMounted, setIsMounted] = useState(false)
  const [profile, setProfile] = useState<SceneRuntimeProfile | null>(null)
  const { chapter } = useChapter()
  const atmosphere = getChapterEntry(chapter).scene.atmosphere
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 15}s`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
      })),
    [],
  )
  const style: PosterStyle = {
    '--scene-fallback-accent': atmosphere.palette[2],
    '--scene-fallback-base': atmosphere.palette[0],
    '--scene-fallback-mid': atmosphere.palette[1],
  }

  useEffect(() => {
    setIsMounted(true)
    setProfile(getSceneRuntimeProfile())
  }, [])

  if (!isMounted || !profile) {
    return null
  }

  const particleCount = Math.min(20, Math.ceil(profile.particleCount / 16))

  return (
    <div
      aria-hidden="true"
      className="scene-poster fixed inset-0 z-0 overflow-hidden"
      data-quality-tier={profile.tier}
      style={style}
    >
      <svg className="scene-poster__filters" aria-hidden="true">
        <defs>
          <filter id="cloudFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="4"
              seed="42"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="12" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="colored"
            />
          </filter>
          <filter id="cloudFilterSecondary" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="3"
              seed="123"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="10" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="colored"
            />
          </filter>
        </defs>
      </svg>
      <div className="scene-poster__cloud scene-poster__cloud--primary" />
      <div className="scene-poster__cloud scene-poster__cloud--secondary" />
      <div className="scene-poster__texture-overlay" />
      <div className="scene-poster__grain" />
      <div className="scene-poster__particles">
        {particles.slice(0, particleCount).map((particle, i) => (
          <div
            key={i}
            className="scene-poster__particle"
            style={particle}
          />
        ))}
      </div>
    </div>
  )
}
