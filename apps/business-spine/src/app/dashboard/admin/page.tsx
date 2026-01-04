'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ProtectedComponent requireAuth role="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage users, permissions, and system resources</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-600">
            {['overview', 'users', 'permissions', 'resources', 'reports'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold transition-colors ${
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
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-white text-3xl font-bold mt-2">1,234</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Active Sessions</p>
                <p className="text-white text-3xl font-bold mt-2">456</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">Pending Approvals</p>
                <p className="text-white text-3xl font-bold mt-2">23</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                <p className="text-gray-400 text-sm">System Status</p>
                <p className="text-green-400 text-3xl font-bold mt-2">Healthy</p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Add New User
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  View All Users
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage Roles
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                  Deactivate Users
                </button>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Permission Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  View Permission Matrix
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Create Custom Role
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage Scopes
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition-colors">
                  Audit Permissions
                </button>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Resource Management</h2>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Manage AI Components
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Database Management
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  API Keys
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors">
                  Storage Management
                </button>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">Reports & Analytics</h2>
              <div className="space-y-3">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  User Activity Report
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  System Performance
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Security Audit
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition-colors">
                  Compliance Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedComponent>
  )
}
