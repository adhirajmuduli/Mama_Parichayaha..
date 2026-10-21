'use client'

/**
 * AnimationControls (new_plan.md §7.5) — the exhibit control group.
 *
 * Contract (fixed; P7's e2e rebuild pins it):
 *   - group: role="group", aria-label "<label> animation controls",
 *   - buttons: real <button> "Play/Pause animation" toggle + "Restart animation",
 *   - status: role="status" explaining availability — the unavailable copy
 *     keeps the legacy "<chapter> content remains fully available" shape.
 *
 * Single-path state: buttons ONLY dispatch store commands; the panel's
 * command handlers own playback-state changes. Two writers on the same state
 * is how double-toggle bugs are born (caught in review before it shipped).
 */

import type { ClientExhibit, ExhibitPlayback } from '@/types/experience'
import { useExhibitsStore } from '@/runtime/stores/exhibits'

export interface AnimationControlsProps {
  exhibit: ClientExhibit
  chapterId: string
  playback: ExhibitPlayback
}

export function AnimationControls({ exhibit, chapterId, playback }: AnimationControlsProps) {
  const availability = useExhibitsStore((state) => state.availability[exhibit.id] ?? 'placeholder')
  const dispatchCommand = useExhibitsStore((state) => state.dispatchCommand)

  const unavailable =
    playback === 'static' || playback === 'idle' || availability === 'error'

  const playing = playback === 'playing'

  return (
    <div
      className="ascii-controls"
      role="group"
      aria-label={`${exhibit.label} animation controls`}
      data-animation-controls=""
      data-playback={playback}
    >
      <div className="ascii-controls__buttons">
        <button
          type="button"
          className="ascii-controls__button"
          disabled={unavailable}
          aria-pressed={playing}
          onClick={() => {
            dispatchCommand(exhibit.id, 'toggle')
          }}
        >
          {playing ? 'Pause animation' : 'Play animation'}
        </button>

        <button
          type="button"
          className="ascii-controls__button"
          disabled={unavailable}
          onClick={() => {
            dispatchCommand(exhibit.id, 'restart')
          }}
        >
          Restart animation
        </button>
      </div>

      <p className="ascii-controls__status" role="status">
        {unavailable
          ? `Animation controls are unavailable; ${chapterId} content remains fully available.`
          : playing
            ? 'Animation playing.'
            : 'Animation paused.'}
      </p>
    </div>
  )
}
