'use client'

import ScrollChapterController from '@/components/narrative/ScrollChapterController'

interface Props {
  children: React.ReactNode
}

function NarrativeCore({ children }: Props) {
  return (
    <>
      <ScrollChapterController />

      {children}
    </>
  )
}

export default function NarrativeEngine({ children }: Props) {
  return <NarrativeCore>{children}</NarrativeCore>
}
