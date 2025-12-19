// Security Domain Suite Index
// Exports all security-related functionality
// Organized for clean imports and reduced circular dependencies

// Core Security Modules
export * from './authentication';
export * from './authorization';
export * from './audit';
export * from './compliance';

// Security Hardening Modules
export * from './defense';
export * from './governance';
export * from './admin';
export * from './ultimate';
export * from './comprehensive';

// Security Types
export interface SecurityUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  lastLogin: Date;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
}

export interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
}

export interface SecurityPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface SecurityAudit {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
}

export interface SecurityCompliance {
  id: string;
  standard: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  lastAssessed: Date;
  evidence?: string[];
  nextAssessment: Date;
}

export interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  status: 'open' | 'investigating' | 'resolved';
  mitigations: string[];
}

// Security Constants
export const SECURITY_ACTIONS = {
  AUTH: {
    LOGIN: 'auth.login',
    LOGOUT: 'auth.logout',
    REGISTER: 'auth.register',
    RESET_PASSWORD: 'auth.reset_password',
    ENABLE_MFA: 'auth.enable_mfa'
  },
  USER: {
    CREATE: 'user.create',
    READ: 'user.read',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    LIST: 'user.list'
  },
  ROLE: {
    CREATE: 'role.create',
    READ: 'role.read',
    UPDATE: 'role.update',
    DELETE: 'role.delete',
    ASSIGN: 'role.assign'
  },
  SYSTEM: {
    CONFIGURE: 'system.configure',
  MONITOR: 'system.monitor',
  BACKUP: 'system.backup',
  RESTORE: 'system.restore'
  }
} as const;

export const SECURITY_RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  AUDIT: 'audit',
  COMPLIANCE: 'compliance',
  SYSTEM: 'system'
} as const;

export const SECURITY_STANDARDS = {
  SOX: 'SOX',
  GDPR: 'GDPR',
  HIPAA: 'HIPAA',
  PCI_DSS: 'PCI_DSS',
  ISO_27001: 'ISO_27001',
  SOC_2: 'SOC_2'
} as const;

export const THREAT_TYPES = {
  MALWARE: 'malware',
  PHISHING: 'phishing',
  SQL_INJECTION: 'sql_injection',
  XSS: 'xss',
  CSRF: 'csrf',
  BRUTE_FORCE: 'brute_force',
  DATA_BREACH: 'data_breach',
  DOS: 'dos'
} as const;
