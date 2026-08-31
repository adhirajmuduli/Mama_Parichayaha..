import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import ModelInteractionControls from '@/components/models/ModelInteractionControls'
import { chapterRegistry, getChapterEntry } from '@/lib/chapterRegistry'
import { useNarrativeStore } from '@/stores/narrativeStore'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

describe('ModelInteractionControls', () => {
  beforeEach(() => {
    useNarrativeStore.setState({ activeChapter: 'interests', direction: 0, selectedExhibit: null })
    useSceneInteractionStore.setState({
      availableExhibits: ['bacteriophage'],
      rendererAvailable: true,
      request: null,
    })
  })

  it('dispatches accessible keyboard and button commands only for the active loaded exhibit', () => {
    render(<ModelInteractionControls chapter={getChapterEntry('interests')} />)

    const controls = screen.getByRole('group', { name: 'Bacteriophage model controls' })
    fireEvent.keyDown(controls, { key: 'ArrowRight' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'rotate-right',
      exhibitId: 'bacteriophage',
    })

    fireEvent.keyDown(controls, { key: 'Home' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'reset',
      exhibitId: 'bacteriophage',
    })

    fireEvent.keyDown(controls, { key: 'Escape' })

    expect(useSceneInteractionStore.getState().request).toMatchObject({
      command: 'exit',
      exhibitId: 'bacteriophage',
    })
  })

  it('hides tier-gated exhibits entirely while the renderer is available', () => {
    useNarrativeStore.setState({ activeChapter: 'origins' })
    useSceneInteractionStore.setState({ availableExhibits: ['dna-alt'], rendererAvailable: true })
    render(<ModelInteractionControls chapter={getChapterEntry('interests')} />)

    expect(
      screen.queryByRole('group', { name: 'Bacteriophage model controls' }),
    ).not.toBeInTheDocument()
  })

  it('keeps controls disabled without status churn while the chapter is adjacent', () => {
    useNarrativeStore.setState({ activeChapter: 'origins' })
    useSceneInteractionStore.setState({
      availableExhibits: ['bacteriophage'],
      rendererAvailable: true,
    })
    render(<ModelInteractionControls chapter={getChapterEntry('interests')} />)

    expect(screen.getByRole('button', { name: 'Rotate model left' })).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('explains the fallback while no renderer is available', () => {
    useNarrativeStore.setState({ activeChapter: 'interests' })
    useSceneInteractionStore.setState({
      availableExhibits: ['bacteriophage'],
      rendererAvailable: false,
    })
    render(<ModelInteractionControls chapter={getChapterEntry('interests')} />)

    expect(screen.getByRole('button', { name: 'Rotate model left' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'interests content remains fully available',
    )
  })

  it('provides the same discoverable DOM control contract for every active exhibit', () => {
    useSceneInteractionStore.setState({ availableExhibits: ['dna', 'bacteriophage'] })
    render(
      <>
        {chapterRegistry.map((chapter) => (
          <ModelInteractionControls key={chapter.id} chapter={chapter} />
        ))}
      </>,
    )

    expect(screen.getByRole('group', { name: 'DNA model controls' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Bacteriophage model controls' })).toBeInTheDocument()
  })
})
