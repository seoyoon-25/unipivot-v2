'use client'

import * as Sentry from '@sentry/nextjs'
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback

      if (CustomFallback && this.state.error) {
        return <CustomFallback error={this.state.error} />
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-800 font-medium">컴포넌트 로딩 중 오류 발생</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
      <h2 className="text-red-800 font-medium mb-2">페이지 로딩 중 오류가 발생했습니다</h2>
      {process.env.NODE_ENV === 'development' && (
        <details className="text-left mt-3 text-sm text-red-700">
          <summary className="cursor-pointer">상세 오류 정보</summary>
          <code className="block mt-2 p-2 bg-red-100 rounded whitespace-pre-wrap text-xs">
            {error.toString()}
          </code>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        페이지 새로고침
      </button>
    </div>
  )
}
