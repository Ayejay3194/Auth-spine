'use client'

import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { hasPermission } from '../lib/permissions'

interface ProtectedComponentProps {
  children: React.ReactNode
  permission?: {
    resource: string
    action: string
  }
  role?: string
  roles?: string[]
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export function ProtectedComponent({
  children,
  permission,
  role,
  roles,
  fallback = null,
  requireAuth = false
}: ProtectedComponentProps) {
  const { user, isAuthenticated, hasRole: userHasRole, hasAnyRole: userHasAnyRole } = useAuth()

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (role && !userHasRole(role)) {
    return <>{fallback}</>
  }

  if (roles && !userHasAnyRole(roles)) {
    return <>{fallback}</>
  }

  // Check permission-based access
  if (permission && user && !hasPermission(user, permission.resource, permission.action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Higher-order component for role protection
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string,
  fallback?: React.ReactNode
) {
  return function WithRoleComponent(props: P) {
    return (
      <ProtectedComponent role={requiredRole} fallback={fallback}>
        <Component {...props} />
      </ProtectedComponent>
    )
  }
}

// Higher-order component for permission protection
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: { resource: string; action: string },
  fallback?: React.ReactNode
) {
  return function WithPermissionComponent(props: P) {
    return (
      <ProtectedComponent permission={requiredPermission} fallback={fallback}>
        <Component {...props} />
      </ProtectedComponent>
    )
  }
}

// Hook for conditional rendering based on permissions
export function usePermission(resource: string, action: string) {
  const { user } = useAuth()
  return hasPermission(user, resource, action)
}

// Hook for conditional rendering based on role
export function useRole(role: string) {
  const { hasRole } = useAuth()
  return hasRole(role)
}

// Hook for conditional rendering based on multiple roles
export function useAnyRole(roles: string[]) {
  const { hasAnyRole } = useAuth()
  return hasAnyRole(roles)
}
