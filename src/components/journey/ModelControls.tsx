'use client'

import { getSceneAsset, resolveRuntimeExhibitId } from '@/content/assets'
import type { ChapterId } from '@/content/portfolio'
import { getChapterEntry } from '@/lib/chapterRegistry'
import { useNarrativeStore } from '@/stores/narrativeStore'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

export default function ModelControls({ chapterId }: { chapterId: ChapterId }) {
  const renderer = useSceneInteractionStore((state) => state.rendererAvailable)
  const available = useSceneInteractionStore((state) => state.availableExhibits)
  const activeChapter = useNarrativeStore((state) => state.activeChapter)
  const exhibit = getChapterEntry(chapterId).scene.exhibits[0]
  if (!exhibit) return null
  const exhibitId = resolveRuntimeExhibitId(exhibit.id)
  const asset = getSceneAsset(exhibitId)
  const label =
    chapterId === 'origins'
      ? 'DNA'
      : chapterId === 'interests'
        ? 'Bacteriophage'
        : asset.kind === 'unassigned'
          ? exhibitId
          : asset.credit.title
  const enabled = renderer && available.includes(exhibitId) && activeChapter === chapterId
  const dispatch = useSceneInteractionStore.getState().dispatch

  return (
    <div
      role="group"
      aria-label={`${label} model controls`}
      data-model-controls
      tabIndex={enabled ? 0 : -1}
      className="mt-6 rounded-lg border border-white/20 p-3 focus-visible:outline-2"
      onKeyDown={(event) => {
        const command = {
          ArrowLeft: 'rotate-left',
          ArrowRight: 'rotate-right',
          Home: 'reset',
          Escape: 'exit',
        } as const
        const action = command[event.key as keyof typeof command]
        if (!action) return
        event.stopPropagation()
        if (!enabled) return
        event.preventDefault()
        dispatch(exhibitId, action)
      }}
    >
      <div className="flex flex-wrap gap-3">
        {(['rotate-left', 'rotate-right', 'reset'] as const).map((command) => (
          <button
            key={command}
            type="button"
            disabled={!enabled}
            className="rounded border border-white/30 px-3 py-2 text-sm disabled:opacity-60"
            onClick={() => dispatch(exhibitId, command)}
          >
            {command === 'reset'
              ? 'Reset model'
              : command === 'rotate-left'
                ? 'Rotate model left'
                : 'Rotate model right'}
          </button>
        ))}
      </div>
      <p role="status" className="mt-2 text-sm text-[var(--site-muted)]">
        {enabled
          ? 'Drag the model, or use Left/Right arrows and Home to reset.'
          : `3D controls are unavailable; ${chapterId} content remains fully available.`}
      </p>
    </div>
  )
}
