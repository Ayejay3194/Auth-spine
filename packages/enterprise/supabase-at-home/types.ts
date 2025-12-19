/**
 * Type definitions for Supabase At Home Pack
 */

export interface SupabaseAtHomeConfig {
  docker: {
    enabled: boolean;
    compose: string;
    services: string[];
    ports: {
      postgres: number;
      kong: number;
      supabase: number;
      studio: number;
    };
  };
  kong: {
    enabled: boolean;
    adminPort: number;
    proxyPort: number;
    plugins: string[];
    routes: KongRoute[];
  };
  development: {
    hotReload: boolean;
    watchFiles: string[];
    autoMigrate: boolean;
    seedData: boolean;
  };
  monitoring: {
    enabled: boolean;
    metrics: boolean;
    logs: boolean;
    healthChecks: boolean;
  };
}

export interface LocalDevelopmentEnvironment {
  docker: DockerEnvironment;
  kong: KongEnvironment;
  supabase: SupabaseEnvironment;
  development: DevelopmentEnvironment;
  monitoring: MonitoringEnvironment;
}

export interface DockerEnvironment {
  running: boolean;
  containers: Map<string, DockerContainer>;
  networks: Map<string, DockerNetwork>;
  volumes: Map<string, DockerVolume>;
  compose: DockerCompose;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error';
  ports: Map<number, number>;
  environment: Record<string, string>;
  health: ContainerHealth;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  containers: string[];
}

export interface DockerVolume {
  id: string;
  name: string;
  driver: string;
  mountPoint: string;
}

export interface DockerCompose {
  file: string;
  version: string;
  services: Map<string, ComposeService>;
  networks: Map<string, ComposeNetwork>;
  volumes: Map<string, ComposeVolume>;
}

export interface ComposeService {
  image: string;
  ports: string[];
  environment: Record<string, string>;
  volumes: string[];
  depends_on: string[];
  healthcheck: HealthCheck;
}

export interface ComposeNetwork {
  driver: string;
  external: boolean;
}

export interface ComposeVolume {
  external: boolean;
  driver: string;
}

export interface ContainerHealth {
  status: 'healthy' | 'unhealthy' | 'starting';
  lastCheck: Date;
  exitCode: number;
  logs: string[];
}

export interface HealthCheck {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  startPeriod: string;
}

export interface KongEnvironment {
  admin: KongAdmin;
  proxy: KongProxy;
  plugins: Map<string, KongPlugin>;
  routes: Map<string, KongRoute>;
  services: Map<string, KongService>;
  consumers: Map<string, KongConsumer>;
}

export interface KongAdmin {
  url: string;
  port: number;
  version: string;
  status: 'running' | 'stopped' | 'error';
}

export interface KongProxy {
  url: string;
  port: number;
  status: 'running' | 'stopped' | 'error';
  upstreams: Map<string, KongUpstream>;
}

export interface KongPlugin {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  service?: string;
  route?: string;
  consumer?: string;
}

export interface KongRoute {
  id: string;
  name: string;
  paths: string[];
  methods: string[];
  hosts: string[];
  protocols: string[];
  strip_path: boolean;
  preserve_host: boolean;
  service: string;
}

export interface KongService {
  id: string;
  name: string;
  url: string;
  protocol: string;
  host: string;
  port: number;
  path: string;
  retries: number;
  connect_timeout: number;
  write_timeout: number;
  read_timeout: number;
}

export interface KongConsumer {
  id: string;
  username: string;
  custom_id: string;
  plugins: string[];
  jwt_secrets: JWTSecret[];
  keyauth_credentials: KeyAuthCredential[];
}

export interface JWTSecret {
  key: string;
  secret: string;
  algorithm: string;
}

export interface KeyAuthCredential {
  id: string;
  key: string;
  created_at: number;
}

export interface KongUpstream {
  id: string;
  name: string;
  algorithm: string;
  hash_on: string;
  hash_fallback: string;
  hash_on_cookie: string;
  healthchecks: {
    active: {
      http_path: string;
      healthy: {
        interval: number;
        successes: number;
        http_statuses: number[];
      };
      unhealthy: {
        interval: number;
        http_failures: number;
        http_statuses: number[];
        tcp_failures: number;
        timeout: number;
      };
    };
    passive: {
      healthy: {
        http_statuses: number[];
        successes: number;
      };
      unhealthy: {
        http_statuses: number[];
        tcp_failures: number;
        timeouts: number;
        http_failures: number;
      };
    };
  };
  slots: number;
}

