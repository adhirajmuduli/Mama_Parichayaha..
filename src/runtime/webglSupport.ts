'use client'

/**
 * One-shot WebGL capability probe (new_plan.md §7.6, relocated to runtime
 * with the scene layer's removal). Cached per session; the context is
 * released immediately so the probe never leaks GPU state.
 */

let cached: boolean | null = null

export function supportsWebGL(): boolean {
  if (cached !== null) return cached

  if (typeof document === 'undefined') {
    // SSR/prerender: report unsupported; client code re-evaluates after
    // hydration (callers gate rendering, never behavior).
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')

    if (!context) {
      cached = false
      return false
    }

    cached = true

    const loseContext = (
      context as WebGLRenderingContext & {
        getExtension?: (name: string) => { loseContext?: () => void } | null
      }
    ).getExtension?.('WEBGL_lose_context')
    loseContext?.loseContext?.()

    return true
  } catch {
    cached = false
    return false
  }
}
