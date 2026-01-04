'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import { AuthenticatedAIManager } from '@enterprise/platform/ai'

export default function NLPPage() {
  const { user, isAuthenticated } = useAuth()
  const [manager] = useState(() => new AuthenticatedAIManager())
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    if (!input.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
      const authContext = {
        userId: user.id,
        role: user.role || 'user',
        authLevel: (user.role === 'admin' ? 'admin' : 'authenticated') as any,
        permissions: ['nlp:read', 'nlp:write'],
        scopes: ['read', 'write'],
        timestamp: new Date()
      }

      const response = await manager.processComponentRequest(
        'nlp-engine',
        user.id,
        authContext,
        input
      )

      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || 'Processing failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedComponent requireAuth permission={{ resource: 'nlp', action: 'read' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">NLP Engine</h1>
            <p className="text-gray-400">Natural Language Processing with Transformers.js</p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
            <label className="block text-white font-semibold mb-3">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text for NLP analysis..."
              className="w-full h-32 bg-slate-800 text-white border border-slate-600 rounded p-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleProcess}
              disabled={loading || !input.trim()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Analyze'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Sentiment Analysis */}
              {result.data?.result?.sentiment && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Sentiment Analysis</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Label</p>
                      <p className="text-white text-lg font-semibold capitalize">
                        {result.data.result.sentiment.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Score</p>
                      <p className="text-white text-lg font-semibold">
                        {(result.data.result.sentiment.score * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Intent Detection */}
              {result.data?.result?.intent && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Intent Detection</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Intent</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.intent.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                      <p className="text-white text-lg font-semibold">
                        {(result.data.result.intent.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Entity Extraction */}
              {result.data?.result?.entities && result.data.result.entities.length > 0 && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Entities Extracted</h2>
                  <div className="space-y-2">
                    {result.data.result.entities.map((entity: any, idx: number) => (
                      <div key={idx} className="bg-slate-600 p-3 rounded">
                        <p className="text-gray-300 text-sm">
                          <span className="font-semibold">{entity.word}</span>
                          <span className="text-gray-400 ml-2">({entity.entity_group})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {result.reasoning && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Processing Reasoning</h2>
                  <p className="text-gray-300">{result.reasoning}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <h2 className="text-xl font-bold text-white mb-4">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Confidence</p>
                    <p className="text-white font-semibold">
                      {(result.confidence ? result.confidence * 100 : 0).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Processing Time</p>
                    <p className="text-white font-semibold">
                      {result.data?.processingTime || 0}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedComponent>
  )
}
