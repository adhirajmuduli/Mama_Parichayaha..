'use client'

import type { CSSProperties } from 'react'

import useChapter from '@/hooks/useChapter'
import { getChapterEntry } from '@/lib/chapterRegistry'

type PosterStyle = CSSProperties &
  Record<'--scene-fallback-base' | '--scene-fallback-mid' | '--scene-fallback-accent', string>

export default function ScenePoster() {
  const { chapter } = useChapter()
  const atmosphere = getChapterEntry(chapter).scene.atmosphere
  const style: PosterStyle = {
    '--scene-fallback-accent': atmosphere.palette[2],
    '--scene-fallback-base': atmosphere.palette[0],
    '--scene-fallback-mid': atmosphere.palette[1],
  }

  return (
    <div
      aria-hidden="true"
      className="scene-poster fixed inset-0 z-0 overflow-hidden"
      style={style}
    >
      <div className="scene-poster__cloud scene-poster__cloud--primary" />
      <div className="scene-poster__cloud scene-poster__cloud--secondary" />
      <div className="scene-poster__grain" />
    </div>
  )
}
