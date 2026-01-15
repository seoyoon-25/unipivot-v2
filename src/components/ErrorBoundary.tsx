'use client'

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
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback

      if (CustomFallback && this.state.error) {
        return <CustomFallback error={this.state.error} />
      }

      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          color: '#c00',
          border: '1px solid #c00',
          borderRadius: '5px',
          margin: '20px'
        }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#c00',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fee',
      color: '#c00',
      border: '1px solid #c00',
      borderRadius: '5px',
      margin: '20px'
    }}>
      <h2>페이지 로딩 중 오류가 발생했습니다</h2>
      <p>다음 오류가 발생했습니다:</p>
      <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
        <summary>상세 오류 정보</summary>
        <code>{error.toString()}</code>
      </details>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#c00',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        페이지 새로고침
      </button>
    </div>
  )
}