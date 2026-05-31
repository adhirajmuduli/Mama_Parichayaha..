"use client"

import {
  useEffect,
  useRef,
} from "react"

import type { Chapter } from "@/lib/chapters"

import {
  useNarrative,
} from "@/context/NarrativeContext"

interface Props {
  chapter: Chapter

  children: React.ReactNode
}

export default function ChapterBoundary({
  chapter,
  children,
}: Props) {

  const ref =
    useRef<HTMLElement>(null)

  const {
    setChapter,
  } = useNarrative()

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting &&
                entry.intersectionRatio >
                  0.5
              ) {
                setChapter(
                  chapter
                )
              }
            }
          )
        },
        {
          threshold: [
            0.25,
            0.5,
            0.75,
          ],
        }
      )

    observer.observe(
      element
    )

    return () =>
      observer.disconnect()
  }, [
    chapter,
    setChapter,
  ])

  return (
    <section
      ref={ref}
      data-chapter={chapter}
      className="min-h-screen"
    >
      {children}
    </section>
  )
}