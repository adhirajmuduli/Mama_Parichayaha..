import { describe, expect, it } from 'vitest'

import { contactArtwork } from '@/arts/contact'
import { computationArtwork } from '@/arts/computation'
import { futureArtwork } from '@/arts/future'
import { interestsArtwork } from '@/arts/interests'
import { originsArtwork } from '@/arts/origins'
import { publicationsArtwork } from '@/arts/publications'
import { researchArtwork } from '@/arts/research'
import type { AsciiExhibitSource } from '@/exhibits/types'

const artworks: readonly AsciiExhibitSource[] = [
  originsArtwork,
  interestsArtwork,
  researchArtwork,
  computationArtwork,
  futureArtwork,
  publicationsArtwork,
  contactArtwork,
]

describe('authored colored block artworks', () => {
  artworks.forEach((artwork) => {
    it(`${artwork.id} is deterministic, colorful, detailed, and continuously animated`, () => {
      const grid = artwork.grid
      const render = artwork.renderColored
      if (!grid || !render) throw new Error(`${artwork.id} must declare a grid and renderer`)
      expect(artwork.palette?.length).toBeGreaterThanOrEqual(5)

      const first = render(7, 1200)
      const repeated = render(7, 1200)
      const later = render(19, 3600)
      expect(repeated).toEqual(first)
      expect(later).toBeDefined()
      expect(first?.text).not.toBe(later?.text)
      // Allowed glyph set = printable ASCII + the ranges the 'JetBrains Mono
      // Symbols' supplementary face carries at the uniform 0.6em advance
      // (globals.css @font-face). Anything outside this set falls back to a
      // wider face and breaks the panel's grid math (pinned by the e2e
      // glyph-advance invariant).
      expect(first?.text).toMatch(/^[\x20-\x7e\u00b7\u02d9\u2022\u2190-\u22ff\u2500-\u25ff\n]*$/)
      expect(first?.text).toMatch(/[\u2580-\u259f]/)
      expect(first?.text.match(/[\u2580-\u259f]/g)?.length ?? 0).toBeGreaterThan(grid.rows)

      const lines = first?.text.split('\n') ?? []
      expect(lines).toHaveLength(grid.rows)
      lines.forEach((row) => expect(row).toHaveLength(grid.cols))
      expect(first.colorIndices).toHaveLength(grid.rows * grid.cols)
      expect(new Set(Array.from(first.colorIndices)).size).toBeGreaterThanOrEqual(3)
      expect(first?.text.replace(/[ \n]/g, '').length).toBeGreaterThan(grid.rows * grid.cols * 0.08)
    })
  })

  it('uses a distinct art identity for every chapter', () => {
    expect(new Set(artworks.map((artwork) => artwork.id)).size).toBe(7)
    expect(new Set(artworks.map((artwork) => artwork.palette?.join(','))).size).toBe(7)
  })
})
