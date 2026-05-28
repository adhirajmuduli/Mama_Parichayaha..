"use client"

import useScrollProgress from "@/hooks/useScrollProgress"

export type SectionState =
  | "hero"
  | "interests"
  | "projects"
  | "footer"

export default function useSectionState():
  SectionState {

  const progress =
    useScrollProgress()

  if (progress < 0.25) {
    return "hero"
  }

  if (progress < 0.5) {
    return "interests"
  }

  if (progress < 0.8) {
    return "projects"
  }

  return "footer"
}