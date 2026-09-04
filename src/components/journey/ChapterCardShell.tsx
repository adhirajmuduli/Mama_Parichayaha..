'use client'

import type { ReactNode } from 'react'

import { GlassCard } from '@root/GlassCard'
import type { ChapterId } from '@/content/portfolio'

interface ChapterCardShellProps {
  chapterId: ChapterId
  cardSide: 'left' | 'right'
  visible: boolean
  focusable: boolean
  labelledById: string
  glow: string
  onPointerEnter?: () => void
  children: ReactNode
}

export default function ChapterCardShell({
  cardSide,
  chapterId,
  children,
  focusable,
  glow,
  labelledById,
  visible,
}: ChapterCardShellProps) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-20 flex items-end px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:px-10 ${
        cardSide === 'left' ? 'sm:justify-start' : 'sm:justify-end'
      }`}
      data-chapter-card={chapterId}
      data-card-visible={visible ? 'true' : 'false'}
      {...(focusable ? {} : { inert: true })}
    >
      <div
        className={`w-full transition-opacity duration-200 sm:max-w-xl ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${focusable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <GlassCard
          className="max-h-[62svh] overflow-y-auto"
          glow={glow}
        >
          <div aria-labelledby={labelledById} role="group" data-chapter-card-content={chapterId}>
            {children}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
