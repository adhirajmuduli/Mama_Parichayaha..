'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  name: string
}

interface State {
  hasError: boolean
}

export default class SceneErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override render() {
    return this.state.hasError ? null : this.props.children
  }
}
