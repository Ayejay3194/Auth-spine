import { Permission, Role, AdminUser } from './types';

/**
 * Permission System - Explicit allow only, no vibes
 */

export class PermissionEngine {
  private static instance: PermissionEngine;

  private constructor() {}

  static getInstance(): PermissionEngine {
    if (!PermissionEngine.instance) {
      PermissionEngine.instance = new PermissionEngine();
    }
    return PermissionEngine.instance;
  }

  /**
   * Check if user has permission
   * No wildcards unless you're super_admin
   */
  hasPermission(user: AdminUser, permission: string): boolean {
    if (user.permissions.includes('*')) return true;
    
    if (user.permissions.includes(permission)) return true;

    const [resource, action] = permission.split('.');
    const wildcardPermission = `${resource}.*`;
    
    return user.permissions.includes(wildcardPermission);
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(user: AdminUser, permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(user, p));
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(user: AdminUser, permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(user, p));
  }

  /**
   * Get all effective permissions for user
   */
  getEffectivePermissions(user: AdminUser, roles: Role[]): string[] {
    const userRoles = roles.filter(r => user.roles.includes(r.id));
    const rolePermissions = userRoles.flatMap(r => r.permissions);
    
    return Array.from(new Set([...user.permissions, ...rolePermissions]));
  }

  /**
   * Check if user can perform action on resource
   */
  can(user: AdminUser, action: string, resource: string): boolean {
    const permission = `${resource}.${action}`;
    return this.hasPermission(user, permission);
  }

  /**
   * Require permission or throw
   */
  require(user: AdminUser, permission: string): void {
    if (!this.hasPermission(user, permission)) {
      throw new PermissionError(`Missing permission: ${permission}`);
    }
  }

  /**
   * Require all permissions or throw
   */
  requireAll(user: AdminUser, permissions: string[]): void {
    const missing = permissions.filter(p => !this.hasPermission(user, p));
    if (missing.length > 0) {
      throw new PermissionError(`Missing permissions: ${missing.join(', ')}`);
    }
  }

  /**
   * Check if permission is expired
   */
  isExpired(user: AdminUser): boolean {
    if (!user.expiresAt) return false;
    return user.expiresAt < new Date();
  }

  /**
   * Validate permission format
   */
  validatePermission(permission: string): boolean {
    if (permission === '*') return true;
    
    const parts = permission.split('.');
    if (parts.length !== 2) return false;
    
    const [resource, action] = parts;
    if (!resource || !action) return false;
    
    const validActions = ['read', 'write', 'delete', 'execute', 'impersonate', 'override', '*'];
    return validActions.includes(action);
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Predefined Roles - Real permissions, not cosplay
 */
export const SYSTEM_ROLES: Record<string, Role> = {
  SUPPORT_AGENT: {
    id: 'support_agent',
    name: 'Support Agent',
    permissions: [
      'users.read',
      'users.flag',
      'moderation.read',
      'sessions.read',
      'audit.read',
    ],
    description: 'Can view users and flag issues, cannot modify',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  MODERATOR: {
    id: 'moderator',
    name: 'Moderator',
    permissions: [
      'users.read',
      'users.flag',
      'moderation.*',
      'content.read',
      'content.write',
      'content.delete',
      'flags.read',
      'flags.write',
    ],
    description: 'Can moderate content and manage flags',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  ADMIN: {
    id: 'admin',
    name: 'Admin',
    permissions: [
      'users.*',
      'orgs.*',
      'moderation.*',
      'billing.read',
      'billing.write',
      'jobs.read',
      'jobs.execute',
      'config.read',
      'audit.read',
      'reports.*',
    ],
    description: 'Full control except super admin functions',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Admin',
    permissions: ['*'],
    description: 'Unrestricted access - use with extreme caution',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  BILLING_ADMIN: {
    id: 'billing_admin',
    name: 'Billing Admin',
    permissions: [
      'billing.*',
      'subscriptions.*',
      'payments.*',
      'refunds.*',
      'users.read',
      'orgs.read',
      'audit.read',
    ],
    description: 'Manages billing, subscriptions, and payments',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  SECURITY_ADMIN: {
    id: 'security_admin',
    name: 'Security Admin',
    permissions: [
      'security.*',
      'audit.*',
      'users.read',
      'users.flag',
      'users.write',
      'abuse.*',
      'access_review.*',
    ],
    description: 'Security and compliance oversight',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  DEVELOPER: {
    id: 'developer',
    name: 'Developer',
    permissions: [
      'dev_tools.*',
      'config.read',
      'jobs.read',
      'jobs.execute',
      'feature_flags.*',
      'system_health.read',
      'audit.read',
    ],
    description: 'Development and debugging tools',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  READ_ONLY: {
    id: 'read_only',
    name: 'Read Only',
    permissions: [
      'users.read',
      'orgs.read',
      'billing.read',
      'moderation.read',
      'audit.read',
      'reports.read',
      'system_health.read',
    ],
    description: 'View-only access for auditing and reporting',
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const permissionEngine = PermissionEngine.getInstance();
