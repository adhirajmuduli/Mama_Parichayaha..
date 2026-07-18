import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import ModelInteractionControls from '@/components/models/ModelInteractionControls'
import { chapterRegistry, getChapterEntry } from '@/lib/chapterRegistry'
import { useNarrativeStore } from '@/stores/narrativeStore'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

describe('ModelInteractionControls', () => {
  beforeEach(() => {
    useNarrativeStore.setState({ activeChapter: 'research', direction: 0, selectedExhibit: null })
    useSceneInteractionStore.setState({
      availableExhibits: ['protein'],
      rendererAvailable: true,
      request: null,
    })
  })

  it('dispatches accessible keyboard and button commands only for the active loaded exhibit', () => {
    render(<ModelInteractionControls chapter={getChapterEntry('research')} />)

    const controls = screen.getByRole('group', { name: 'Protein model controls' })
    fireEvent.keyDown(controls, { key: 'ArrowRight' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'rotate-right',
      exhibitId: 'protein',
    })

    fireEvent.keyDown(controls, { key: 'Home' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'reset',
      exhibitId: 'protein',
    })

    fireEvent.keyDown(controls, { key: 'Escape' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'exit',
      exhibitId: 'protein',
    })
  })

  it('keeps the semantic fallback visible and controls disabled without a matching renderer exhibit', () => {
    useNarrativeStore.setState({ activeChapter: 'origins' })
    useSceneInteractionStore.setState({ availableExhibits: ['protein'], rendererAvailable: true })
    render(<ModelInteractionControls chapter={getChapterEntry('research')} />)

    expect(screen.getByRole('button', { name: 'Rotate model left' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('research content remains fully available')
  })
  it('provides the same discoverable DOM control contract for every retained exhibit', () => {
    render(
      <>
        {chapterRegistry.map((chapter) => (
          <ModelInteractionControls key={chapter.id} chapter={chapter} />
        ))}
      </>,
    )

    expect(screen.getByRole('group', { name: 'DNA model controls' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Bacteriophage model controls' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Protein model controls' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Tardigrade model controls' })).toBeInTheDocument()
  })
})
