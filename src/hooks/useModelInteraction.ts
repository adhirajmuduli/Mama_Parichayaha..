'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

import {
  advanceModelInertia,
  beginModelInteraction,
  createModelInteractionState,
  moveModelInteraction,
  releaseModelInteraction,
  resetModelInteraction,
} from '@/lib/modelInteraction'
import type { Chapter } from '@/lib/chapters'
import { chapterHasExhibit } from '@/lib/chapterSelectors'
import type { ExhibitId } from '@/lib/chapterRegistry'
import { useNarrativeStore } from '@/stores/narrativeStore'
import { useSceneInteractionStore } from '@/stores/sceneInteractionStore'

interface ModelInteractionOptions {
  autoRotateSpeed?: number
  chapter: Chapter
  exhibitId: ExhibitId
  groupRef: RefObject<THREE.Group | null>
  initialRotation: readonly [number, number, number]
}

type R3FPointerEvent = ThreeEvent<PointerEvent>

type CapturableEventTarget = EventTarget & {
  releasePointerCapture?: (pointerId: number) => void
  setPointerCapture?: (pointerId: number) => void
}

function useReducedMotionPreference() {
  const reducedMotion = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      reducedMotion.current = mediaQuery.matches
    }

    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

export default function useModelInteraction({
  autoRotateSpeed = 0,
  chapter,
  exhibitId,
  groupRef,
  initialRotation,
}: ModelInteractionOptions) {
  const interaction = useRef(createModelInteractionState())
  const capturedTarget = useRef<CapturableEventTarget | null>(null)
  const reducedMotion = useReducedMotionPreference()

  const release = useCallback(() => {
    const pointerId = interaction.current.pointerId

    if (pointerId !== null) {
      capturedTarget.current?.releasePointerCapture?.(pointerId)
    }

    capturedTarget.current = null
    releaseModelInteraction(interaction.current)
  }, [])

  const reset = useCallback(() => {
    resetModelInteraction(interaction.current)
    capturedTarget.current = null

    if (groupRef.current) {
      groupRef.current.rotation.set(...initialRotation)
    }
  }, [groupRef, initialRotation])

  useEffect(() => {
    const releaseOnVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        release()
      }
    }

    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', releaseOnVisibilityChange)
    return () => {
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', releaseOnVisibilityChange)
      release()
    }
  }, [groupRef, release])

  useEffect(() => {
    return useSceneInteractionStore.subscribe((state, previousState) => {
      if (state.request === previousState.request || state.request?.exhibitId !== exhibitId) {
        return
      }

      if (!groupRef.current) {
        return
      }

      switch (state.request.command) {
        case 'rotate-left':
          groupRef.current.rotation.y -= 0.22
          break
        case 'rotate-right':
          groupRef.current.rotation.y += 0.22
          break
        case 'reset':
          reset()
          break
        case 'exit':
          release()
          break
      }
    })
  }, [exhibitId, groupRef, release, reset])

  useFrame((_, delta) => {
    if (!groupRef.current || interaction.current.mode === 'dragging') {
      return
    }

    if (reducedMotion.current) {
      resetModelInteraction(interaction.current)
      return
    }

    const inertia = advanceModelInertia(interaction.current, delta)
    groupRef.current.rotation.x = THREE.MathUtils.clamp(
      groupRef.current.rotation.x + inertia.x,
      initialRotation[0] - 0.75,
      initialRotation[0] + 0.75,
    )
    groupRef.current.rotation.y += inertia.y + autoRotateSpeed * delta
  })

  const isInteractable = () => {
    const activeChapter = useNarrativeStore.getState().activeChapter
    return activeChapter === chapter && chapterHasExhibit(activeChapter, exhibitId)
  }

  const capture = (event: R3FPointerEvent) => {
    const target = event.target as unknown as CapturableEventTarget
    target.setPointerCapture?.(event.pointerId)
    capturedTarget.current = target
  }

  const onPointerDown = (event: R3FPointerEvent) => {
    if (!isInteractable() || (event.pointerType !== 'touch' && event.button !== 0)) {
      return
    }

    const mode = beginModelInteraction(interaction.current, event)

    if (mode === 'dragging') {
      event.stopPropagation()
      capture(event)
    }
  }

  const onPointerMove = (event: R3FPointerEvent) => {
    const previousMode = interaction.current.mode
    const delta = moveModelInteraction(interaction.current, event)

    if (!delta || !groupRef.current) {
      return
    }

    if (previousMode !== 'dragging' && interaction.current.mode === 'dragging') {
      event.stopPropagation()
      capture(event)
    }

    groupRef.current.rotation.x = THREE.MathUtils.clamp(
      groupRef.current.rotation.x + delta.x,
      initialRotation[0] - 0.75,
      initialRotation[0] + 0.75,
    )
    groupRef.current.rotation.y += delta.y
  }

  const onPointerUp = (event: R3FPointerEvent) => {
    if (interaction.current.pointerId === event.pointerId) {
      release()
    }
  }

  return {
    onLostPointerCapture: release,
    onPointerCancel: onPointerUp,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
