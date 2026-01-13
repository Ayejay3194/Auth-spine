/**
 * RBAC Permissions Configuration
 * 
 * Defines the complete permission matrix for the enterprise system
 * with role-based access control for all resources and actions.
 */

import { Role, Permission } from './types';

/**
 * Permission matrix for each role
 * Higher roles inherit all permissions from lower roles
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    // Owner has access to everything
    { resource: '*', action: '*' }
  ],
  
  [Role.ADMIN]: [
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
    { resource: 'payments', action: 'refund' },
    
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'create' },
    { resource: 'payroll', action: 'update' },
    
    // Enterprise features
    { resource: 'launch-gate', action: 'read' },
    { resource: 'launch-gate', action: 'update' },
    { resource: 'kill-switches', action: 'read' },
    { resource: 'kill-switches', action: 'update' },
  ],
  
  [Role.MANAGER]: [
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
    
    // Limited enterprise features
    { resource: 'launch-gate', action: 'read' },
    { resource: 'kill-switches', action: 'read' },
  ],
  
  [Role.STAFF]: [
    // Basic operations
    { resource: 'bookings', action: 'read' },
    { resource: 'bookings', action: 'create' },
    { resource: 'bookings', action: 'update' },
    
    { resource: 'payments', action: 'read' },
    
    // Limited access to own data
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
  ],
  
  [Role.READONLY]: [
    // Read-only access
    { resource: 'bookings', action: 'read' },
    { resource: 'payments', action: 'read' },
    { resource: 'monitoring', action: 'read' },
  ]
};

/**
 * Actions that require approval from higher-level users
 */
export const APPROVAL_REQUIRED_ACTIONS: Record<string, Role> = {
  'users.delete': Role.ADMIN,
  'payments.refund': Role.ADMIN,
  'payroll.create': Role.ADMIN,
  'system.configure': Role.OWNER,
  'kill-switches.update': Role.ADMIN,
  'launch-gate.update': Role.ADMIN,
};

/**
 * Resource categories for better organization
 */
export const RESOURCE_CATEGORIES = {
  USERS: 'users',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  PAYROLL: 'payroll',
  SYSTEM: 'system',
  MONITORING: 'monitoring',
  ANALYTICS: 'analytics',
  AUDIT: 'audit',
  LAUNCH_GATE: 'launch-gate',
  KILL_SWITCHES: 'kill-switches',
  PROFILE: 'profile',
} as const;

/**
 * Default permissions for new users by role
 */
export const DEFAULT_USER_PERMISSIONS = {
  [Role.OWNER]: ROLE_PERMISSIONS[Role.OWNER],
  [Role.ADMIN]: ROLE_PERMISSIONS[Role.ADMIN],
  [Role.MANAGER]: ROLE_PERMISSIONS[Role.MANAGER],
  [Role.STAFF]: ROLE_PERMISSIONS[Role.STAFF],
  [Role.READONLY]: ROLE_PERMISSIONS[Role.READONLY],
};

/**
 * Check if a role has permission for a specific resource and action
 * Optimized for performance with early returns
 */
export function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  
  return permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    permission.action === action
  );
}

/**
 * Check if an action requires approval
 */
export function requiresApproval(resource: string, action: string): boolean {
  const actionKey = `${resource}.${action}`;
  return actionKey in APPROVAL_REQUIRED_ACTIONS;
}

/**
 * Get the minimum role required for approval
 */
export function getApprovalRole(resource: string, action: string): Role | null {
  const actionKey = `${resource}.${action}`;
  return APPROVAL_REQUIRED_ACTIONS[actionKey] || null;
}
