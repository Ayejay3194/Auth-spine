// Multi-Tenancy Suite - Multi-tenant Support
// Exports multi-tenancy-related functionality

// Multi-Tenancy Components
export { default as TenantManager } from './components/TenantManager';
export { default as TenantSettings } from './components/TenantSettings';
export { default as TenantIsolation } from './components/TenantIsolation';

// Multi-Tenancy Hooks
export { default as useMultiTenancy } from './hooks/useMultiTenancy';
export { default as useTenant } from './hooks/useTenant';

// Multi-Tenancy Services
export { default as multiTenancyService } from './services/multiTenancyService';

// Multi-Tenancy Types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  settings: TenantSettings;
  limits: TenantLimits;
  billing: TenantBilling;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  timezone: string;
  locale: string;
  currency: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCSS?: string;
  };
  features: {
    sso: boolean;
    apiAccess: boolean;
    customDomains: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
  };
  security: {
    mfaRequired: boolean;
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    ipWhitelist: string[];
  };
}

export interface TenantLimits {
  users: number;
  storage: number; // in GB
  apiCalls: number; // per month
  bandwidth: number; // in GB per month
  customDomains: number;
  ssoProviders: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays: number;
}

// Multi-Tenancy Constants
export const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial'
} as const;

export const TENANT_PLANS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const;
