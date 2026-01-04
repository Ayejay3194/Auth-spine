'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  // Redirect to role-specific dashboard
  if (hasRole('system')) {
    router.push('/dashboard/system')
  } else if (hasRole('admin')) {
    router.push('/dashboard/admin')
  } else if (hasRole('dev-admin')) {
    router.push('/dashboard/dev-admin')
  } else if (hasRole('practitioner')) {
    router.push('/dashboard/practitioner')
  } else if (hasRole('owner')) {
    router.push('/dashboard/owner')
  } else if (hasRole('client')) {
    router.push('/dashboard/client')
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
