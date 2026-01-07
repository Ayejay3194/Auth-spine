/**
 * Type definitions for Supabase SaaS Features Pack
 */

export interface SaasFeaturesConfig {
  capabilityMap: CapabilityMapConfig;
  multiTenant: MultiTenantConfig;
  advancedDb: AdvancedDbConfig;
  realtime: RealtimeConfig;
  storage: StorageConfig;
  api: ApiConfig;
  billing: BillingConfig;
  compliance: ComplianceConfig;
  cli: CliConfig;
}

export interface CapabilityMapConfig {
  enabled: boolean;
  features: boolean;
  mapping: boolean;
  documentation: boolean;
}

export interface MultiTenantConfig {
  enabled: boolean;
  resolution: boolean;
  middleware: boolean;
  migrations: boolean;
  rls: boolean;
}

export interface AdvancedDbConfig {
  enabled: boolean;
  softDelete: boolean;
  auditTrail: boolean;
  versioning: boolean;
  hierarchy: boolean;
}

export interface RealtimeConfig {
  enabled: boolean;
  chat: boolean;
  presence: boolean;
  notifications: boolean;
}

export interface StorageConfig {
  enabled: boolean;
  policies: boolean;
  media: boolean;
  thumbnails: boolean;
}

export interface ApiConfig {
  enabled: boolean;
  keys: boolean;
  webhooks: boolean;
  replayProtection: boolean;
}

export interface BillingConfig {
  enabled: boolean;
  plans: boolean;
  gating: boolean;
  webhooks: boolean;
}

export interface ComplianceConfig {
  enabled: boolean;
  dataExport: boolean;
  dataDeletion: boolean;
  impersonation: boolean;
}

export interface CliConfig {
  enabled: boolean;
  local: boolean;
  structure: boolean;
  tools: boolean;
}

export interface SaasFeaturesMetrics {
  capabilityMap: CapabilityMapMetrics;
  multiTenant: MultiTenantMetrics;
  advancedDb: AdvancedDbMetrics;
  realtime: RealtimeMetrics;
  storage: StorageMetrics;
  api: ApiMetrics;
  billing: BillingMetrics;
  compliance: ComplianceMetrics;
  cli: CliMetrics;
  overall: {
    featureCoverage: number;
    implementationProgress: number;
    integrationScore: number;
    maturityLevel: number;
  };
}

export interface CapabilityMapMetrics {
  featuresMapped: number;
  documentationCreated: number;
  mappingAccuracy: number;
  coveragePercentage: number;
}

export interface MultiTenantMetrics {
  tenantsActive: number;
  resolutionEfficiency: number;
  middlewarePerformance: number;
  rlsPoliciesApplied: number;
}

export interface AdvancedDbMetrics {
  softDeleteImplemented: number;
  auditTrailEntries: number;
  versionedRecords: number;
  hierarchyNodes: number;
}

export interface RealtimeMetrics {
  chatMessages: number;
  presenceUpdates: number;
  notificationsSent: number;
  connectionsActive: number;
}

export interface StorageMetrics {
  policiesCreated: number;
  mediaFilesStored: number;
  thumbnailsGenerated: number;
  storageUsed: number;
}

export interface ApiMetrics {
  keysGenerated: number;
  webhooksProcessed: number;
  replayPrevented: number;
  apiCalls: number;
}

export interface BillingMetrics {
  plansActive: number;
  gatingRules: number;
  webhookEvents: number;
  revenueProcessed: number;
}

export interface ComplianceMetrics {
  dataExports: number;
  dataDeletions: number;
  impersonationSessions: number;
  complianceScore: number;
}

export interface CliMetrics {
  localProjects: number;
  structureValidated: number;
  toolsUsed: number;
  commandsExecuted: number;
}

export interface SaaSCapability {
  id: string;
  name: string;
  category: string;
  description: string;
  features: SaaSFeature[];
  implementation: ImplementationDetails;
  dependencies: string[];
  status: 'planned' | 'in-progress' | 'completed' | 'deprecated';
}

export interface SaaSFeature {
  id: string;
  name: string;
  description: string;
  type: 'core' | 'advanced' | 'enterprise';
  priority: 'low' | 'medium' | 'high' | 'critical';
  implemented: boolean;
  tested: boolean;
  documented: boolean;
}

export interface ImplementationDetails {
  components: Component[];
  migrations: Migration[];
  functions: EdgeFunction[];
  policies: StoragePolicy[];
}

export interface Component {
  id: string;
  name: string;
  type: 'middleware' | 'service' | 'utility' | 'interface';
  language: 'typescript' | 'sql' | 'javascript';
  path: string;
  status: 'draft' | 'complete' | 'tested';
}

export interface Migration {
  id: string;
  name: string;
  version: string;
  applied: boolean;
  appliedAt?: Date;
  rollback: boolean;
}

export interface EdgeFunction {
  id: string;
  name: string;
  runtime: 'deno' | 'node';
  memory: number;
  timeout: number;
  deployed: boolean;
}

export interface StoragePolicy {
  id: string;
  name: string;
  bucket: string;
  type: 'select' | 'insert' | 'update' | 'delete';
  definition: string;
  active: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: TenantSettings;
  metadata: TenantMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  dataIsolation: boolean;
  customDomain: boolean;
  branding: TenantBranding;
  limits: TenantLimits;
}

