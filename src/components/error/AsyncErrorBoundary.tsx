'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import logger from '@/lib/logger'

interface Props {
  children: ReactNode
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  prevResetKeys?: Array<string | number>
}

export class AsyncErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    prevResetKeys: this.props.resetKeys
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public static getDerivedStateFromProps(props: Props, state: State): State | null {
    const { resetKeys, resetOnPropsChange } = props
    const { prevResetKeys } = state

    if (resetKeys && prevResetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => key !== prevResetKeys[idx]
      )

      if (hasResetKeyChanged || resetOnPropsChange) {
        return {
          hasError: false,
          error: null,
          prevResetKeys: resetKeys
        }
      }
    }

    return null
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('AsyncErrorBoundary caught error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isolate: this.props.isolate
    })
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  public render() {
    const { hasError, error } = this.state
    const { children, fallback, isolate } = this.props

    if (hasError && error) {
      if (fallback) {
        return <>{fallback(error, this.reset)}</>
      }

      if (isolate) {
        return (
          <Alert variant="destructive" className="m-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro no componente</AlertTitle>
            <AlertDescription>
              Este componente encontrou um erro. 
              <button
                onClick={this.reset}
                className="ml-2 underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </AlertDescription>
          </Alert>
        )
      }

      throw error
    }

    return children
  }
}

export default AsyncErrorBoundary