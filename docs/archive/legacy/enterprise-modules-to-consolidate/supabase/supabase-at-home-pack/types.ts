/**
 * Type definitions for Supabase At Home Pack
 */

export interface SupabaseAtHomeConfig {
  local: LocalDevelopmentConfig;
  database: DatabaseConfig;
  api: APIConfig;
  tools: ToolsConfig;
}

export interface LocalDevelopmentConfig {
  enabled: boolean;
  docker: boolean;
  hotReload: boolean;
  debugging: boolean;
  testing: boolean;
}

export interface DatabaseConfig {
  enabled: boolean;
  migrations: boolean;
  seeds: boolean;
  backups: boolean;
  monitoring: boolean;
}

export interface APIConfig {
  enabled: boolean;
  gateway: boolean;
  routing: boolean;
  middleware: boolean;
  documentation: boolean;
}

export interface ToolsConfig {
  enabled: boolean;
  cli: boolean;
  dashboard: boolean;
  logs: boolean;
  metrics: boolean;
}

export interface SupabaseAtHomeMetrics {
  local: LocalMetrics;
  database: DatabaseMetrics;
  api: APIMetrics;
  tools: ToolsMetrics;
  overall: {
    developmentSpeed: number;
    reliability: number;
    resourceUsage: number;
    productivity: number;
  };
}

export interface LocalMetrics {
  dockerContainers: number;
  hotReloadEvents: number;
  debuggingSessions: number;
  testRuns: number;
  buildTime: number;
}

export interface DatabaseMetrics {
  migrationsApplied: number;
  seedDataLoaded: number;
  backupsCreated: number;
  queryPerformance: number;
  connectionCount: number;
}

export interface APIMetrics {
  gatewayRequests: number;
  routesConfigured: number;
  middlewareExecuted: number;
  documentationViews: number;
  responseTime: number;
}

export interface ToolsMetrics {
  cliCommands: number;
  dashboardSessions: number;
  logEntries: number;
  metricsCollected: number;
  toolUsage: number;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  ports: number[];
  volumes: string[];
  environment: Record<string, string>;
  health: 'healthy' | 'unhealthy' | 'unknown';
}

export interface DatabaseMigration {
  id: string;
  name: string;
  version: string;
  applied: boolean;
  appliedAt?: Date;
  checksum: string;
  dependencies: string[];
}

export interface APIRoute {
  id: string;
  path: string;
  method: string;
  handler: string;
  middleware: string[];
  enabled: boolean;
  documentation: RouteDocumentation;
}

export interface RouteDocumentation {
  summary: string;
  description: string;
  parameters: RouteParameter[];
  responses: RouteResponse[];
  examples: any[];
}

export interface RouteParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface RouteResponse {
  code: number;
  description: string;
  schema: any;
}

export interface DevelopmentTool {
  id: string;
  name: string;
  type: 'cli' | 'dashboard' | 'monitoring' | 'testing';
  enabled: boolean;
  configuration: any;
  metrics: ToolMetrics;
}

export interface ToolMetrics {
  usage: number;
  performance: number;
  lastUsed: Date;
  errors: number;
}

export interface LocalEnvironment {
  id: string;
  name: string;
  type: 'development' | 'testing' | 'staging';
  status: 'active' | 'inactive' | 'error';
  containers: DockerContainer[];
  services: EnvironmentService[];
  configuration: EnvironmentConfiguration;
}

export interface EnvironmentService {
  id: string;
  name: string;
  type: 'database' | 'api' | 'auth' | 'storage' | 'functions';
  status: 'running' | 'stopped' | 'error';
  endpoint: string;
  health: ServiceHealth;
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  uptime: number;
  errors: number;
}

export interface EnvironmentConfiguration {
  database: DatabaseConfiguration;
  auth: AuthConfiguration;
  storage: StorageConfiguration;
  functions: FunctionsConfiguration;
  networking: NetworkingConfiguration;
}

export interface DatabaseConfiguration {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
}

export interface AuthConfiguration {
  siteUrl: string;
  jwtSecret: string;
  refreshTokenRotation: boolean;
  signUpDisabled: boolean;
  externalProviders: ExternalProvider[];
}

export interface ExternalProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export interface StorageConfiguration {
  fileSizeLimit: number;
  allowedMimeTypes: string[];
  buckets: StorageBucket[];
  cdn: CDNConfiguration;
}

export interface StorageBucket {
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

export interface CDNConfiguration {
  enabled: boolean;
  domain: string;
  cacheTTL: number;
}

export interface FunctionsConfiguration {
  runtime: 'deno' | 'node';
  memory: number;
  timeout: number;
  environment: Record<string, string>;
  secrets: FunctionSecret[];
}

export interface FunctionSecret {
  name: string;
  value: string;
  created: Date;
}

export interface NetworkingConfiguration {
  ports: PortConfiguration[];
  proxy: ProxyConfiguration;
  ssl: SSLConfiguration;
}

export interface PortConfiguration {
  name: string;
  container: number;
  host: number;
  protocol: 'tcp' | 'udp';
}

export interface ProxyConfiguration {
  enabled: boolean;
  rules: ProxyRule[];
}

export interface ProxyRule {
  path: string;
  target: string;
  rewrite: string;
}

export interface SSLConfiguration {
  enabled: boolean;
  certificate: string;
  privateKey: string;
}

export interface DevelopmentScript {
  id: string;
  name: string;
  type: 'setup' | 'teardown' | 'reset' | 'backup' | 'restore';
  script: string;
  parameters: ScriptParameter[];
  timeout: number;
}

export interface ScriptParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}
