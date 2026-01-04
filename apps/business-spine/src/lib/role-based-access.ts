import { JwtPayload } from '@enterprise/auth'

export type UserRole = 'system' | 'admin' | 'dev-admin' | 'practitioner' | 'owner' | 'client' | 'guest'

export interface RolePermissions {
  role: UserRole
  permissions: string[]
  features: string[]
  pages: string[]
  apiAccess: string[]
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  system: {
    role: 'system',
    permissions: [
      'system:*',
      'admin:*',
      'users:*',
      'roles:*',
      'audit:*',
      'security:*',
      'ai:*',
      'api:*'
    ],
    features: [
      'system-dashboard',
      'user-management',
      'role-management',
      'security-management',
      'audit-logs',
      'system-metrics',
      'ai-system-management',
      'api-management',
      'backup-recovery',
      'system-configuration'
    ],
    pages: [
      '/dashboard/system',
      '/admin/users',
      '/admin/roles',
      '/admin/security',
      '/admin/audit',
      '/ai-system',
      '/api/management',
      '/settings/system'
    ],
    apiAccess: [
      'GET /api/system/*',
      'POST /api/system/*',
      'PUT /api/system/*',
      'DELETE /api/system/*',
      'GET /api/admin/*',
      'POST /api/admin/*',
      'PUT /api/admin/*',
      'DELETE /api/admin/*'
    ]
  },
  admin: {
    role: 'admin',
    permissions: [
      'admin:read',
      'admin:write',
      'users:read',
      'users:write',
      'roles:read',
      'permissions:read',
      'permissions:write',
      'audit:read',
      'ai:read',
      'ai:write',
      'reports:read'
    ],
    features: [
      'admin-dashboard',
      'user-management',
      'permission-management',
      'resource-management',
      'reports',
      'ai-components',
      'model-management',
      'audit-logs'
    ],
    pages: [
      '/dashboard/admin',
      '/admin/users',
      '/admin/permissions',
      '/admin/resources',
      '/admin/reports',
      '/ai-system',
      '/ai-system/nlp',
      '/ai-system/forecasting',
      '/ai-system/optimization'
    ],
    apiAccess: [
      'GET /api/admin/*',
      'POST /api/admin/*',
      'PUT /api/admin/*',
      'GET /api/ai/*',
      'POST /api/ai/*'
    ]
  },
  'dev-admin': {
    role: 'dev-admin',
    permissions: [
      'api:read',
      'api:write',
      'integrations:read',
      'integrations:write',
      'deployments:read',
      'deployments:write',
      'logs:read',
      'monitoring:read'
    ],
    features: [
      'dev-admin-dashboard',
      'api-management',
      'integration-management',
      'deployment-management',
      'system-logs',
      'monitoring',
      'webhooks',
      'rate-limiting'
    ],
    pages: [
      '/dashboard/dev-admin',
      '/api/management',
      '/api/keys',
      '/integrations',
      '/deployments',
      '/logs',
      '/monitoring'
    ],
    apiAccess: [
      'GET /api/dev/*',
      'POST /api/dev/*',
      'PUT /api/dev/*',
      'GET /api/integrations/*',
      'POST /api/integrations/*',
      'GET /api/deployments/*',
      'POST /api/deployments/*'
    ]
  },
  practitioner: {
    role: 'practitioner',
    permissions: [
      'clients:read',
      'clients:write',
      'services:read',
      'services:write',
      'sessions:read',
      'sessions:write',
      'analytics:read',
      'ai:read'
    ],
    features: [
      'practitioner-dashboard',
      'client-management',
      'service-management',
      'schedule-management',
      'performance-analytics',
      'ai-insights',
      'communication'
    ],
    pages: [
      '/dashboard/practitioner',
      '/clients',
      '/services',
      '/schedule',
      '/analytics',
      '/ai-system/nlp',
      '/ai-system/forecasting'
    ],
    apiAccess: [
      'GET /api/clients/*',
      'POST /api/clients/*',
      'PUT /api/clients/*',
      'GET /api/services/*',
      'POST /api/services/*',
      'GET /api/sessions/*',
      'POST /api/sessions/*',
      'GET /api/analytics/*'
    ]
  },
  owner: {
    role: 'owner',
    permissions: [
      'business:read',
      'business:write',
      'team:read',
      'team:write',
      'financials:read',
      'financials:write',
      'reports:read',
      'settings:write'
    ],
    features: [
      'owner-dashboard',
      'team-management',
      'financial-management',
      'business-operations',
      'business-settings',
      'strategic-planning',
      'market-analysis'
    ],
    pages: [
      '/dashboard/owner',
      '/team',
      '/financials',
      '/business',
      '/settings/business',
      '/reports'
    ],
    apiAccess: [
      'GET /api/business/*',
      'POST /api/business/*',
      'PUT /api/business/*',
      'GET /api/team/*',
      'POST /api/team/*',
      'GET /api/financials/*',
      'POST /api/financials/*'
    ]
  },
  client: {
    role: 'client',
    permissions: [
      'services:read',
      'sessions:read',
      'sessions:write',
      'progress:read',
      'account:read',
      'account:write'
    ],
    features: [
      'client-dashboard',
      'service-browsing',
      'session-booking',
      'progress-tracking',
      'account-management',
      'communication'
    ],
    pages: [
      '/dashboard/client',
      '/services',
      '/sessions',
      '/progress',
      '/account'
    ],
    apiAccess: [
      'GET /api/services/*',
      'GET /api/sessions/*',
      'POST /api/sessions/*',
      'GET /api/progress/*',
      'GET /api/account/*',
      'PUT /api/account/*'
    ]
  },
  guest: {
    role: 'guest',
    permissions: [
      'public:read'
    ],
    features: [
      'public-browsing',
      'service-discovery'
    ],
    pages: [
      '/services',
      '/about',
      '/contact'
    ],
    apiAccess: [
      'GET /api/public/*'
    ]
  }
}

