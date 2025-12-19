// Enterprise Domain Suite Index
// Exports all enterprise-related functionality

// Multi-Tenancy Suite
export * from './multi-tenancy';

// Enterprise Auth Suite
export * from './enterprise-auth';

// Enterprise Security Suite
export * from './enterprise-security';

// Enterprise Monitoring Suite
export * from './enterprise-monitoring';

// Enterprise Types
export interface EnterpriseTenant {
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

export interface TenantBilling {
  subscriptionId: string;
  plan: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  paymentMethod: string;
  usage: {
    currentUsers: number;
    currentStorage: number;
    currentApiCalls: number;
    currentBandwidth: number;
  };
}

export interface EnterpriseAuth {
  id: string;
  tenantId: string;
  userId: string;
  method: 'sso' | 'ldap' | 'oauth' | 'saml';
  provider: string;
  configuration: Record<string, any>;
  isActive: boolean;
  lastUsed: Date;
}

export interface EnterpriseSecurity {
  id: string;
  tenantId: string;
  type: 'data_loss_prevention' | 'intrusion_detection' | 'access_control' | 'encryption';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  alerts: SecurityAlert[];
  incidents: SecurityIncident[];
}

export interface EnterpriseMonitoring {
  id: string;
  tenantId: string;
  service: string;
  metrics: {
    performance: PerformanceMetrics;
    availability: AvailabilityMetrics;
    usage: UsageMetrics;
    errors: ErrorMetrics;
  };
  alerts: MonitoringAlert[];
  dashboards: MonitoringDashboard[];
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

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface SecurityIncident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface AvailabilityMetrics {
  uptime: number;
  downtime: number;
  errorRate: number;
}

export interface UsageMetrics {
  activeUsers: number;
  requestsPerMinute: number;
  dataTransferred: number;
}

export interface ErrorMetrics {
  errorCount: number;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
  }>;
}

export interface MonitoringAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isDefault: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  query: string;
  visualization: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
}

// Enterprise Constants
export const ENTERPRISE_PLANS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const;

export const TENANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial'
} as const;

export const AUTH_METHODS = {
  SSO: 'sso',
  LDAP: 'ldap',
  OAUTH: 'oauth',
  SAML: 'saml'
} as const;

export const SECURITY_TYPES = {
  DATA_LOSS_PREVENTION: 'data_loss_prevention',
  INTRUSION_DETECTION: 'intrusion_detection',
  ACCESS_CONTROL: 'access_control',
  ENCRYPTION: 'encryption'
} as const;

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;
