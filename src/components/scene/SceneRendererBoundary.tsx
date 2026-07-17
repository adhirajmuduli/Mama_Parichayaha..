'use client'

import { Component, type ReactNode } from 'react'

interface SceneRendererBoundaryProps {
  children: ReactNode
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

  override render() {
    return this.state.hasError ? null : this.props.children
  }
}