export function hasPermission(user: JwtPayload | null, permission: string): boolean {
  if (!user?.role) return false
  
  const rolePerms = ROLE_PERMISSIONS[user.role as UserRole]
  if (!rolePerms) return false
  
  return rolePerms.permissions.some(p => 
    p === permission || p === '*' || p.endsWith(':*') && permission.startsWith(p.split(':')[0])
  )
}

export function hasFeature(user: JwtPayload | null, feature: string): boolean {
  if (!user?.role) return false
  
  const rolePerms = ROLE_PERMISSIONS[user.role as UserRole]
  if (!rolePerms) return false
  
  return rolePerms.features.includes(feature)
}

export function canAccessPage(user: JwtPayload | null, page: string): boolean {
  if (!user?.role) return false
  
  const rolePerms = ROLE_PERMISSIONS[user.role as UserRole]
  if (!rolePerms) return false
  
  return rolePerms.pages.includes(page)
}

export function canAccessAPI(user: JwtPayload | null, method: string, endpoint: string): boolean {
  if (!user?.role) return false
  
  const rolePerms = ROLE_PERMISSIONS[user.role as UserRole]
  if (!rolePerms) return false
  
  const fullPath = `${method} ${endpoint}`
  
  return rolePerms.apiAccess.some(access => {
    if (access === fullPath) return true
    if (access.endsWith('*')) {
      const pattern = access.slice(0, -1)
      return fullPath.startsWith(pattern)
    }
    return false
  })
}

export function getRoleHierarchy(): UserRole[] {
  return ['system', 'admin', 'dev-admin', 'owner', 'practitioner', 'client', 'guest']
}

export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy()
  const userIndex = hierarchy.indexOf(userRole)
  const requiredIndex = hierarchy.indexOf(requiredRole)
  
  return userIndex <= requiredIndex
}
