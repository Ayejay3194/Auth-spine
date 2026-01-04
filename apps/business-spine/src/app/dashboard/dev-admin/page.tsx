'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function DevAdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ProtectedComponent requireAuth role="dev-admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Developer Admin Dashboard</h1>
            <p className="text-gray-400">Manage APIs, integrations, and development resources</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-600 overflow-x-auto">
            {['overview', 'apis', 'integrations', 'logs', 'deployments'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">API Calls (24h)</p>
                <p className="text-white text-3xl font-bold mt-2">45.2K</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Error Rate</p>
                <p className="text-white text-3xl font-bold mt-2">0.12%</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Avg Response Time</p>
                <p className="text-white text-3xl font-bold mt-2">245ms</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Active Integrations</p>
                <p className="text-white text-3xl font-bold mt-2">28</p>
              </div>
            </div>
          )}

          {/* APIs Tab */}
          {activeTab === 'apis' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">API Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Create API Key
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  View API Documentation
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage Rate Limits
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  API Analytics
                </button>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Integration Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Add Integration
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  View Webhooks
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Test Integration
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Integration Logs
                </button>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">System Logs</h2>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  View API Logs
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Error Tracking
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Performance Logs
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Export Logs
                </button>
              </div>
            </div>
          )}

          {/* Deployments Tab */}
          {activeTab === 'deployments' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Deployment Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Deploy New Version
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  View Deployments
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Rollback Version
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Deployment History
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedComponent>
  )
}
