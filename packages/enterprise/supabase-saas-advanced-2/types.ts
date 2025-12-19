/**
 * Type definitions for Supabase SaaS Advanced Pack 2
 */

export interface SupabaseSaaSAdvanced2Config {
  nextjs: {
    enabled: boolean;
    appDir: boolean;
    middleware: boolean;
    apiRoutes: boolean;
    pages: {
      dashboard: boolean;
      billing: boolean;
      settings: boolean;
      admin: boolean;
    };
  };
  database: {
    advanced: boolean;
    pooling: boolean;
    ssl: boolean;
    backups: boolean;
    monitoring: boolean;
  };
  auth: {
    mfa: boolean;
    sso: boolean;
    rbac: boolean;
    sessions: boolean;
    providers: string[];
  };
  storage: {
    cdn: boolean;
    transformations: boolean;
    encryption: boolean;
    versioning: boolean;
    multiRegion: boolean;
  };
  functions: {
    edge: boolean;
    scheduled: boolean;
    webhooks: boolean;
    caching: boolean;
    monitoring: boolean;
  };
  realtime: {
    presence: boolean;
    broadcast: boolean;
    collaboration: boolean;
    notifications: boolean;
    channels: boolean;
  };
}

export interface NextJSIntegration {
  app: NextJSApp;
  middleware: NextJSMiddleware;
  api: NextJSAPI;
  pages: NextJSPages;
}

export interface NextJSApp {
  enabled: boolean;
  layout: string;
  routing: 'app' | 'pages';
  components: NextJSComponents;
  styles: NextJSStyles;
}

export interface NextJSMiddleware {
  enabled: boolean;
  auth: boolean;
  tenant: boolean;
  rateLimit: boolean;
  cors: boolean;
}

export interface NextJSAPI {
  enabled: boolean;
  routes: APIRoute[];
  middleware: APIMiddleware[];
  validation: APIValidation;
}

export interface NextJSPages {
  dashboard: DashboardPage;
  billing: BillingPage;
  settings: SettingsPage;
  admin: AdminPage;
}

export interface NextJSComponents {
  layout: LayoutComponent;
  auth: AuthComponent;
  tenant: TenantComponent;
  billing: BillingComponent;
}

export interface NextJSStyles {
  theme: ThemeConfig;
  components: ComponentStyles;
  responsive: ResponsiveConfig;
}

export interface APIRoute {
  path: string;
  method: string[];
  handler: string;
  middleware: string[];
  validation: ValidationSchema;
}

export interface APIMiddleware {
  name: string;
  handler: string;
  order: number;
}

export interface APIValidation {
  schema: ValidationSchema;
  sanitizer: SanitizerConfig;
}

export interface ValidationSchema {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, any>;
}

export interface SanitizerConfig {
  enabled: boolean;
  rules: SanitizationRule[];
}

export interface SanitizationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'html';
  required: boolean;
  sanitize: boolean;
}

export interface DashboardPage {
  enabled: boolean;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  permissions: string[];
}

export interface BillingPage {
  enabled: boolean;
  plans: BillingPlan[];
  invoices: InvoiceConfig;
  payments: PaymentConfig;
}

export interface SettingsPage {
  enabled: boolean;
  sections: SettingsSection[];
  validation: SettingsValidation;
}

export interface AdminPage {
  enabled: boolean;
  modules: AdminModule[];
  permissions: AdminPermissions;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  title: string;
  dataSource: string;
  config: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: WidgetLayout[];
}

export interface WidgetLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number>;
  popular?: boolean;
}

export interface InvoiceConfig {
  enabled: boolean;
  templates: InvoiceTemplate[];
  automation: boolean;
}

export interface PaymentConfig {
  providers: PaymentProvider[];
  webhooks: boolean;
  refunds: boolean;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export interface PaymentProvider {
  name: string;
  type: 'stripe' | 'paddle' | 'paypal';
  config: Record<string, any>;
  enabled: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  fields: SettingsField[];
  permissions: string[];
}

export interface SettingsField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  validation: FieldValidation;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  custom?: string;
}