export interface TenantBranding {
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface TenantLimits {
  users: number;
  storage: number;
  bandwidth: number;
  apiCalls: number;
}

export interface TenantMetadata {
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  plan: string;
  features: string[];
}

export interface DatabasePattern {
  id: string;
  name: string;
  type: 'soft-delete' | 'audit-trail' | 'versioning' | 'hierarchy';
  description: string;
  implementation: PatternImplementation;
  tables: string[];
  triggers: DatabaseTrigger[];
}

export interface PatternImplementation {
  sql: string;
  functions: DatabaseFunction[];
  indexes: DatabaseIndex[];
  constraints: DatabaseConstraint[];
}

export interface DatabaseTrigger {
  id: string;
  name: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  timing: 'BEFORE' | 'AFTER';
  function: string;
  active: boolean;
}

export interface DatabaseFunction {
  id: string;
  name: string;
  language: 'sql' | 'plpgsql';
  parameters: FunctionParameter[];
  returnType: string;
  body: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
  mode: 'IN' | 'OUT' | 'INOUT';
  default?: any;
}

export interface DatabaseIndex {
  id: string;
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface DatabaseConstraint {
  id: string;
  name: string;
  table: string;
  type: 'primary' | 'foreign' | 'unique' | 'check';
  definition: string;
}

export interface RealtimeFeature {
  id: string;
  name: string;
  type: 'chat' | 'presence' | 'notification';
  channel: string;
  schema: RealtimeSchema;
  permissions: RealtimePermission[];
}

export interface RealtimeSchema {
  tables: string[];
  events: string[];
  filters: RealtimeFilter[];
}

export interface RealtimeFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
  value: any;
}

export interface RealtimePermission {
  role: string;
  canRead: boolean;
  canWrite: boolean;
  filters: RealtimeFilter[];
}

export interface StorageFeature {
  id: string;
  name: string;
  type: 'policy' | 'transformation' | 'cdn';
  bucket: string;
  configuration: StorageConfiguration;
  performance: StoragePerformance;
}

export interface StorageConfiguration {
  allowedMimeTypes: string[];
  maxFileSize: number;
  transformations: Transformation[];
  cdn: CDNConfiguration;
}

export interface Transformation {
  name: string;
  type: 'resize' | 'crop' | 'compress' | 'format';
  parameters: Record<string, any>;
}

export interface CDNConfiguration {
  enabled: boolean;
  domain: string;
  cacheTTL: number;
  compression: boolean;
}

export interface StoragePerformance {
  uploadSpeed: number;
  downloadSpeed: number;
  compressionRatio: number;
  cacheHitRate: number;
}

export interface ApiFeature {
  id: string;
  name: string;
  type: 'key-management' | 'webhook' | 'rate-limiting';
  configuration: ApiConfiguration;
  security: ApiSecurity;
  monitoring: ApiMonitoring;
}

export interface ApiConfiguration {
  authentication: 'api-key' | 'jwt' | 'oauth';
  rateLimit: RateLimit;
  versioning: boolean;
  documentation: boolean;
}

export interface RateLimit {
  requests: number;
  window: number;
  strategy: 'fixed' | 'sliding' | 'token-bucket';
}

export interface ApiSecurity {
  encryption: boolean;
  signing: boolean;
  replayProtection: boolean;
  ipWhitelist: string[];
}

export interface ApiMonitoring {
  logging: boolean;
  metrics: boolean;
  tracing: boolean;
  alerting: boolean;
}

export interface BillingFeature {
  id: string;
  name: string;
  type: 'subscription' | 'usage-based' | 'one-time';
  plans: BillingPlan[];
  gates: BillingGate[];
  webhooks: BillingWebhook[];
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: BillingLimits;
}

export interface BillingLimits {
  users: number;
  storage: number;
  bandwidth: number;
  apiCalls: number;
  features: string[];
}

export interface BillingGate {
  id: string;
  feature: string;
  condition: string;
  action: 'allow' | 'deny' | 'upgrade';
  message: string;
}

export interface BillingWebhook {
  id: string;
  event: string;
  url: string;
  secret: string;
  retries: number;
}

export interface ComplianceFeature {
  id: string;
  name: string;
  type: 'data-export' | 'data-deletion' | 'impersonation';
  configuration: ComplianceConfiguration;
  audit: ComplianceAudit;
}

export interface ComplianceConfiguration {
  retention: number;
  encryption: boolean;
  accessControl: boolean;
  logging: boolean;
}

export interface ComplianceAudit {
  enabled: boolean;
  events: string[];
  retention: number;
  export: boolean;
}

export interface CliFeature {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'hybrid';
  commands: CliCommand[];
  structure: ProjectStructure;
  tools: CliTool[];
}

export interface CliCommand {
  name: string;
  description: string;
  usage: string;
  options: CliOption[];
  examples: string[];
}

export interface CliOption {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  default?: any;
  description: string;
}

export interface ProjectStructure {
  directories: string[];
  templates: string[];
  configurations: string[];
  scripts: string[];
}

export interface CliTool {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  path: string;
}
