'use client'

import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/src/providers/AppContext'
import { usePageState } from '@/src/hooks/usePageState'
import { AuthenticatedAIManager, type AIComponent, type AuthContext } from '@/src/ai/AuthenticatedAIManager'
import { ROUTES } from '@/src/lib/routes'
import SmoothCard from '@/suites/ui/components/SmoothCard';
import SmoothButton from '@/suites/ui/components/SmoothButton';
import SmoothBadge from '@/suites/ui/components/SmoothBadge';

export default function AISystemPage() {
  const { user, ui, addNotification } = useAppContext()
  const [manager] = useState(() => new AuthenticatedAIManager())
  const [components, setComponents] = useState<AIComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [agentStatus, setAgentStatus] = useState<any>(null)

  // Load AI system data using usePageState
  const { data: systemData, loading, error, refetch } = usePageState(
    async () => {
      if (!user) return null

      // Set auth context for AI manager
      const authContext: AuthContext = {
        userId: user.id,
        role: user.role || 'user',
        authLevel: (user.role === 'admin' ? 'admin' : 
                   user.role === 'staff' ? 'staff' : 'authenticated') as any,
        permissions: getPermissionsForRole(user.role),
        scopes: ['read', 'write'],
        timestamp: new Date()
      }

      manager.setAuthContext(authContext)

      // Load available components
      const allComponents = manager.getAllComponents()
      const availableComponents = manager.getAvailableComponents(user.id, authContext)

      const componentList: AIComponent[] = allComponents.map(comp => ({
        ...comp,
        accessible: availableComponents.some(ac => ac.componentId === comp.componentId)
      }))

      return {
        components: componentList,
        agentStatus: manager.getAgentStatus()
      }
    },
    [user],
    {
      onError: (error) => {
        addNotification(`Failed to load AI system: ${error.message}`, 'error')
      }
    }
  )

  useEffect(() => {
    if (systemData) {
      setComponents(systemData.components)
      setAgentStatus(systemData.agentStatus)
    }
  }, [systemData])

  const getPermissionsForRole = (role?: string): string[] => {
    const permissions: Record<string, string[]> = {
      admin: [
        'nlp:read', 'nlp:write',
        'forecasting:read', 'forecasting:write',
        'optimization:read', 'optimization:write',
        'clustering:read', 'clustering:write',
        'reasoning:read', 'reasoning:write',
        'users:read', 'users:write',
        'pricing:read', 'pricing:write',
        'risk:read', 'anomalies:read',
        'recommendations:read'
      ],
      staff: [
        'nlp:read',
        'forecasting:read',
        'optimization:read',
        'clustering:read',
        'reasoning:read',
        'recommendations:read'
      ],
      user: [
        'nlp:read',
        'forecasting:read',
        'recommendations:read'
      ]
    }
    return permissions[role || 'user'] || permissions.user
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI System...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">Failed to load AI System</p>
          <button 
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">🔒</div>
          <p className="text-gray-600">Please sign in to access the AI System</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Unified AI System</h1>
          <p className="text-gray-400">Access advanced AI capabilities with authentication-based firewall isolation</p>
        </div>

        {/* Agent Status */}
        {agentStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <p className="text-gray-400 text-sm">Authentication Status</p>
              <p className="text-white text-lg font-semibold mt-1">
                {agentStatus.isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <p className="text-gray-400 text-sm">Auth Level</p>
              <p className="text-white text-lg font-semibold mt-1 capitalize">
                {agentStatus.authLevel || 'N/A'}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <p className="text-gray-400 text-sm">LLM Status</p>
              <p className="text-white text-lg font-semibold mt-1">
                {agentStatus.llmConfigured ? '✓ Configured' : '○ Not Configured'}
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <p className="text-gray-400 text-sm">Available Features</p>
              <p className="text-white text-lg font-semibold mt-1">{agentStatus.availableFeatures}</p>
            </div>
          </div>
        )}

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {components.map(component => (
            <div
              key={component.componentId}
              onClick={() => setSelectedComponent(component.componentId)}
              className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedComponent === component.componentId
                  ? 'border-blue-500 bg-slate-700'
                  : component.accessible
                  ? 'border-slate-600 bg-slate-700 hover:border-blue-400'
                  : 'border-red-600 bg-slate-800 opacity-60'
              }`}
            >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{component.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    component.accessible
                      ? 'bg-green-900 text-green-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {component.accessible ? 'Accessible' : 'Restricted'}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-gray-400 text-sm mb-2">Auth Level: <span className="text-gray-300 capitalize">{component.authLevel}</span></p>
                  <p className="text-gray-400 text-sm">Status: <span className={component.enabled ? 'text-green-400' : 'text-red-400'}>
                    {component.enabled ? 'Enabled' : 'Disabled'}
                  </span></p>
                </div>

                <div className="mb-3">
                  <p className="text-gray-300 text-sm mb-3">{component.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {component.features.slice(0, 3).map(feature => (
                      <span key={feature} className="bg-slate-600 text-gray-300 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                    {component.features.length > 3 && (
                      <span className="bg-slate-600 text-gray-400 px-2 py-1 rounded text-xs">
                        +{component.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400 capitalize">
                    {component.category}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    Level: {component.authLevel}
                  </span>
                </div>

                {component.accessible && (
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors">
                    Access Component
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Selected Component Details */}
          {selectedComponent && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-4">
                {components.find(c => c.componentId === selectedComponent)?.name}
              </h2>
              <ComponentDetails componentId={selectedComponent} manager={manager} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentDetails({ componentId, manager }: { componentId: string; manager: AuthenticatedAIManager }) {
  const component = manager.getComponent(componentId)

  if (!component) {
    return <p className="text-gray-400">Component not found</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Component Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Component ID</p>
            <p className="text-white font-mono">{component.componentId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Auth Level Required</p>
            <p className="text-white capitalize">{component.authLevel}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
        <p className="text-gray-300">{component.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Required Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {component.requiredPermissions.map(perm => (
            <span key={perm} className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm">
              {perm}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Available Features</h3>
        <div className="grid grid-cols-2 gap-2">
          {component.features.map(feature => (
            <div key={feature} className="bg-slate-600 p-3 rounded">
              <p className="text-gray-300 text-sm">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-600">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition-colors">
          Launch Component
        </button>
      </div>
    </div>
  )
}