export interface SettingsValidation {
  enabled: boolean;
  rules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface AdminModule {
  id: string;
  name: string;
  icon: string;
  path: string;
  component: string;
  permissions: string[];
}

export interface AdminPermissions {
  roles: AdminRole[];
  permissions: AdminPermission[];
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
}

export interface LayoutComponent {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
  navigation: NavigationConfig;
}

export interface AuthComponent {
  login: boolean;
  register: boolean;
  forgot: boolean;
  mfa: boolean;
}

export interface TenantComponent {
  switcher: boolean;
  settings: boolean;
  users: boolean;
}

export interface BillingComponent {
  subscription: boolean;
  usage: boolean;
  invoices: boolean;
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colors: ColorPalette;
  typography: TypographyConfig;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: Record<string, number>;
  fontWeight: Record<string, number>;
}

export interface ComponentStyles {
  button: ButtonStyles;
  input: InputStyles;
  card: CardStyles;
  table: TableStyles;
}

export interface ButtonStyles {
  variant: string[];
  size: string[];
  fullWidth: boolean;
}

export interface InputStyles {
  variant: string[];
  size: string[];
  validation: boolean;
}

export interface CardStyles {
  elevation: number;
  border: boolean;
  shadow: boolean;
}

export interface TableStyles {
  striped: boolean;
  hover: boolean;
  pagination: boolean;
}

export interface ResponsiveConfig {
  breakpoints: Record<string, number>;
  container: ContainerConfig;
  grid: GridConfig;
}

export interface ContainerConfig {
  maxWidth: Record<string, number>;
  padding: Record<string, number>;
}

export interface GridConfig {
  columns: number;
  gap: number;
}

export interface AdvancedDatabaseConfig {
  pooling: PoolingConfig;
  ssl: SSLConfig;
  backups: BackupConfig;
  monitoring: MonitoringConfig;
}

export interface PoolingConfig {
  enabled: boolean;
  minConnections: number;
  maxConnections: number;
  idleTimeout: number;
}

export interface SSLConfig {
  enabled: boolean;
  mode: 'require' | 'prefer' | 'disable';
  cert: string;
  key: string;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  storage: BackupStorage;
}

export interface BackupStorage {
  type: 'local' | 's3' | 'gcs' | 'azure';
  config: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  logs: boolean;
  alerts: boolean;
}

export interface AdvancedAuthConfig {
  mfa: MFAConfig;
  sso: SSOConfig;
  rbac: RBACConfig;
  sessions: SessionConfig;
}

export interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email' | 'backup')[];
  required: boolean;
}

export interface SSOConfig {
  enabled: boolean;
  providers: SSOProvider[];
  mapping: FieldMapping;
}

export interface SSOProvider {
  name: string;
  type: 'saml' | 'oidc' | 'oauth2';
  config: Record<string, any>;
}

export interface FieldMapping {
  email: string;
  name: string;
  roles: string;
}

export interface RBACConfig {
  enabled: boolean;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface SessionConfig {
  timeout: number;
  refresh: boolean;
  storage: 'cookie' | 'localStorage';
}

export interface AdvancedStorageConfig {
  cdn: CDNConfig;
  transformations: TransformConfig;
  encryption: EncryptionConfig;
  versioning: VersioningConfig;
  multiRegion: MultiRegionConfig;
}

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'cloudfront' | 'fastly';
  distribution: string;
  cache: CacheConfig;
}

export interface CacheConfig {
  ttl: number;
  headers: string[];
  bypass: string[];
}

export interface TransformConfig {
  enabled: boolean;
  formats: ('webp' | 'avif' | 'jpg' | 'png')[];
  sizes: Array<{ width: number; height: number }>;
  quality: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  key: string;
}

export interface VersioningConfig {
  enabled: boolean;
  maxVersions: number;
  cleanup: boolean;
}

export interface MultiRegionConfig {
  enabled: boolean;
  regions: Region[];
  replication: ReplicationConfig;
}

export interface Region {
  id: string;
  name: string;
  endpoint: string;
  primary: boolean;
}

export interface ReplicationConfig {
  mode: 'sync' | 'async';
  lag: number;
  failover: boolean;
}

