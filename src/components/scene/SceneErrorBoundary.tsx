"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  name: string
}

interface State {
  hasError: boolean
}

export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Unable to render ${this.props.name} exhibit.`, error, errorInfo)
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}