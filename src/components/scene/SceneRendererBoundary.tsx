'use client'

import { Component, type ReactNode } from 'react'

interface SceneRendererBoundaryProps {
  children: ReactNode
  onError?: () => void
}

interface SceneRendererBoundaryState {
  hasError: boolean
}

export default class SceneRendererBoundary extends Component<
  SceneRendererBoundaryProps,
  SceneRendererBoundaryState
> {
  override state: SceneRendererBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneRendererBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch() {
    this.props.onError?.()
  }

  override render() {
    return this.state.hasError ? null : this.props.children
  }
}
