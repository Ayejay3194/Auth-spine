/**
 * Enterprise RBAC (Role-Based Access Control) Package
 * 
 * Provides comprehensive role-based access control with:
 * - 5-tier role hierarchy (Owner, Admin, Manager, Staff, ReadOnly)
 * - Resource and action-based permissions
 * - Middleware protection for API routes
 * - Audit logging for security events
 * - Approval workflows for sensitive actions
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { Role, hasPermission, withRBAC, rbacMiddleware } from './middleware';
export type { ResourceAction, RBACConfig } from './types';

// Re-export commonly used utilities
export * from './permissions';
