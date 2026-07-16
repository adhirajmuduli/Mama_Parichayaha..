'use client'

import { useNarrative } from '@/context/NarrativeContext'

export default function useChapter() {
  return useNarrative()
}