export interface AdvancedFunctionsConfig {
  edge: EdgeConfig;
  scheduled: ScheduledConfig;
  webhooks: WebhookConfig;
  caching: CachingConfig;
  monitoring: FunctionsMonitoringConfig;
}

export interface EdgeConfig {
  enabled: boolean;
  regions: string[];
  runtime: 'deno' | 'node';
}

export interface ScheduledConfig {
  enabled: boolean;
  jobs: ScheduledJob[];
  timezone: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  function: string;
  enabled: boolean;
}

export interface WebhookConfig {
  enabled: boolean;
  endpoints: WebhookEndpoint[];
  retries: number;
  timeout: number;
}

export interface WebhookEndpoint {
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'lru' | 'fifo' | 'ttl';
  size: number;
}

export interface FunctionsMonitoringConfig {
  enabled: boolean;
  metrics: boolean;
  logs: boolean;
  traces: boolean;
}

export interface AdvancedRealtimeConfig {
  presence: PresenceConfig;
  broadcast: BroadcastConfig;
  collaboration: CollaborationConfig;
  notifications: NotificationConfig;
  channels: ChannelConfig;
}

export interface PresenceConfig {
  enabled: boolean;
  heartbeat: number;
  timeout: number;
}

export interface BroadcastConfig {
  enabled: boolean;
  channels: string[];
  authorization: boolean;
}

export interface CollaborationConfig {
  enabled: boolean;
  features: CollaborationFeature[];
  conflict: ConflictResolution;
}

export interface CollaborationFeature {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'operational-transform' | 'crdt';
  enabled: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: string;
  template: string;
  variables: string[];
}

export interface ChannelConfig {
  enabled: boolean;
  private: boolean;
  presence: boolean;
  broadcast: boolean;
}

export interface EnterpriseFeatures {
  analytics: AnalyticsConfig;
  audit: AuditConfig;
  compliance: ComplianceConfig;
  scalability: ScalabilityConfig;
}

export interface AnalyticsConfig {
  enabled: boolean;
  providers: AnalyticsProvider[];
  tracking: TrackingConfig;
}

export interface AnalyticsProvider {
  name: string;
  type: 'google' | 'mixpanel' | 'amplitude' | 'custom';
  config: Record<string, any>;
}

export interface TrackingConfig {
  events: string[];
  properties: Record<string, any>;
  consent: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  events: AuditEvent[];
  retention: number;
}

export interface AuditEvent {
  type: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceConfig {
  frameworks: ComplianceFramework[];
  controls: ComplianceControl[];
  reporting: ComplianceReporting;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  enabled: boolean;
}

export interface ComplianceControl {
  id: string;
  name: string;
  category: string;
  implemented: boolean;
}

export interface ComplianceReporting {
  enabled: boolean;
  schedule: string;
  format: 'json' | 'pdf' | 'csv';
}

export interface ScalabilityConfig {
  autoScaling: boolean;
  loadBalancing: boolean;
  caching: boolean;
  cdn: boolean;
}

export interface PerformanceOptimization {
  caching: OptimizationCaching;
  compression: CompressionConfig;
  minification: MinificationConfig;
  bundling: BundlingConfig;
}

export interface OptimizationCaching {
  enabled: boolean;
  strategy: 'memory' | 'redis' | 'disk';
  ttl: number;
  maxSize: number;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'brotli' | 'zstd';
  level: number;
}

export interface MinificationConfig {
  enabled: boolean;
  html: boolean;
  css: boolean;
  js: boolean;
}

export interface BundlingConfig {
  enabled: boolean;
  strategy: 'webpack' | 'vite' | 'rollup';
  optimization: boolean;
}

export interface SecurityEnhancements {
  headers: SecurityHeaders;
  csrf: CSRFConfig;
  rateLimit: RateLimitConfig;
  encryption: SecurityEncryption;
}

export interface SecurityHeaders {
  enabled: boolean;
  headers: Record<string, string>;
}

export interface CSRFConfig {
  enabled: boolean;
  token: boolean;
  sameSite: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number;
  strategy: 'fixed' | 'sliding' | 'token-bucket';
}

export interface SecurityEncryption {
  enabled: boolean;
  algorithm: string;
  keyRotation: boolean;
}
