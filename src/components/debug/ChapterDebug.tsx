"use client"

import useChapter
from "@/hooks/useChapter"

export default function ChapterDebug() {

  const {
    chapter,
  } = useChapter()

  console.log("CURRENT CHAPTER:", chapter)

  return (
    <div
      className="
        fixed
        bottom-6
        left-6
        z-[999]

        rounded-xl
        bg-black/70

        px-4
        py-2

        text-sm
        text-white
      "
    >
      {chapter}
    </div>
  )
}