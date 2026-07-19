import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ChapterSection from '@/components/narrative/ChapterSection'
import { chapterRegistry, getChapterContent } from '@/lib/chapterRegistry'

describe('ChapterSection', () => {
  it('renders every registry entry as a labelled semantic section with verified content', () => {
    render(
      <>
        {chapterRegistry.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </>,
    )

    const sections = screen.getAllByRole('region')

    expect(sections.map((section) => section.id)).toEqual(
      chapterRegistry.map((chapter) => chapter.sectionId),
    )

    chapterRegistry.forEach((chapter) => {
      const content = getChapterContent(chapter.id)

      const section = screen.getByRole('region', { name: content.title })

      expect(screen.getByRole('heading', { name: content.title })).toBeInTheDocument()
      expect(within(section).getAllByText(content.description).length).toBeGreaterThan(0)
    })
  })
})
