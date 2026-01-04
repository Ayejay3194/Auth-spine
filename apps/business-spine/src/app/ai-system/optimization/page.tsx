'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import { AuthenticatedAIManager } from '@enterprise/platform/ai'

export default function OptimizationPage() {
  const { user, isAuthenticated } = useAuth()
  const [manager] = useState(() => new AuthenticatedAIManager())
  const [basePrice, setBasePrice] = useState('100')
  const [demandLevel, setDemandLevel] = useState('0.5')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    if (!basePrice || !user) return

    setLoading(true)
    setError(null)

    try {
      const authContext = {
        userId: user.id,
        role: user.role || 'user',
        authLevel: (user.role === 'admin' ? 'admin' : 'authenticated') as any,
        permissions: ['optimization:read', 'optimization:write', 'pricing:write'],
        scopes: ['read', 'write'],
        timestamp: new Date()
      }

      const response = await manager.processComponentRequest(
        'optimization-engine',
        user.id,
        authContext,
        {
          basePrice: parseFloat(basePrice),
          demandLevel: parseFloat(demandLevel),
          marketData: {
            competitorPrices: [95, 105, 110],
            seasonalFactor: 1.1,
            elasticity: 1.2
          }
        }
      )

      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || 'Optimization failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedComponent requireAuth permission={{ resource: 'optimization', action: 'write' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Optimization Engine</h1>
            <p className="text-gray-400">Dynamic pricing and scheduling optimization</p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white font-semibold mb-3">Base Price ($)</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Demand Level (0-1)</label>
                <input
                  type="number"
                  value={demandLevel}
                  onChange={(e) => setDemandLevel(e.target.value)}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading || !basePrice}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded font-semibold transition-colors"
            >
              {loading ? 'Optimizing...' : 'Optimize Pricing'}
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
              {/* Pricing Comparison */}
              {result.data?.result?.basePrice !== undefined && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Pricing Optimization</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Base Price</p>
                      <p className="text-white text-2xl font-bold">
                        ${result.data.result.basePrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Optimized Price</p>
                      <p className="text-green-400 text-2xl font-bold">
                        ${result.data.result.optimizedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Change</p>
                      <p className={`text-2xl font-bold ${
                        result.data.result.optimizedPrice >= result.data.result.basePrice
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {((result.data.result.optimizedPrice - result.data.result.basePrice) / result.data.result.basePrice * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Adjustment Factors */}
              {result.data?.result?.adjustmentFactors && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Adjustment Factors</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-gray-400 text-sm">Demand Multiplier</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.adjustmentFactors.demand.toFixed(3)}x
                      </p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-gray-400 text-sm">Competitive Adjustment</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.adjustmentFactors.competitive.toFixed(3)}x
                      </p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-gray-400 text-sm">Seasonal Adjustment</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.adjustmentFactors.seasonal.toFixed(3)}x
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Impact */}
              {result.data?.result?.expectedRevenue !== undefined && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Revenue Impact</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Expected Revenue</p>
                      <p className="text-white text-2xl font-bold">
                        ${result.data.result.expectedRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                      <p className="text-white text-2xl font-bold">
                        {(result.data.result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <h2 className="text-xl font-bold text-white mb-4">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Processing Time</p>
                    <p className="text-white font-semibold">
                      {result.data?.processingTime || 0}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Auth Level</p>
                    <p className="text-white font-semibold capitalize">
                      {result.authLevel || 'N/A'}
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
