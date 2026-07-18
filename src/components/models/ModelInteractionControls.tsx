'use client'

import type { KeyboardEvent } from 'react'

import LiquidGlassControl from '@/components/liquid-glass/LiquidGlassControl'
import type { ChapterRegistryEntry, ExhibitId } from '@/lib/chapterRegistry'
import { useNarrativeStore } from '@/stores/narrativeStore'
import {
  useSceneInteractionStore,
  type SceneInteractionCommand,
} from '@/stores/sceneInteractionStore'

interface InteractiveExhibitDefinition {
  description: string
  exhibitId: ExhibitId
  label: string
}

const interactiveExhibits: Partial<
  Record<ChapterRegistryEntry['id'], InteractiveExhibitDefinition>
> = {
  origins: {
    exhibitId: 'dna',
    label: 'DNA model',
    description: 'A double-helical DNA exhibit with an available source animation.',
  },
  interests: {
    exhibitId: 'phages',
    label: 'Bacteriophage model',
    description:
      'A procedural bacteriophage study showing a capsid, tail, base plate, and tail-fibre form.',
  },
}

export default function ModelInteractionControls({ chapter }: { chapter: ChapterRegistryEntry }) {
  const definition = interactiveExhibits[chapter.id]
  const availableExhibits = useSceneInteractionStore((state) => state.availableExhibits)
  const rendererAvailable = useSceneInteractionStore((state) => state.rendererAvailable)
  const dispatch = useSceneInteractionStore((state) => state.dispatch)
  const activeChapter = useNarrativeStore((state) => state.activeChapter)

  if (!definition) {
    return null
  }

  const { description, exhibitId, label } = definition
  const isActive =
    rendererAvailable && availableExhibits.includes(exhibitId) && activeChapter === chapter.id
  const instructionId = `${chapter.sectionId}-model-instructions`
  const command = (nextCommand: SceneInteractionCommand) => {
    if (isActive) {
      dispatch(exhibitId, nextCommand)
    }
  }
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const commands: Partial<Record<string, SceneInteractionCommand>> = {
      ArrowLeft: 'rotate-left',
      ArrowRight: 'rotate-right',
      Escape: 'exit',
      Home: 'reset',
    }
    const nextCommand = commands[event.key]

    if (nextCommand) {
      event.preventDefault()
      command(nextCommand)
    }
  }

  return (
    <div
      role="group"
      aria-describedby={instructionId}
      aria-label={`${label} controls`}
      className="mt-6 border-t border-white/10 pt-4"
      data-model-interaction-controls={exhibitId}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <p className="text-sm text-[var(--site-muted)]">{description}</p>
      <p id={instructionId} className="mt-3 text-sm text-[var(--site-muted)]">
        Use the controls or Left and Right Arrow keys to rotate the {label.toLowerCase()}. Home
        resets its pose. Touch scrolling remains vertical by default; drag horizontally on the model
        to rotate it.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <LiquidGlassControl disabled={!isActive} onClick={() => command('rotate-left')}>
          Rotate model left
        </LiquidGlassControl>
        <LiquidGlassControl disabled={!isActive} onClick={() => command('rotate-right')}>
          Rotate model right
        </LiquidGlassControl>
        <LiquidGlassControl disabled={!isActive} onClick={() => command('reset')}>
          Reset model pose
        </LiquidGlassControl>
      </div>
      {!isActive ? (
        <p className="mt-3 text-sm text-[var(--site-muted)]" role="status">
          The interactive {label.toLowerCase()} is unavailable here; the{' '}
          {chapter.navigationLabel.toLowerCase()} content remains fully available.
        </p>
      ) : null}
    </div>
  )
}
