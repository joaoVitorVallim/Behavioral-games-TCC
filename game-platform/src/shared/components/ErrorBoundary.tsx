import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorScreen } from './ErrorScreen'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  has_error: boolean
}

/**
 * Root render-error fallback — previously there was none anywhere in the app,
 * so an uncaught render error produced a blank white screen with no feedback.
 * React error boundaries must be class components (no hook equivalent exists).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { has_error: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { has_error: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.has_error) {
      return this.props.children
    }

    return (
      <ErrorScreen
        title="Algo deu errado"
        message="Ocorreu um erro inesperado na aplicação. Tente recarregar a página."
        action_label="Recarregar página"
        onAction={() => window.location.reload()}
      />
    )
  }
}
