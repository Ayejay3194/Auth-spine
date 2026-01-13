/**
 * Admin Suite Core Types
 * Action-based permissions, not page-based cosplay
 */

export type PermissionAction = 
  | 'read'
  | 'write'
  | 'delete'
  | 'execute'
  | 'impersonate'
  | 'override';

export type PermissionScope = 'self' | 'org' | 'global';

export interface Permission {
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  lastActiveAt?: Date;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface BulkOperation {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  dryRun: boolean;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errors?: Array<{ item: any; error: string }>;
  canRollback: boolean;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: 'user' | 'org' | 'percentage' | 'global';
  scopeValue?: string | number;
  isKillSwitch: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface SystemJob {
  id: string;
  name: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  attempts: number;
  maxAttempts: number;
  progress?: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  canRetry: boolean;
  canCancel: boolean;
}

export interface AccountState {
  userId: string;
  state: 'active' | 'suspended' | 'shadow_banned' | 'locked' | 'flagged';
  reason?: string;
  setBy: string;
  setAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface ModerationFlag {
  id: string;
  resourceType: string;
  resourceId: string;
  flagType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  reporter?: string;
  assignedTo?: string;
  context?: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  slaDeadline?: Date;
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  targetUserId: string;
  reason: string;
  startedAt: Date;
  expiresAt: Date;
  endedAt?: Date;
  actions: Array<{
    action: string;
    timestamp: Date;
    metadata?: any;
  }>;
}

export interface ConfigEntry {
  key: string;
  value: any;
  environment: string;
  version: number;
  previousValue?: any;
  changedBy: string;
  changedAt: Date;
  description?: string;
  canRollback: boolean;
}

export interface DataCorrection {
  id: string;
  resourceType: string;
  resourceId: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  appliedBy: string;
  appliedAt?: Date;
  canRevert: boolean;
}
