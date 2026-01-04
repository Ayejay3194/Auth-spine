'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function SystemDashboard() {
  const { user, hasRole } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 100,
    securityScore: 98,
    apiUptime: 99.9,
    dataIntegrity: 100
  })

  useEffect(() => {
    // Fetch system metrics
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/system/metrics')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch system metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <ProtectedComponent requireAuth role="system">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
            <p className="text-gray-400">Complete system oversight and control</p>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-gray-400 text-sm">System Health</p>
              <p className="text-white text-3xl font-bold mt-2">{stats.systemHealth}%</p>
              <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-gray-400 text-sm">Security Score</p>
              <p className="text-white text-3xl font-bold mt-2">{stats.securityScore}%</p>
              <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.securityScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-gray-400 text-sm">API Uptime</p>
              <p className="text-white text-3xl font-bold mt-2">{stats.apiUptime}%</p>
              <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${stats.apiUptime}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* System Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">System Configuration</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage Users & Roles
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  System Settings
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Security Policies
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Audit Logs
                </button>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">System Monitoring</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  View Metrics
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Performance Analysis
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  System Alerts
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Backup & Recovery
                </button>
              </div>
            </div>
          </div>

          {/* AI System Management */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">AI System Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="bg-slate-600 hover:bg-slate-500 text-white py-3 rounded font-semibold transition-colors">
                AI Components
              </button>
              <button className="bg-slate-600 hover:bg-slate-500 text-white py-3 rounded font-semibold transition-colors">
                Model Management
              </button>
              <button className="bg-slate-600 hover:bg-slate-500 text-white py-3 rounded font-semibold transition-colors">
                LLM Configuration
              </button>
              <button className="bg-slate-600 hover:bg-slate-500 text-white py-3 rounded font-semibold transition-colors">
                Teacher Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedComponent>
  )
}
