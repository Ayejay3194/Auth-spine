/**
 * Type definitions for Supabase SaaS Features Pack
 */

export interface SupabaseSaasConfig {
  multiTenant: {
    enabled: boolean;
    isolationLevel: 'database' | 'schema' | 'row_level';
    tenantIdentification: 'subdomain' | 'custom_domain' | 'header' | 'path';
    provisioning: 'manual' | 'automatic' | 'self_service';
  };
  database: {
    enableAdvancedPatterns: boolean;
    enableSoftDeletes: boolean;
    enableAuditing: boolean;
    enableCaching: boolean;
  };
  realtime: {
    enablePresence: boolean;
    enableBroadcast: boolean;
    enableCollaboration: boolean;
  };
  storage: {
    enableMultiTenant: boolean;
    enableCDN: boolean;
    enableTransformations: boolean;
  };
  api: {
    enableRateLimiting: boolean;
    enableWebhooks: boolean;
    enableGraphQL: boolean;
  };
  billing: {
    enableSubscriptions: boolean;
    enableUsageTracking: boolean;
    enableInvoicing: boolean;
  };
  compliance: {
    enableGDPR: boolean;
    enableSOC2: boolean;
    enableAuditLogs: boolean;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  settings: TenantSettings;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  features: {
    enableSSO?: boolean;
    enableAPI?: boolean;
    enableWebhooks?: boolean;
    enableCustomDomains?: boolean;
  };
  limits: {
    users?: number;
    storage?: number;
    apiCalls?: number;
    bandwidth?: number;
  };
  notifications: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    webhook?: boolean;
  };
}

export interface MultiTenantEnvironment {
  tenants: Map<string, Tenant>;
  schemas: Map<string, TenantSchema>;
  isolation: {
    level: 'database' | 'schema' | 'row_level';
    implemented: boolean;
    configuration: Record<string, any>;
  };
  provisioning: {
    method: 'manual' | 'automatic' | 'self_service';
    workflow: TenantProvisioningWorkflow;
    status: 'idle' | 'provisioning' | 'error';
  };
}

export interface TenantSchema {
  tenantId: string;
  schemaName: string;
  tables: string[];
  functions: string[];
  policies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantProvisioningWorkflow {
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    duration?: number;
    error?: string;
  }>;
  currentStep?: string;
  progress: number;
  estimatedDuration: number;
}

export interface AdvancedDatabasePattern {
  name: string;
  type: 'soft_delete' | 'versioning' | 'audit' | 'caching' | 'partitioning';
  tables: string[];
  functions: string[];
  triggers: string[];
  indexes: string[];
  configuration: Record<string, any>;
}

export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
    max: number;
  };
  performance: {
    queryTime: number;
    slowQueries: number;
    cacheHitRatio: number;
    indexUsage: number;
  };
  storage: {
    size: number;
    tables: number;
    indexes: number;
    bloat: number;
  };
  replication: {
    lag: number;
    status: 'healthy' | 'degraded' | 'failed';
  };
}

export interface RealtimeFeature {
  name: string;
  type: 'presence' | 'broadcast' | 'collaboration';
  channels: string[];
  events: string[];
  configuration: Record<string, any>;
}

export interface PresenceState {
  users: Map<string, PresenceUser>;
  channels: Map<string, Set<string>>;
  metadata: Map<string, any>;
}

