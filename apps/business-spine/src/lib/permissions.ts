import { JwtPayload } from '../../../../packages/auth/src/index'

// Role hierarchy constants
export const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  readonly: 1,
  client: 0,
  system: 6
} as const

export type Role = keyof typeof ROLE_HIERARCHY

// Permission definitions
export interface Permission {
  resource: string
  action: string
}

// Complete permission matrix
export const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  owner: [
    { resource: '*', action: '*' } // Full access
  ],
  admin: [
    // User management
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    
    // System administration
    { resource: 'system', action: 'read' },
    { resource: 'system', action: 'update' },
    { resource: 'system', action: 'configure' },
    
    // Monitoring and analytics
    { resource: 'monitoring', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'audit', action: 'read' },
    
    // Business operations
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'update' },
    { resource: 'bookings', action: 'delete' },
    
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'create' },
    { resource: 'payments', action: 'update' },
    { resource: 'payments', action: 'refund' },
    
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'create' },
    { resource: 'payroll', action: 'update' },
    
    // Enterprise features
    { resource: 'launch-gate', action: 'read' },
    { resource: 'launch-gate', action: 'update' },
    { resource: 'kill-switches', action: 'read' },
    { resource: 'kill-switches', action: 'update' },
    { resource: 'admin', action: 'read' },
    { resource: 'admin', action: 'update' }
  ],
  
  manager: [
    // Team management
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    
    // Business operations
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'update' },
    
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'create' },
    
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'create' },
    
    // Monitoring
    { resource: 'monitoring', action: 'read' },
    { resource: 'analytics', action: 'read' },
    { resource: 'admin', action: 'read' }
  ],
  
  staff: [
    // Basic operations
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'update' },
    
    { resource: 'payments', action: 'read' },
    
    // Limited access to own data
    { resource: 'profile', action: 'read' },
    { resource: 'profile', 'action': 'update' },
    { resource: 'schedule', action: 'read' }
  ],
  
  readonly: [
    // Read-only access
    { resource: 'bookings', action: 'read' },
    { resource: 'payments', action: 'read' },
    { resource: 'monitoring', action: 'read' },
    { resource: 'analytics', action: 'read' }
  ],
  
  client: [
    // Client-specific access
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'create' }
  ],
  
  system: [
    // System user has all permissions
    { resource: '*', action: '*' }
  ]
}

/**
 * Check if a user has permission for a specific resource and action
 */
export function hasPermission(user: JwtPayload | null, resource: string, action: string): boolean {
  if (!user?.role) return false
  
  const userRole = user.role as Role
  const permissions = PERMISSION_MATRIX[userRole] || []
  
  return permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    (permission.action === '*' || permission.action === action)
  )
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: JwtPayload | null, roles: Role[]): boolean {
  if (!user?.role) return false
  return roles.includes(user.role as Role)
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: JwtPayload | null, role: Role): boolean {
  if (!user?.role) return false
  return user.role === role
}

/**
 * Check if a user's role is at least the specified level in hierarchy
 */
export function hasMinimumRole(user: JwtPayload | null, minimumRole: Role): boolean {
  if (!user?.role) return false
  
  const userLevel = ROLE_HIERARCHY[user.role as Role] || 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: JwtPayload | null): Permission[] {
  if (!user?.role) return []
  return PERMISSION_MATRIX[user.role as Role] || []
}

/**
 * Check if an action requires approval from higher-level users
 */
export function requiresApproval(role: Role, action: string, amount?: number): boolean {
  const approvalRules = {
    admin: {
      refund: amount && amount > 1000,
      payroll: true,
      roleChange: true,
      dataExport: true,
      featureFlag: true
    },
    manager: {
      refund: amount && amount > 500,
      payroll: false,
      roleChange: false,
      dataExport: true,
      featureFlag: false
    }
  }

  return approvalRules[role]?.[action] || false
}

/**
 * Get the minimum role required for approval of an action
 */
export function getApprovalRole(resource: string, action: string): Role | null {
  const approvalMatrix: Record<string, Role> = {
    'users:delete': 'admin',
    'payments:refund': 'admin',
    'payroll:create': 'admin',
    'system:configure': 'owner',
    'kill-switches:update': 'admin',
    'launch-gate:update': 'admin'
  }

  const actionKey = `${resource}:${action}`
  return approvalMatrix[actionKey] || null
}

/**
 * Filter menu items based on user permissions
 */
export function filterMenuByPermissions<T extends { permission?: Permission }>(
  user: JwtPayload | null,
  items: T[]
): T[] {
  return items.filter(item => {
    if (!item.permission) return true
    return hasPermission(user, item.permission.resource, item.permission.action)
  })
}

/**
 * Create a permission checker function for a specific user
 */
export function createPermissionChecker(user: JwtPayload | null) {
  return {
    hasPermission: (resource: string, action: string) => hasPermission(user, resource, action),
    hasRole: (role: Role) => hasRole(user, role),
    hasAnyRole: (roles: Role[]) => hasAnyRole(user, roles),
    hasMinimumRole: (minimumRole: Role) => hasMinimumRole(user, minimumRole),
    getPermissions: () => getUserPermissions(user)
  }
}
