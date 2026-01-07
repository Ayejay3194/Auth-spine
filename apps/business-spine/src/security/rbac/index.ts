/**
 * Role-Based Access Control (RBAC) Module
 * 7-tier permission system
 */

export type Role = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'staff'
  | 'professional'
  | 'client'
  | 'guest';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'bookings:read'
  | 'bookings:write'
  | 'bookings:delete'
  | 'services:read'
  | 'services:write'
  | 'services:delete'
  | 'payments:read'
  | 'payments:write'
  | 'reports:read'
  | 'reports:generate'
  | 'settings:read'
  | 'settings:write'
  | 'admin:access'
  | 'ops:kill_switches'
  | 'ops:launch_gates';

/**
 * Role permission matrix
 */
const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    'users:read', 'users:write', 'users:delete',
    'bookings:read', 'bookings:write', 'bookings:delete',
    'services:read', 'services:write', 'services:delete',
    'payments:read', 'payments:write',
    'reports:read', 'reports:generate',
    'settings:read', 'settings:write',
    'admin:access',
    'ops:kill_switches', 'ops:launch_gates'
  ],
  admin: [
    'users:read', 'users:write',
    'bookings:read', 'bookings:write', 'bookings:delete',
    'services:read', 'services:write', 'services:delete',
    'payments:read', 'payments:write',
    'reports:read', 'reports:generate',
    'settings:read', 'settings:write',
    'admin:access'
  ],
  manager: [
    'users:read',
    'bookings:read', 'bookings:write',
    'services:read', 'services:write',
    'payments:read',
    'reports:read', 'reports:generate',
    'settings:read'
  ],
  staff: [
    'bookings:read', 'bookings:write',
    'services:read',
    'payments:read',
    'reports:read'
  ],
  professional: [
    'bookings:read', 'bookings:write',
    'services:read',
    'reports:read'
  ],
  client: [
    'bookings:read',
    'services:read'
  ],
  guest: [
    'services:read'
  ]
};

/**
 * Check if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if role has any of the permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if role has all permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user role is higher than target role
 */
export function isRoleHigher(userRole: Role, targetRole: Role): boolean {
  const roleHierarchy: Role[] = [
    'super_admin',
    'admin',
    'manager',
    'staff',
    'professional',
    'client',
    'guest'
  ];

  const userIndex = roleHierarchy.indexOf(userRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);

  return userIndex < targetIndex;
}

/**
 * Require permission middleware helper
 */
export function requirePermission(permission: Permission) {
  return (role: Role): boolean => {
    return hasPermission(role, permission);
  };
}
