import { describe, expect, it } from 'vitest'

import {
  bacteriophageMockSource,
  brainMockSource,
  dnaMockSource,
  earthMockSource,
  hemoglobinMockSource,
  mockSourceFor,
} from '@/exhibits/sources/mockModels'
import { getSourceLoader } from '@/exhibits/sources'
import { exhibits } from '@/content/data/exhibits'
import { describeSourceGrid, readSourceFrame, type AsciiExhibitSource } from '@/exhibits/types'

/**
 * Mock exhibit source contracts (new_plan.md §10.2): the owner-sanctioned
 * preview animations must satisfy every rule a real P9b source must —
 * determinism, stable grids, printable characters, and actual motion —
 * because they run through the identical player path.
 */

const SOURCES: AsciiExhibitSource[] = [
  dnaMockSource,
  bacteriophageMockSource,
  hemoglobinMockSource,
  brainMockSource,
  earthMockSource,
]

const PRINTABLE = /^[\x20-\x7e\n]*$/

function framesOf(source: AsciiExhibitSource, count: number, msPerFrame: number) {
  const frames: string[] = []

  for (let index = 0; index < count; index += 1) {
    frames.push(readSourceFrame(source, index, index * msPerFrame) ?? '')
  }

  return frames
}

describe('mock exhibit sources', () => {
  SOURCES.forEach((source) => {
    describe(`${source.id}`, () => {
      const grid = describeSourceGrid(source)

      it('declares a non-empty grid within the panel budget', () => {
        expect(source.fps).toBeGreaterThan(0)
        expect(source.fps).toBeLessThanOrEqual(30)
        expect(grid.rows).toBeGreaterThan(0)
        expect(grid.cols).toBeGreaterThan(0)
        expect(grid.cols).toBeLessThanOrEqual(80)
        expect(grid.rows).toBeLessThanOrEqual(40)
      })

      it('renders frames with the exact declared grid on every call', () => {
        const frames = framesOf(source, 40, 80)

        expect(frames.length).toBe(40)

        frames.forEach((frame) => {
          expect(frame.length).toBeGreaterThan(0)

          const lines = frame.split('\n')

          expect(lines.length).toBe(grid.rows)
          lines.forEach((line) => expect(line.length).toBe(grid.cols))
        })
      })

      it('is deterministic: same inputs render the identical frame', () => {
        const first = readSourceFrame(source, 7, 1337) ?? ''
        const second = readSourceFrame(source, 7, 1337) ?? ''

        expect(first).toBe(second)
      })

      it('produces only printable ASCII characters', () => {
        const frames = framesOf(source, 30, 100)

        frames.forEach((frame) => {
          expect(frame).toMatch(PRINTABLE)
        })
      })

      it('animates: later frames differ from earlier ones', () => {
        const early = readSourceFrame(source, 0, 0) ?? ''
        const late = readSourceFrame(source, 60, 60_000) ?? ''

        expect(late).not.toBe(early)
      })

      it('draws visible structure (frames are not mostly empty)', () => {
        const frame = readSourceFrame(source, 0, 0) ?? ''
        const ink = frame.replace(/ /g, '').length

        expect(ink).toBeGreaterThan(frame.length * 0.03)
      })
    })
  })

  it('exposes every exhibit through its source loader', async () => {
    const sources = await Promise.all(
      exhibits.map((exhibit) => getSourceLoader(exhibit.sourceKey, exhibit.id)()),
    )

    sources.forEach((source, index) => {
      expect(source.id).toBe(`art:${exhibits[index]?.sourceKey}`)
    })
  })
})
