// Platform Domain Suite Index
// Exports all platform-related functionality

// SaaS Suite
export * from './saas';

// PaaS Suite
export * from './paas';

// Supabase Suite
export * from './supabase';

// Validation Suite
export * from './validation';

// Patterns Suite
export * from './patterns';

// Platform Types
export interface PlatformTenant {
  id: string;
  name: string;
  domain: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformService {
  id: string;
  name: string;
  type: 'database' | 'storage' | 'compute' | 'network' | 'security';
  status: 'running' | 'stopped' | 'error';
  tenantId: string;
  configuration: Record<string, any>;
  metrics: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
  createdAt: Date;
}

export interface PlatformSubscription {
  id: string;
  tenantId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  currency: string;
  features: string[];
}

export interface PlatformValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
  errors: ValidationError[];
  isValid: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
}

export interface PlatformPattern {
  id: string;
  name: string;
  type: 'anti-pattern' | 'best-practice' | 'architecture' | 'security';
  description: string;
  examples: string[];
  solution?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Platform Constants
export const PLATFORM_PLANS = {
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export const PLATFORM_SERVICES = {
  DATABASE: 'database',
  STORAGE: 'storage',
  COMPUTE: 'compute',
  NETWORK: 'network',
  SECURITY: 'security'
} as const;

export const PLATFORM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error'
} as const;

export const VALIDATION_RULES = {
  REQUIRED: 'required',
  MIN: 'min',
  MAX: 'max',
  PATTERN: 'pattern',
  CUSTOM: 'custom'
} as const;

export const PATTERN_TYPES = {
  ANTI_PATTERN: 'anti-pattern',
  BEST_PRACTICE: 'best-practice',
  ARCHITECTURE: 'architecture',
  SECURITY: 'security'
} as const;

export const PLATFORM_FEATURES = {
  BASIC: [
    'basic_support',
    'single_database',
    'basic_analytics',
    'email_support'
  ],
  PRO: [
    'priority_support',
    'multiple_databases',
    'advanced_analytics',
    'api_access',
    'custom_domains'
  ],
  ENTERPRISE: [
    'dedicated_support',
    'unlimited_databases',
    'enterprise_analytics',
    'advanced_api',
    'white_label',
    'custom_integrations',
    'sla_guarantee'
  ]
} as const;
