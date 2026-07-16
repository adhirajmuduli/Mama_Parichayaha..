"use client"

import {
  NarrativeProvider
} from "@/context/NarrativeContext"

import ScrollChapterController
from "@/components/narrative/ScrollChapterController"

interface Props {
  children: React.ReactNode
}

function NarrativeCore({
  children
}: Props) {

  return (
    <>
      <ScrollChapterController />

      {children}
    </>
  )
}

export default function NarrativeEngine({
  children
}: Props) {

  return (
    <NarrativeProvider>

      <NarrativeCore>
        {children}
      </NarrativeCore>

    </NarrativeProvider>
  )
}