export interface PresenceUser {
  id: string;
  tenantId: string;
  onlineAt: Date;
  lastSeen: Date;
  metadata: Record<string, any>;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export interface CollaborationSession {
  id: string;
  tenantId: string;
  type: 'document' | 'whiteboard' | 'code' | 'design';
  participants: string[];
  state: Record<string, any>;
  operations: CollaborationOperation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationOperation {
  id: string;
  userId: string;
  type: 'insert' | 'delete' | 'update' | 'move' | 'format';
  path: string;
  data: any;
  timestamp: Date;
}

export interface StorageConfiguration {
  multiTenant: boolean;
  cdn: {
    enabled: boolean;
    provider: 'cloudflare' | 'cloudfront' | 'fastly';
    distribution?: string;
  };
  transformations: {
    enabled: boolean;
    formats: Array<'webp' | 'avif' | 'jpg' | 'png'>;
    sizes: Array<{ width: number; height: number }>;
  };
  buckets: Array<{
    name: string;
    public: boolean;
    tenantIsolated: boolean;
    policies: StoragePolicy[];
  }>;
}

export interface StoragePolicy {
  name: string;
  type: 'read' | 'write' | 'delete';
  conditions: Record<string, any>;
  effect: 'allow' | 'deny';
}

export interface APIIntegration {
  id: string;
  name: string;
  type: 'webhook' | 'rest' | 'graphql' | 'websocket';
  endpoint: string;
  authentication: {
    type: 'bearer' | 'basic' | 'api_key' | 'oauth';
    credentials: Record<string, string>;
  };
  rateLimit: {
    requests: number;
    window: number;
    burst?: number;
  };
  webhooks: WebhookConfiguration[];
  status: 'active' | 'inactive' | 'error';
}

export interface WebhookConfiguration {
  event: string;
  url: string;
  secret: string;
  retries: number;
  timeout: number;
  filters: Record<string, any>;
}

export interface BillingConfiguration {
  subscriptions: {
    enabled: boolean;
    plans: BillingPlan[];
    trials: {
      enabled: boolean;
      duration: number;
      features: string[];
    };
  };
  usage: {
    tracking: boolean;
    metrics: UsageMetric[];
    retention: number;
  };
  invoicing: {
    enabled: boolean;
    provider: 'stripe' | 'paddle' | 'chargebee';
    automation: boolean;
    templates: InvoiceTemplate[];
  };
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number>;
  metadata: Record<string, any>;
}

export interface UsageMetric {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  unit: string;
  aggregation: 'sum' | 'avg' | 'max' | 'min';
  retention: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  locale: string;
}

export interface ComplianceConfiguration {
  gdpr: {
    enabled: boolean;
    dataProcessing: boolean;
    consentManagement: boolean;
    rightToBeForgotten: boolean;
    dataPortability: boolean;
  };
  soc2: {
    enabled: boolean;
    controls: SOC2Control[];
    audits: SOC2Audit[];
    reporting: boolean;
  };
  auditLogs: {
    enabled: boolean;
    retention: number;
    encryption: boolean;
    immutable: boolean;
  };
}

export interface SOC2Control {
  id: string;
  name: string;
  category: 'security' | 'availability' | 'processing' | 'confidentiality' | 'privacy';
  description: string;
  implemented: boolean;
  evidence: string[];
  lastTested: Date;
}

export interface SOC2Audit {
  id: string;
  name: string;
  type: 'internal' | 'external';
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  findings: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface CLITool {
  name: string;
  description: string;
  commands: CLICommand[];
  configuration: CLIConfiguration;
}

export interface CLICommand {
  name: string;
  description: string;
  usage: string;
  options: CLIOption[];
  examples: string[];
}

export interface CLIOption {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface CLIConfiguration {
  configFile: string;
  environment: string[];
  authentication: {
    type: 'api_key' | 'oauth' | 'jwt';
    source: string;
  };
}

export interface SaaSFeatureMetrics {
  tenants: {
    total: number;
    active: number;
    trial: number;
    churned: number;
  };
  usage: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
    users: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  billing: {
    revenue: number;
    mrr: number;
    arr: number;
    ltv: number;
  };
}

export interface SaaSFeatureHealth {
  overall: boolean;
  components: {
    multiTenant: boolean;
    database: boolean;
    realtime: boolean;
    storage: boolean;
    api: boolean;
    billing: boolean;
    compliance: boolean;
  };
  issues: HealthIssue[];
}

export interface HealthIssue {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface ProvisioningRequest {
  id: string;
  tenantId: string;
  type: 'create' | 'update' | 'delete' | 'migrate';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  configuration: Record<string, any>;
  steps: ProvisioningStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProvisioningStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  error?: string;
  logs: string[];
}

export interface MigrationPlan {
  id: string;
  tenantId: string;
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  rollback: boolean;
  createdAt: Date;
  scheduledAt?: Date;
}

export interface MigrationStep {
  id: string;
  name: string;
  type: 'sql' | 'data' | 'config' | 'service';
  script: string;
  checksum: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface BackupConfiguration {
  enabled: boolean;
  schedule: string;
  retention: number;
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    location: string;
    encryption: boolean;
  };
  databases: string[];
  compression: boolean;
}

export interface MonitoringConfiguration {
  metrics: {
    enabled: boolean;
    interval: number;
    retention: number;
    aggregation: string[];
  };
  alerts: {
    enabled: boolean;
    channels: AlertChannel[];
    rules: AlertRule[];
  };
  dashboards: {
    enabled: boolean;
    templates: DashboardTemplate[];
  };
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  enabled: boolean;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'log';
  title: string;
  query: string;
  visualization: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: Array<{
    widgetId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}
