'use client'

import React, { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import Link from 'next/link'

interface RoleBasedLayoutProps {
  children: ReactNode
  role: string
  title: string
  description?: string
}

export function RoleBasedLayout({
  children,
  role,
  title,
  description
}: RoleBasedLayoutProps) {
  const { user, hasRole } = useAuth()

  const navigationItems = getNavigationItems(role)

  return (
    <ProtectedComponent requireAuth role={role}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">
                {user?.email}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {role}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-800 border-r border-slate-700 min-h-[calc(100vh-80px)] p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedComponent>
  )
}

function getNavigationItems(role: string) {
  const baseItems = [
    { label: 'Dashboard', href: `/dashboard/${role}` }
  ]

  const roleItems: Record<string, Array<{ label: string; href: string }>> = {
    system: [
      { label: 'System Metrics', href: '/admin/metrics' },
      { label: 'User Management', href: '/admin/users' },
      { label: 'Role Management', href: '/admin/roles' },
      { label: 'Security', href: '/admin/security' },
      { label: 'Audit Logs', href: '/admin/audit' },
      { label: 'AI System', href: '/ai-system' },
      { label: 'Settings', href: '/settings/system' }
    ],
    admin: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Permissions', href: '/admin/permissions' },
      { label: 'Resources', href: '/admin/resources' },
      { label: 'Reports', href: '/admin/reports' },
      { label: 'AI Components', href: '/ai-system' },
      { label: 'Settings', href: '/settings/admin' }
    ],
    'dev-admin': [
      { label: 'API Keys', href: '/api/keys' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Deployments', href: '/deployments' },
      { label: 'Logs', href: '/logs' },
      { label: 'Monitoring', href: '/monitoring' }
    ],
    owner: [
      { label: 'Team', href: '/team' },
      { label: 'Financials', href: '/financials' },
      { label: 'Business', href: '/business' },
      { label: 'Reports', href: '/reports' },
      { label: 'Settings', href: '/settings/business' }
    ],
    practitioner: [
      { label: 'Clients', href: '/clients' },
      { label: 'Services', href: '/services' },
      { label: 'Schedule', href: '/schedule' },
      { label: 'Analytics', href: '/analytics' },
      { label: 'AI Insights', href: '/ai-system' }
    ],
    client: [
      { label: 'Services', href: '/services' },
      { label: 'Sessions', href: '/sessions' },
      { label: 'Progress', href: '/progress' },
      { label: 'Account', href: '/account' }
    ]
  }

  return [...baseItems, ...(roleItems[role] || [])]
}
