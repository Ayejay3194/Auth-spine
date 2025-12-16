/**
 * RBAC Type Definitions
 * 
 * Comprehensive type definitions for the Role-Based Access Control system
 * with strict typing for maximum type safety and developer experience.
 */

/**
 * User roles in the system hierarchy
 * Higher roles have all permissions of lower roles
 */
export enum Role {
  OWNER = 'owner',      // Full system access
  ADMIN = 'admin',      // Administrative access
  MANAGER = 'manager',  // Management access
  STAFF = 'staff',      // Staff access
  READONLY = 'readonly' // Read-only access
}

/**
 * Resource-action permission structure
 */
export interface ResourceAction {
  resource: string;
  action: string;
}

/**
 * Permission definition with resource and action
 */
export interface Permission {
  resource: string | '*'; // '*' for all resources
  action: string;
}

/**
 * User context for RBAC evaluation
 */
export interface UserContext {
  id: string;
  role: Role;
  email: string;
  permissions?: Permission[];
  department?: string;
  isActive: boolean;
}

/**
 * RBAC configuration options
 */
export interface RBACConfig {
  /** Enable audit logging for all RBAC actions */
  enableAuditLog?: boolean;
  /** Custom permission resolver function */
  customResolver?: (user: UserContext, required: ResourceAction) => Promise<boolean>;
  /** Cache duration for permission checks (ms) */
  cacheDuration?: number;
  /** Enable approval workflows for sensitive actions */
  enableApprovals?: boolean;
}

/**
 * Audit log entry for RBAC actions
 */
export interface RBACAuditLog {
  userId: string;
  action: string;
  resource: string;
  granted: boolean;
  reason?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Approval workflow configuration
 */
export interface ApprovalWorkflow {
  id: string;
  name: string;
  requiredRole: Role;
  approvers: string[];
  conditions?: Record<string, any>;
}

/**
 * Middleware options for RBAC protection
 */
export interface RBACMiddlewareOptions {
  /** Required permission for access */
  permission: ResourceAction;
  /** Custom error message */
  errorMessage?: string;
  /** Skip authentication check (for testing) */
  skipAuth?: boolean;
}
