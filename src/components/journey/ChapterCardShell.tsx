'use client'

import type { ReactNode } from 'react'

import { GlassCard } from '@/components/glass-card/GlassCard'
import type { ChapterId } from '@/content/portfolio'

interface ChapterCardShellProps {
  enhanced?: boolean
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
  enhanced = true,
  cardSide,
  chapterId,
  children,
  focusable,
  glow,
  labelledById,
  visible,
}: ChapterCardShellProps) {
  return (
    <section
      id={chapterId}
      aria-labelledby={labelledById}
      tabIndex={-1}
      aria-hidden={enhanced && !visible}
      className={
        enhanced
          ? `pointer-events-none fixed inset-0 z-20 flex items-end px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:items-center sm:px-10 ${
              cardSide === 'left' ? 'sm:justify-start' : 'sm:justify-end'
            }`
          : 'relative z-20 mx-auto max-w-4xl px-6 py-12'
      }
      data-chapter-card={chapterId}
      data-card-visible={visible ? 'true' : 'false'}
      {...(!enhanced || focusable ? {} : { inert: true })}
    >
      <div
        className={`w-full transition-opacity duration-200 sm:max-w-xl ${
          !enhanced || visible ? 'opacity-100' : 'opacity-0'
        } ${!enhanced || focusable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <GlassCard
          className={enhanced ? 'max-h-[68svh] overflow-y-auto sm:max-h-[72svh]' : ''}
          glow={glow}
        >
          <div aria-labelledby={labelledById} role="group" data-chapter-card-content={chapterId}>
            {children}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
