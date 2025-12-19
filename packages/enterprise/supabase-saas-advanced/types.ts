/**
 * Type definitions for Supabase SaaS/PaaS Advanced Pack
 */

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type QuotaType = 'api_requests' | 'storage' | 'bandwidth' | 'users' | 'seats';
export type APIKeyScope = 'read' | 'write' | 'admin' | 'billing' | 'support';
export type EnforcementMode = 'strict' | 'lenient' | 'disabled';

export interface TenantContext {
  id: string;
  name: string;
  status: TenantStatus;
  plan: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RLSPolicy {
  id: string;
  table: string;
  name: string;
  definition: string;
  tenantColumn: string;
  operations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  enabled: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  table?: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  hash: string;
  previousHash: string;
}

export interface QuotaLimit {
  id: string;
  tenantId: string;
  type: QuotaType;
  limit: number;
  current: number;
  period: 'daily' | 'monthly' | 'yearly' | 'lifetime';
  resetAt: Date;
  enforced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKey {
  id: string;
  tenantId: string;
  name: string;
  keyHash: string;
  scopes: APIKeyScope[];
  permissions: string[];
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface EdgeFunction {
  id: string;
  name: string;
  description: string;
  runtime: 'deno' | 'nodejs';
  entryPoint: string;
  environment: Record<string, string>;
  secrets: string[];
  enabled: boolean;
  tenantIsolated: boolean;
  rateLimit?: {
    requestsPerMinute: number;
    burstLimit: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityHeader {
  name: string;
  value: string;
  enabled: boolean;
  description: string;
  csp?: boolean;
}

export interface WebhookConfig {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SignedUploadPolicy {
  id: string;
  tenantId: string;
  bucket: string;
  key: string;
  expiresAt: Date;
  conditions: Array<{
    operation: string;
    value: string;
  }>;
  maxFileSize: number;
  allowedTypes: string[];
  createdAt: Date;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
  windowMs: number;
}

export interface TenantIsolationResult {
  isolated: boolean;
  tenantId: string;
  context: TenantContext;
  policies: RLSPolicy[];
  quotaStatus: QuotaLimit[];
}

export interface AuditQuery {
  tenantId?: string;
  userId?: string;
  action?: string;
  table?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface SupabaseSaaSConfig {
  enableTenantIsolation: boolean;
  enableRLSPolicies: boolean;
  enableAuditLogging: boolean;
  enableQuotaManagement: boolean;
  enableAPIKeys: boolean;
  enableEdgeFunctions: boolean;
  enableSecurityHeaders: boolean;
  tenantIdClaim: string;
  auditRetention: number;
  quotaEnforcement: EnforcementMode;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    storage: 'memory' | 'redis' | 'upstash';
  };
  security: {
    webhookSecret: boolean;
    hmacValidation: boolean;
    replayProtection: boolean;
    signedUploads: boolean;
    csrfProtection: boolean;
  };
  testing: {
    enablePolicyTests: boolean;
    enableUnitTests: boolean;
    enableIntegrationTests: boolean;
    testDatabase: string;
  };
}

export interface SaaSMetrics {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
  usage: {
    totalRequests: number;
    totalStorage: number;
    totalBandwidth: number;
  };
  quotas: {
    enforced: number;
    exceeded: number;
    warnings: number;
  };
  apiKeys: {
    total: number;
    active: number;
    expired: number;
  };
  auditLogs: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}
