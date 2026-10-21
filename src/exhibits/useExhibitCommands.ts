'use client'

/**
 * Command consumption bridge (new_plan.md §7.4) — translates store commands
 * dispatched by AnimationControls into player callbacks, with sequence
 * dedupe so a replayed command never double-toggles.
 */

import { useEffect, useRef } from 'react'

import { useExhibitsStore, type ExhibitCommand } from '@/runtime/stores/exhibits'

export interface ExhibitCommandHandlers {
  onToggle(): void
  onRestart(): void
}

export function useExhibitCommands(exhibitId: string, handlers: ExhibitCommandHandlers): void {
  const command = useExhibitsStore((state) => state.command)
  const consumeCommand = useExhibitsStore((state) => state.consumeCommand)
  const lastSequenceRef = useRef(0)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!command || command.exhibitId !== exhibitId) return
    if (command.sequence <= lastSequenceRef.current) return

    lastSequenceRef.current = command.sequence
    consumeCommand()

    if (command.kind === 'toggle') {
      handlersRef.current.onToggle()
    } else if (command.kind === 'restart') {
      handlersRef.current.onRestart()
    }
  }, [command, consumeCommand, exhibitId])
}

export type { ExhibitCommand }