export interface SupabaseEnvironment {
  url: string;
  anonKey: string;
  serviceKey: string;
  db: DatabaseConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  functions: FunctionsConfig;
  realtime: RealtimeConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  migrations: Migration[];
}

export interface AuthConfig {
  url: string;
  jwtSecret: string;
  refreshTokenExpiry: number;
  accessTokenExpiry: number;
  enabledProviders: string[];
  externalProviders: ExternalProvider[];
}

export interface ExternalProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

export interface StorageConfig {
  url: string;
  buckets: StorageBucket[];
  policies: StoragePolicy[];
  fileSizeLimit: number;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}

export interface StoragePolicy {
  id: string;
  name: string;
  definition: string;
  operations: string[];
  roles: string[];
}

export interface FunctionsConfig {
  url: string;
  functions: SupabaseFunction[];
  secrets: Record<string, string>;
}

export interface SupabaseFunction {
  name: string;
  verifyJwt: boolean;
  importMap: string;
  secrets: string[];
}

export interface RealtimeConfig {
  url: string;
  channels: RealtimeChannel[];
  maxConnections: number;
  heartbeatInterval: number;
}

export interface RealtimeChannel {
  name: string;
  broadcast: boolean;
  presence: boolean;
  postgresChanges: PostgresChange[];
}

export interface PostgresChange {
  event: string;
  schema: string;
  table: string;
  filter?: string;
}

export interface DevelopmentEnvironment {
  hotReload: boolean;
  watchFiles: string[];
  watchers: FileWatcher[];
  scripts: DevScript[];
  autoMigrate: boolean;
  seedData: boolean;
}

export interface FileWatcher {
  pattern: string;
  events: string[];
  command: string;
  debounce: number;
}

export interface DevScript {
  name: string;
  description: string;
  command: string;
  watch: boolean;
  env: Record<string, string>;
}

export interface MonitoringEnvironment {
  metrics: MetricsConfig;
  logs: LogsConfig;
  healthChecks: HealthCheckConfig;
  alerts: AlertConfig;
}

export interface MetricsConfig {
  enabled: boolean;
  port: number;
  path: string;
  collectors: string[];
  retention: number;
}

export interface LogsConfig {
  enabled: boolean;
  level: string;
  format: string;
  outputs: LogOutput[];
  retention: number;
}

export interface LogOutput {
  type: 'console' | 'file' | 'elasticsearch' | 'loki';
  config: Record<string, any>;
}

export interface HealthCheckConfig {
  enabled: boolean;
  endpoints: HealthEndpoint[];
  interval: number;
  timeout: number;
}

export interface HealthEndpoint {
  name: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  expectedStatus: number;
  timeout: number;
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
}

export interface AlertChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
}

export interface Migration {
  version: string;
  name: string;
  sql: string;
  executed: boolean;
  executedAt?: Date;
}

export interface DevServer {
  name: string;
  port: number;
  host: string;
  protocol: 'http' | 'https';
  ssl?: SSLConfig;
  proxy?: ProxyConfig;
}

export interface SSLConfig {
  cert: string;
  key: string;
  ca?: string;
}

export interface ProxyConfig {
  target: string;
  rewrite: Record<string, string>;
  headers: Record<string, string>;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
  description?: string;
  required: boolean;
  secret: boolean;
}

export interface ServiceConfig {
  name: string;
  image: string;
  tag: string;
  ports: ServicePort[];
  environment: EnvironmentVariable[];
  volumes: VolumeMount[];
  dependsOn: string[];
  healthCheck?: HealthCheck;
  resources?: ResourceLimits;
}

export interface ServicePort {
  container: number;
  host: number;
  protocol: 'tcp' | 'udp';
}

export interface VolumeMount {
  source: string;
  target: string;
  type: 'bind' | 'volume';
  readOnly: boolean;
}

export interface ResourceLimits {
  memory: string;
  cpu: string;
  disk: string;
}

export interface NetworkConfig {
  name: string;
  driver: string;
  subnet: string;
  gateway: string;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  storage: {
    type: 'local' | 's3' | 'gcs' | 'azure';
    config: Record<string, any>;
  };
  databases: string[];
  compression: boolean;
}

export interface SecurityConfig {
  cors: CORSConfig;
  rateLimit: RateLimitConfig;
  authentication: AuthConfig;
  encryption: EncryptionConfig;
}

export interface CORSConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number;
  burst: number;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyRotation: boolean;
}
