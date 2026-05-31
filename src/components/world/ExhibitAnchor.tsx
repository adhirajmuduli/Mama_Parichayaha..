"use client"

import * as THREE from "three"

interface ExhibitAnchorProps {
  children: React.ReactNode

  position: [number, number, number]
}

export default function ExhibitAnchor({
  children,
  position
}: ExhibitAnchorProps) {
  return (
    <group position={position}>
      {children}
    </group>
  )
}