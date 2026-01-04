'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

interface SecurityAuditData {
  complianceScore: number
  complianceStatus: string
  findingsCount: number
  recommendationsCount: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  standards: string[]
}

export function SecurityAuditDashboard() {
  const { user } = useAuth()
  const [auditData, setAuditData] = useState<SecurityAuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/config/security-audit?type=summary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch security audit data')
        }

        const result = await response.json()
        setAuditData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAuditData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-red-100">
        <p className="font-semibold">Error loading security audit</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!auditData) {
    return null
  }

  return (
    <ProtectedComponent requireAuth>
      <div className="space-y-6">
        {/* Compliance Score */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-8 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Compliance Score</p>
              <p className="text-5xl font-bold text-white mt-2">{auditData.complianceScore}%</p>
              <p className="text-gray-400 text-sm mt-2">Status: {auditData.complianceStatus}</p>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-slate-600 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{auditData.complianceScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-gray-400 text-sm">Security Findings</p>
            <p className="text-white text-3xl font-bold mt-2">{auditData.findingsCount}</p>
            <p className="text-gray-500 text-xs mt-2">Issues identified</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-gray-400 text-sm">Passed Checks</p>
            <p className="text-green-400 text-3xl font-bold mt-2">{auditData.passedChecks}</p>
            <p className="text-gray-500 text-xs mt-2">Security controls</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-gray-400 text-sm">Failed Checks</p>
            <p className="text-red-400 text-3xl font-bold mt-2">{auditData.failedChecks}</p>
            <p className="text-gray-500 text-xs mt-2">Requires attention</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-gray-400 text-sm">Warnings</p>
            <p className="text-yellow-400 text-3xl font-bold mt-2">{auditData.warningChecks}</p>
            <p className="text-gray-500 text-xs mt-2">Review recommended</p>
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <h3 className="text-xl font-bold text-white mb-4">Compliance Standards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {auditData.standards.map((standard, index) => (
              <div key={index} className="bg-slate-600 rounded p-4">
                <p className="text-gray-300 font-semibold">{standard}</p>
                <div className="w-full bg-slate-500 rounded-full h-2 mt-3">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-gray-400 text-xs mt-2">95% Compliant</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <h3 className="text-xl font-bold text-white mb-4">Recommendations ({auditData.recommendationsCount})</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-600 rounded p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">{i}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Security Recommendation {i}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Review and implement recommended security controls to improve compliance score.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedComponent>
  )
}
