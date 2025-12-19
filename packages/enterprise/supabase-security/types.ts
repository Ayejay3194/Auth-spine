/**
 * Type definitions for Supabase Security & Architecture Pack
 */

export type AuthMethod = 'email' | 'phone' | 'oauth' | 'sso' | 'passwordless';
export type UserRole = 'admin' | 'operator' | 'user' | 'guest';
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SecurityConfig {
  authentication: AuthConfig;
  rowLevelSecurity: RLSConfig;
  storage: StorageConfig;
  audit: AuditConfig;
  ops: OpsConfig;
  production: ProductionConfig;
}

export interface AuthConfig {
  enableMFA: boolean;
  enableSSO: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enablePasswordless: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
}

export interface RLSConfig {
  enabled: boolean;
  enforceOnAllTables: boolean;
  bypassForServiceRole: boolean;
  enableTenantIsolation: boolean;
  enableRoleBasedAccess: boolean;
}

export interface StorageConfig {
  enableVirusScanning: boolean;
  enableContentValidation: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  enableSignedURLs: boolean;
  urlExpiration: number;
  enableVersioning: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  logLevel: LogLevel;
  retentionDays: number;
  logFailedAuth: boolean;
  logDataAccess: boolean;
  logSchemaChanges: boolean;
  enableRealTime: boolean;
}

export interface OpsConfig {
  enableOpsSeparation: boolean;
  opsDatabase: string;
  publicDatabase: string;
  enableOpsAuth: boolean;
  opsRoles: string[];
  enableOpsAudit: boolean;
}

export interface ProductionConfig {
  enableSSL: boolean;
  enableBackup: boolean;
  backupRetention: number;
  enableMonitoring: boolean;
  enableAlerts: boolean;
  enableRateLimiting: boolean;
  enableCORS: boolean;
  allowedOrigins: string[];
}

export interface UserSession {
  id: string;
  userId: string;
  tenantId?: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  mfaVerified: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'auth' | 'data_access' | 'schema_change' | 'security_violation';
  severity: SecurityLevel;
  userId?: string;
  tenantId?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface RLSPolicy {
  id: string;
  table: string;
  name: string;
  definition: string;
  roles: UserRole[];
  operations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoragePolicy {
  id: string;
  bucket: string;
  pattern: string;
  allowedOperations: ('upload' | 'download' | 'delete')[];
  sizeLimit: number;
  allowedTypes: string[];
  roles: UserRole[];
  enabled: boolean;
  createdAt: Date;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number;
  compression: boolean;
  encryption: boolean;
  destination: 'local' | 's3' | 'gcs';
  destinationConfig: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: {
    performance: boolean;
    security: boolean;
    usage: boolean;
    errors: boolean;
  };
  alerts: {
    email: string[];
    slack: string[];
    webhook: string[];
  };
  thresholds: {
    errorRate: number;
    responseTime: number;
    authFailures: number;
    storageUsage: number;
  };
}

export interface SecurityMetrics {
  authentication: {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    passwordlessUsage: number;
  };
  dataAccess: {
    totalQueries: number;
    blockedQueries: number;
    sensitiveDataAccess: number;
    crossTenantAccess: number;
  };
  storage: {
    totalFiles: number;
    totalSize: number;
    blockedUploads: number;
    virusDetections: number;
  };
  audit: {
    totalEvents: number;
    securityEvents: number;
    resolvedEvents: number;
    pendingEvents: number;
  };
}

export interface SecurityReport {
  id: string;
  type: 'security' | 'compliance' | 'audit' | 'performance';
  period: {
    start: Date;
    end: Date;
  };
  metrics: SecurityMetrics;
  findings: Array<{
    severity: SecurityLevel;
    category: string;
    description: string;
    recommendation: string;
  }>;
  generatedAt: Date;
  generatedBy: string;
}

export interface UserSecurityProfile {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin: Date;
  failedAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt: Date;
  activeSessions: number;
  securityFlags: string[];
}

export interface TenantSecurityConfig {
  tenantId: string;
  customPolicies: RLSPolicy[];
  storagePolicies: StoragePolicy[];
  userRoles: Record<string, UserRole[]>;
  securityFlags: string[];
  complianceRequirements: string[];
  auditRetention: number;
}

export interface SecurityIncident {
  id: string;
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other';
  severity: SecurityLevel;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  description: string;
  affectedUsers: number;
  affectedData: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  actions: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    description: string;
  }>;
  lessons: string[];
}
