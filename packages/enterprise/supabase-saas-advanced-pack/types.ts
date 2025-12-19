/**
 * Type definitions for Supabase SaaS Advanced Pack
 */

export interface SaasAdvancedConfig {
  multiTenancy: MultiTenancyConfig;
  subscription: SubscriptionConfig;
  billing: BillingConfig;
  enterprise: EnterpriseConfig;
}

export interface MultiTenancyConfig {
  enabled: boolean;
  dataIsolation: boolean;
  tenantRouting: boolean;
  resourceSharing: boolean;
  tenantManagement: boolean;
}

export interface SubscriptionConfig {
  enabled: boolean;
  plans: boolean;
  trials: boolean;
  upgrades: boolean;
  cancellations: boolean;
}

export interface BillingConfig {
  enabled: boolean;
  integration: boolean;
  invoices: boolean;
  payments: boolean;
  reporting: boolean;
}

export interface EnterpriseConfig {
  enabled: boolean;
  sso: boolean;
  audit: boolean;
  compliance: boolean;
  support: boolean;
}

export interface SaasAdvancedMetrics {
  multiTenancy: MultiTenancyMetrics;
  subscription: SubscriptionMetrics;
  billing: BillingMetrics;
  enterprise: EnterpriseMetrics;
  overall: {
    tenantGrowth: number;
    revenueGrowth: number;
    churnRate: number;
    enterpriseAdoption: number;
  };
}

export interface MultiTenancyMetrics {
  activeTenants: number;
  dataIsolationScore: number;
  routingEfficiency: number;
  resourceUtilization: number;
  tenantSatisfaction: number;
}

export interface SubscriptionMetrics {
  activeSubscriptions: number;
  trialConversions: number;
  upgradeRate: number;
  cancellationRate: number;
  revenuePerUser: number;
}

export interface BillingMetrics {
  invoicesGenerated: number;
  paymentsProcessed: number;
  billingAccuracy: number;
  revenueRecognition: number;
  collectionRate: number;
}

export interface EnterpriseMetrics {
  ssoLogins: number;
  auditEvents: number;
  complianceScore: number;
  supportTickets: number;
  enterpriseRevenue: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  plan: string;
  createdAt: Date;
  updatedAt: Date;
  settings: TenantSettings;
  usage: TenantUsage;
  billing: TenantBilling;
}

export interface TenantSettings {
  dataIsolation: boolean;
  customDomain: boolean;
  sso: boolean;
  audit: boolean;
  apiAccess: boolean;
  branding: TenantBranding;
}

export interface TenantBranding {
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  theme: 'light' | 'dark' | 'auto';
  customCSS: string;
}

export interface TenantUsage {
  users: number;
  storage: number;
  bandwidth: number;
  apiCalls: number;
  lastReset: Date;
}

export interface TenantBilling {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'active' | 'past_due' | 'canceled';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  trialDays: number;
  popular: boolean;
  sortOrder: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  value?: string;
  category: string;
}

export interface PlanLimits {
  users: number;
  storage: number;
  bandwidth: number;
  apiCalls: number;
  projects: number;
  customDomains: boolean;
  sso: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'trial' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  quantity: number;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: string;
  autoRenew: boolean;
}

export interface BillingIntegration {
  provider: 'stripe' | 'paypal' | 'paddle' | 'custom';
  config: BillingConfig;
  webhooks: BillingWebhook[];
  events: BillingEvent[];
}

export interface BillingConfig {
  apiKey: string;
  webhookSecret: string;
  environment: 'test' | 'production';
  currency: string;
  taxRates: TaxRate[];
}

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  jurisdiction: string;
  type: 'vat' | 'sales_tax' | 'gst';
}

export interface BillingWebhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryCount: number;
}

export interface BillingEvent {
  id: string;
  type: 'invoice.created' | 'payment.succeeded' | 'subscription.created' | 'customer.updated';
  data: any;
  processed: boolean;
  timestamp: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  tax: number;
  total: number;
  downloadUrl?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  method: 'card' | 'bank' | 'wallet' | 'transfer';
  provider: string;
  providerId: string;
  createdAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface EnterpriseFeature {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'integration' | 'support';
  enabled: boolean;
  configuration: any;
  pricing: EnterprisePricing;
}

export interface EnterprisePricing {
  type: 'per_user' | 'flat_rate' | 'usage_based' | 'custom';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  minimumCommitment?: number;
}

export interface SSOConfiguration {
  provider: 'saml' | 'oidc' | 'ldap' | 'azure' | 'google';
  config: SSOConfig;
  users: SSOUser[];
  groups: SSOGroup[];
}

export interface SSOConfig {
  entityId: string;
  ssoUrl: string;
  sloUrl?: string;
  certificate: string;
  attributeMapping: AttributeMapping;
}

export interface AttributeMapping {
  email: string;
  name: string;
  groups: string;
  roles: string;
  department?: string;
}

export interface SSOUser {
  id: string;
  tenantId: string;
  externalId: string;
  email: string;
  name: string;
  groups: string[];
  roles: string[];
  lastLogin: Date;
  active: boolean;
}

export interface SSOGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  permissions: string[];
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceReport {
  id: string;
  type: 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss';
  period: {
    start: Date;
    end: Date;
  };
  status: 'in_progress' | 'completed' | 'failed';
  score: number;
  findings: ComplianceFinding[];
  evidence: ComplianceEvidence[];
  generatedAt: Date;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  dueDate: Date;
}

export interface ComplianceEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration';
  description: string;
  fileUrl?: string;
  metadata: any;
  collectedAt: Date;
  verified: boolean;
}
