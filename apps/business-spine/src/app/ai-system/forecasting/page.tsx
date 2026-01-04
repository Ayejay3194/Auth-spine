'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import { AuthenticatedAIManager } from '@enterprise/platform/ai'

export default function ForecastingPage() {
  const { user, isAuthenticated } = useAuth()
  const [manager] = useState(() => new AuthenticatedAIManager())
  const [timeSeries, setTimeSeries] = useState('100,102,105,103,108,110,112,115,113,118')
  const [horizon, setHorizon] = useState('5')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleForecast = async () => {
    if (!timeSeries.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
      const data = timeSeries.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
      const h = parseInt(horizon) || 5

      if (data.length < 4) {
        setError('Time series must have at least 4 data points')
        setLoading(false)
        return
      }

      const authContext = {
        userId: user.id,
        role: user.role || 'user',
        authLevel: (user.role === 'admin' ? 'admin' : 'authenticated') as any,
        permissions: ['forecasting:read', 'forecasting:write'],
        scopes: ['read', 'write'],
        timestamp: new Date()
      }

      const response = await manager.processComponentRequest(
        'forecasting-engine',
        user.id,
        authContext,
        { timeSeries: data, horizon: h }
      )

      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error || 'Forecasting failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedComponent requireAuth permission={{ resource: 'forecasting', action: 'read' }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Forecasting Engine</h1>
            <p className="text-gray-400">Ensemble time series forecasting with trend detection</p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
            <div className="mb-4">
              <label className="block text-white font-semibold mb-3">Time Series Data</label>
              <textarea
                value={timeSeries}
                onChange={(e) => setTimeSeries(e.target.value)}
                placeholder="Enter comma-separated values (e.g., 100,102,105,103,108)"
                className="w-full h-24 bg-slate-800 text-white border border-slate-600 rounded p-4 focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-gray-400 text-xs mt-2">Enter at least 4 data points separated by commas</p>
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-3">Forecast Horizon</label>
              <input
                type="number"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                min="1"
                max="50"
                className="w-full bg-slate-800 text-white border border-slate-600 rounded p-3 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-gray-400 text-xs mt-2">Number of future periods to forecast (1-50)</p>
            </div>

            <button
              onClick={handleForecast}
              disabled={loading || !timeSeries.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded font-semibold transition-colors"
            >
              {loading ? 'Forecasting...' : 'Generate Forecast'}
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
              {/* Forecast Results */}
              {result.data?.result?.predictions && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Forecast Predictions</h2>
                  <div className="bg-slate-800 p-4 rounded overflow-x-auto">
                    <div className="flex gap-2">
                      {result.data.result.predictions.map((pred: number, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold">
                            {pred.toFixed(2)}
                          </div>
                          <p className="text-gray-400 text-xs mt-1">+{idx + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trend Analysis */}
              {result.data?.result?.trend && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Trend Analysis</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Trend Direction</p>
                      <p className="text-white text-lg font-semibold capitalize">
                        {result.data.result.trend}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Seasonality</p>
                      <p className="text-white text-lg font-semibold">
                        {(result.data.result.seasonality * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                      <p className="text-white text-lg font-semibold">
                        {(result.data.result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Metrics */}
              {result.data?.result?.rmse !== undefined && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">Accuracy Metrics</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">RMSE</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.rmse.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">MAE</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.mae.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">MAPE</p>
                      <p className="text-white text-lg font-semibold">
                        {result.data.result.mape.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Intervals */}
              {result.data?.result?.confidenceInterval && (
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">95% Confidence Intervals</h2>
                  <div className="space-y-2">
                    {result.data.result.confidenceInterval.map((interval: [number, number], idx: number) => (
                      <div key={idx} className="bg-slate-600 p-3 rounded">
                        <p className="text-gray-300 text-sm">
                          <span className="font-semibold">Period +{idx + 1}:</span>
                          <span className="ml-2">[{interval[0].toFixed(2)}, {interval[1].toFixed(2)}]</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <h2 className="text-xl font-bold text-white mb-4">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Method</p>
                    <p className="text-white font-semibold">
                      {result.data?.result?.method || 'Ensemble'}
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
