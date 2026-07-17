'use client'

import { useEffect } from 'react'

const pointerSelector = '[data-liquid-glass="true"][data-glass-interactive="true"]'

export default function LiquidGlassPointerTracker() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let listening = false

    const updatePointer = (event: PointerEvent) => {
      const target = event.target
      const surface =
        target instanceof Element ? target.closest<HTMLElement>(pointerSelector) : null

      if (!surface) {
        return
      }

      const bounds = surface.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) {
        return
      }

      const x = ((event.clientX - bounds.left) / bounds.width) * 100
      const y = ((event.clientY - bounds.top) / bounds.height) * 100

      surface.style.setProperty('--glass-pointer-x', `${Math.min(100, Math.max(0, x))}%`)
      surface.style.setProperty('--glass-pointer-y', `${Math.min(100, Math.max(0, y))}%`)
    }

    const syncTracking = () => {
      const shouldTrack = finePointer.matches && !reducedMotion.matches

      if (shouldTrack === listening) {
        return
      }

      listening = shouldTrack

      if (shouldTrack) {
        window.addEventListener('pointermove', updatePointer, { passive: true })
      } else {
        window.removeEventListener('pointermove', updatePointer)
      }
    }

    finePointer.addEventListener('change', syncTracking)
    reducedMotion.addEventListener('change', syncTracking)
    syncTracking()

    return () => {
      finePointer.removeEventListener('change', syncTracking)
      reducedMotion.removeEventListener('change', syncTracking)

      if (listening) {
        window.removeEventListener('pointermove', updatePointer)
      }
    }
  }, [])

  return null
}
