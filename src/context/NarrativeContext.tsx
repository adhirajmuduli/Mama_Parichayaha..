'use client'

import { createContext, useContext, useState } from 'react'

import type { Chapter } from '@/lib/chapters'

interface NarrativeState {
  chapter: Chapter

  setChapter: (chapter: Chapter) => void
}

const NarrativeContext = createContext<NarrativeState>({
  chapter: 'origins',

  setChapter: () => {},
})

export function useNarrative() {
  return useContext(NarrativeContext)
}

interface Props {
  children: React.ReactNode
}

export function NarrativeProvider({ children }: Props) {
  const [chapter, setChapter] = useState<Chapter>('origins')

  return (
    <NarrativeContext.Provider
      value={{
        chapter,
        setChapter,
      }}
    >
      {children}
    </NarrativeContext.Provider>
  )
}
