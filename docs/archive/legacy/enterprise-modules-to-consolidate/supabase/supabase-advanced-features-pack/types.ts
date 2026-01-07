/**
 * Type definitions for Supabase Advanced Features Pack
 */

export interface SupabaseAdvancedConfig {
  auth: AdvancedAuthConfig;
  realtime: RealtimeConfig;
  storage: StorageConfig;
  edgeFunctions: EdgeFunctionsConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface AdvancedAuthConfig {
  enabled: boolean;
  multiFactor: boolean;
  sso: boolean;
  rbac: boolean;
  sessionManagement: boolean;
  passwordPolicies: boolean;
}

export interface RealtimeConfig {
  enabled: boolean;
  presence: boolean;
  broadcast: boolean;
  channels: boolean;
  collaboration: boolean;
}

export interface StorageConfig {
  enabled: boolean;
  cdn: boolean;
  transformations: boolean;
  encryption: boolean;
  versioning: boolean;
  policies: boolean;
}

export interface EdgeFunctionsConfig {
  enabled: boolean;
  scheduled: boolean;
  webhooks: boolean;
  caching: boolean;
  monitoring: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  logs: boolean;
  alerts: boolean;
  dashboards: boolean;
}

export interface SecurityConfig {
  enabled: boolean;
  rls: boolean;
  audit: boolean;
  encryption: boolean;
  accessControl: boolean;
}

export interface SupabaseAdvancedMetrics {
  auth: AuthMetrics;
  realtime: RealtimeMetrics;
  storage: StorageMetrics;
  edgeFunctions: EdgeFunctionsMetrics;
  monitoring: MonitoringMetrics;
  security: SecurityMetrics;
  overall: {
    performance: number;
    reliability: number;
    security: number;
    usage: number;
  };
}

export interface AuthMetrics {
  activeUsers: number;
  mfaUsage: number;
  ssoLogins: number;
  sessionDuration: number;
  authEvents: number;
  failedAttempts: number;
}

export interface RealtimeMetrics {
  activeConnections: number;
  messagesExchanged: number;
  presenceUpdates: number;
  broadcastEvents: number;
  channelSubscriptions: number;
  collaborationSessions: number;
}

export interface StorageMetrics {
  filesStored: number;
  storageUsed: number;
  cdnRequests: number;
  transformations: number;
  encryptionOperations: number;
  policyEnforcements: number;
}

export interface EdgeFunctionsMetrics {
  functionInvocations: number;
  executionTime: number;
  scheduledExecutions: number;
  webhookCalls: number;
  cacheHits: number;
  errorRate: number;
}

export interface MonitoringMetrics {
  metricsCollected: number;
  logEntries: number;
  alertsTriggered: number;
  dashboardViews: number;
  queryPerformance: number;
  systemHealth: number;
}

export interface SecurityMetrics {
  rlsPolicies: number;
  auditEvents: number;
  encryptionOperations: number;
  accessControlChecks: number;
  securityIncidents: number;
  complianceScore: number;
}

export interface AdvancedAuthFeature {
  id: string;
  name: string;
  type: 'mfa' | 'sso' | 'rbac' | 'session' | 'password';
  enabled: boolean;
  configured: boolean;
  metrics: FeatureMetrics;
  configuration: any;
}

export interface FeatureMetrics {
  usage: number;
  performance: number;
  reliability: number;
  lastUpdated: Date;
}

export interface RealtimeChannel {
  id: string;
  name: string;
  type: 'presence' | 'broadcast' | 'collaboration';
  members: number;
  messages: number;
  created: Date;
  lastActivity: Date;
}

export interface StoragePolicy {
  id: string;
  name: string;
  type: 'upload' | 'download' | 'transform';
  bucket: string;
  rules: PolicyRule[];
  enabled: boolean;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny';
  priority: number;
}

export interface EdgeFunction {
  id: string;
  name: string;
  runtime: 'deno' | 'node';
  memory: number;
  timeout: number;
  schedule?: string;
  webhook?: WebhookConfig;
  metrics: FunctionMetrics;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  retries: number;
}

export interface FunctionMetrics {
  invocations: number;
  averageDuration: number;
  errorRate: number;
  lastInvoked: Date;
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  type: 'performance' | 'usage' | 'security' | 'custom';
  widgets: DashboardWidget[];
  refreshRate: number;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'log';
  title: string;
  query: string;
  configuration: any;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'rls' | 'audit' | 'encryption' | 'access';
  table?: string;
  rules: SecurityRule[];
  enabled: boolean;
}

export interface SecurityRule {
  id: string;
  role: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface SupabaseFeature {
  id: string;
  name: string;
  category: 'auth' | 'database' | 'storage' | 'functions' | 'realtime';
  description: string;
  enabled: boolean;
  configured: boolean;
  metrics: FeatureMetrics;
  dependencies: string[];
}

export interface AdvancedConfiguration {
  project: {
    id: string;
    region: string;
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  features: SupabaseFeature[];
  monitoring: MonitoringConfiguration;
  security: SecurityConfiguration;
}

export interface MonitoringConfiguration {
  enabled: boolean;
  retention: number;
  alerts: AlertConfiguration[];
  dashboards: MonitoringDashboard[];
}

export interface AlertConfiguration {
  id: string;
  name: string;
  type: 'performance' | 'error' | 'usage' | 'security';
  condition: string;
  threshold: number;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'slack' | 'webhook';
  destination: string;
  enabled: boolean;
}

export interface SecurityConfiguration {
  rls: {
    enabled: boolean;
    policies: SecurityPolicy[];
  };
  audit: {
    enabled: boolean;
    retention: number;
    events: string[];
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotation: number;
  };
  access: {
    enabled: boolean;
    roles: string[];
    permissions: PermissionConfig[];
  };
}

export interface PermissionConfig {
  role: string;
  permissions: string[];
  tables: string[];
  operations: ('select' | 'insert' | 'update' | 'delete')[];
}
