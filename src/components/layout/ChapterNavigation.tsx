'use client'

import { useEffect, useRef, useState } from 'react'

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
  const setActiveChapter = useNarrativeStore((state) => state.setActiveChapter)

  return chapters.map((chapter) => (
    <a
      key={chapter.id}
      href={`#${chapter.sectionId}`}
      className="rounded-md px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
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

      <button
        ref={triggerRef}
        type="button"
        className="rounded-md px-3 py-2 text-sm text-zinc-100 outline-offset-2 focus-visible:outline-2 focus-visible:outline-violet-300 md:hidden"
        aria-controls="chapter-navigation-menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(true)}
      >
        Menu
      </button>

      <dialog
        ref={dialogRef}
        id="chapter-navigation-menu"
        aria-label="Chapter navigation"
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#100a1d] p-0 text-white shadow-2xl backdrop:bg-black/65"
        onCancel={(event) => {
          event.preventDefault()
          closeMenu()
        }}
        onClose={() => {
          setIsMenuOpen(false)
          triggerRef.current?.focus()
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="text-sm font-medium">Navigate chapters</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-zinc-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            onClick={closeMenu}
          >
            Close
          </button>
        </div>
        <nav aria-label="Mobile chapter navigation" className="flex flex-col p-3">
          <ChapterLinks chapters={chapters} onNavigate={closeMenu} />
        </nav>
      </dialog>
    </>
  )
}
