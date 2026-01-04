'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ProtectedComponent requireAuth role="owner">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Owner Dashboard</h1>
            <p className="text-gray-400">Business overview, team management, and financial insights</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-600 overflow-x-auto">
            {['overview', 'team', 'financials', 'business', 'settings'].map(tab => (
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
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-white text-3xl font-bold mt-2">$125.4K</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Active Team Members</p>
                <p className="text-white text-3xl font-bold mt-2">12</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Total Clients</p>
                <p className="text-white text-3xl font-bold mt-2">342</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Growth (YoY)</p>
                <p className="text-green-400 text-3xl font-bold mt-2">+24%</p>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Team Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Add Team Member
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  View Team
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage Roles & Permissions
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Team Performance
                </button>
              </div>
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Financial Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Revenue Dashboard
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Expense Tracking
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Invoicing
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Financial Reports
                </button>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Business Operations</h2>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Business Metrics
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Market Analysis
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Strategic Planning
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Growth Opportunities
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Business Settings</h2>
              <div className="space-y-3">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Company Information
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Billing & Subscription
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Integration Settings
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Security & Compliance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedComponent>
  )
}
