import { describe, expect, it } from 'vitest'

import { chapterCount, chapterIndexMap, chapters } from '@/lib/chapters'

describe('chapter contract', () => {
  it('keeps every chapter unique and indexed in narrative order', () => {
    expect(new Set(chapters).size).toBe(chapters.length)
    expect(chapterCount).toBe(chapters.length)

    chapters.forEach((chapter, index) => {
      expect(chapterIndexMap[chapter]).toBe(index)
    })
  })
})
