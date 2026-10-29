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
      expect(first?.text).toMatch(/^[\x20-\x7e\u2580-\u259f\n]*$/)
      expect(first?.text).toMatch(/[\u2580-\u259f]/)

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
