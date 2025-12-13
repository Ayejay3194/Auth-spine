'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class BusinessSpineErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Business Spine Error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Business Spine Error
            </h2>
            
            <p className="text-gray-600 text-center mb-4">
              Failed to initialize the Business Spine service. This is required for the application to function properly.
            </p>
            
            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-red-700 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.resetError}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function BusinessSpineInitializationGuard({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkBusinessSpineHealth = async () => {
      try {
        const spineUrl = process.env.NEXT_PUBLIC_BUSINESS_SPINE_URL
        if (!spineUrl) {
          throw new Error('Business Spine URL not configured')
        }

        const response = await fetch(`${spineUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Business Spine health check failed: ${response.status}`)
        }

        setIsReady(true)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error('Business Spine health check failed:', error)
        setError(error)
      }
    }

    if (process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED !== 'false') {
      checkBusinessSpineHealth()
    } else {
      setIsReady(true)
    }
  }, [])

  if (error && process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED !== 'false') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Service Unavailable
          </h2>
          
          <p className="text-gray-600 text-center mb-4">
            The Business Spine service is currently unavailable. Please try again in a moment.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isReady && process.env.NEXT_PUBLIC_BUSINESS_SPINE_ENABLED !== 'false') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Initializing Business Spine
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your services...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
