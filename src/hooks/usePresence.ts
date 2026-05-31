"use client"

import useChapter from "@/hooks/useChapter"

import { presenceMap }
from "@/lib/chapterPresence"

export default function usePresence() {

  const { chapter } =
    useChapter()

  return presenceMap[
    chapter
  ]
}