'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ProtectedComponent requireAuth role="client">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Client Dashboard</h1>
            <p className="text-gray-400">Access your services, track progress, and manage your account</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-600 overflow-x-auto">
            {['overview', 'services', 'sessions', 'progress', 'account'].map(tab => (
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
                <p className="text-gray-400 text-sm">Active Services</p>
                <p className="text-white text-3xl font-bold mt-2">3</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Next Session</p>
                <p className="text-white text-3xl font-bold mt-2">2 days</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Progress</p>
                <p className="text-white text-3xl font-bold mt-2">65%</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Account Status</p>
                <p className="text-green-400 text-3xl font-bold mt-2">Active</p>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Your Services</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Browse Services
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  View Active Services
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Service Details
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Upgrade Service
                </button>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Session Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Book Session
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  View Upcoming Sessions
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Session History
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Reschedule Session
                </button>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Your Progress</h2>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  View Progress Report
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Track Goals
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Milestones
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Feedback
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
              <div className="space-y-3">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Profile Settings
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Billing Information
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Payment Methods
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedComponent>
  )
}
