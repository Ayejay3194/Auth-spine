'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { JwtPayload } from '../../../../packages/auth/src/index'

interface AuthContextType {
  user: JwtPayload | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasPermission: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  readonly: 1,
  client: 0,
  system: 6
}

// Permission matrix for quick client-side checks
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'], // All permissions
  admin: [
    'users:read', 'users:update', 'users:create', 'users:delete',
    'bookings:read', 'bookings:create', 'bookings:update', 'bookings:delete',
    'payments:read', 'payments:create', 'payments:update', 'payments:refund',
    'analytics:read', 'reports:read', 'admin:read', 'admin:update',
    'launch-gate:read', 'launch-gate:update', 'kill-switches:read', 'kill-switches:update'
  ],
  manager: [
    'users:read', 'users:update',
    'bookings:read', 'bookings:create', 'bookings:update',
    'payments:read', 'payments:create',
    'reports:read', 'admin:read'
  ],
  staff: [
    'bookings:read', 'bookings:update',
    'profile:read', 'profile:update', 'schedule:read'
  ],
  readonly: [
    'reports:read', 'analytics:read'
  ],
  client: [
    'profile:read', 'profile:update'
  ]
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<JwtPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token on mount
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1]

    if (token) {
      try {
        // Parse JWT payload (without verification for client-side)
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (error) {
        console.error('Failed to parse token:', error)
        // Remove invalid token
        document.cookie = 'auth-token=; Max-Age=0; path=/'
      }
    }
    setIsLoading(false)
  }, [])

  const login = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
      // Set cookie for API requests
      document.cookie = `auth-token=${token}; Max-Age=86400; path=/; SameSite=Lax`
    } catch (error) {
      console.error('Failed to parse token:', error)
    }
  }

  const logout = () => {
    setUser(null)
    document.cookie = 'auth-token=; Max-Age=0; path=/'
    window.location.href = '/login'
  }

  const hasRole = (role: string): boolean => {
    if (!user?.role) return false
    return user.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.role) return false
    return roles.includes(user.role)
  }

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user?.role) return false
    
    const permission = `${resource}:${action}`
    const userPermissions = ROLE_PERMISSIONS[user.role] || []
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) return true
    // Check for specific permission
    if (userPermissions.includes(permission)) return true
    
    return false
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for role-based rendering
export function withRole<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole: string
) {
  return function RoleProtectedComponent(props: T) {
    const { hasRole } = useAuth()
    
    if (!hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}

// Higher-order component for permission-based rendering
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  requiredPermission: { resource: string; action: string }
) {
  return function PermissionProtectedComponent(props: T) {
    const { hasPermission } = useAuth()
    
    if (!hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this resource.</p>
          </div>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}
