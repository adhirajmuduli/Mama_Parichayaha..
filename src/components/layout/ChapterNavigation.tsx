'use client'

import { useEffect, useRef, useState } from 'react'

import LiquidGlass from '@/components/liquid-glass/LiquidGlass'
import LiquidGlassControl from '@/components/liquid-glass/LiquidGlassControl'
import type { ChapterId } from '@/content/portfolio'
import { useNarrativeStore } from '@/stores/narrativeStore'

export interface ChapterNavigationItem {
  id: ChapterId
  sectionId: string
  navigationLabel: string
}

interface ChapterNavigationProps {
  chapters: readonly ChapterNavigationItem[]
}

function ChapterLinks({
  chapters,
  onNavigate,
}: ChapterNavigationProps & { onNavigate?: () => void }) {
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const setActiveChapter = useNarrativeStore((state) => state.setActiveChapter)

  return chapters.map((chapter) => (
    <a
      key={chapter.id}
      href={`#${chapter.sectionId}`}
      aria-current={chapter.id === activeChapter ? 'page' : undefined}
      className="rounded-md px-3 py-2 text-sm text-[var(--site-muted)] transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--site-focus)]"
      onClick={() => {
        setActiveChapter(chapter.id)
        onNavigate?.()
      }}
    >
      {chapter.navigationLabel}
    </a>
  ))
}

export default function ChapterNavigation({ chapters }: ChapterNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isMenuOpen && !dialog.open) {
      dialog.showModal()
    }

    if (!isMenuOpen && dialog.open) {
      dialog.close()
    }
  }, [isMenuOpen])

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav aria-label="Chapter navigation" className="hidden items-center gap-1 md:flex">
        <ChapterLinks chapters={chapters} />
      </nav>

      <LiquidGlassControl
        ref={triggerRef}
        className="md:hidden"
        aria-controls="chapter-navigation-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(true)}
      >
        Menu
      </LiquidGlassControl>

      <dialog
        ref={dialogRef}
        id="chapter-navigation-menu"
        aria-label="Chapter navigation"
        className="m-auto w-[min(24rem,calc(100vw-2rem))] border-0 bg-transparent p-0 text-white backdrop:bg-black/70"
        onCancel={(event) => {
          event.preventDefault()
          closeMenu()
        }}
        onClose={() => {
          setIsMenuOpen(false)
          triggerRef.current?.focus()
        }}
      >
        <LiquidGlass interactive={false} className="[--glass-radius:1rem] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="text-sm font-medium">Navigate chapters</p>
            <LiquidGlassControl className="px-2 py-1" onClick={closeMenu}>
              Close
            </LiquidGlassControl>
          </div>
          <nav aria-label="Mobile chapter navigation" className="flex flex-col p-3">
            <ChapterLinks chapters={chapters} onNavigate={closeMenu} />
          </nav>
        </LiquidGlass>
      </dialog>
    </>
  )
}
