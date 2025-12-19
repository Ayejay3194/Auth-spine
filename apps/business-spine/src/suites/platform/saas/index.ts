// SaaS Suite - Software as a Service
// Exports SaaS-related functionality

// SaaS Components
export { default as TenantManager } from './components/TenantManager';
export { default as SubscriptionManager } from './components/SubscriptionManager';
export { default as BillingManager } from './components/BillingManager';

// SaaS Hooks
export { default as useTenants } from './hooks/useTenants';
export { default as useSubscription } from './hooks/useSubscription';
export { default as useBilling } from './hooks/useBilling';

// SaaS Services
export { default as saasService } from './services/saasService';

// SaaS Types
export interface SaaSTenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  settings: TenantSettings;
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
  };
  features: {
    apiAccess: boolean;
    customDomains: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
  };
}

export interface SaaSSubscription {
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

export interface SaaSBilling {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  dueDate: Date;
  paidDate?: Date;
  items: BillingItem[];
}

export interface BillingItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

// SaaS Constants
export const SAAS_PLANS = {
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export const SAAS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial'
} as const;

export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
} as const;
