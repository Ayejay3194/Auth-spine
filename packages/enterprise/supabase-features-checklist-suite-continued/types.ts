/**
 * Type definitions for Supabase Features Checklist Suite Continued
 */

export interface SupabaseFeaturesChecklistContinuedConfig {
  ai: AIConfig;
  catalog: CatalogConfig;
  functions: FunctionsConfig;
  observability: ObservabilityConfig;
  testing: TestingConfig;
}

export interface AIConfig {
  enabled: boolean;
  models: boolean;
  embeddings: boolean;
  completion: boolean;
  analysis: boolean;
}

export interface CatalogConfig {
  enabled: boolean;
  schemas: boolean;
  tables: boolean;
  relationships: boolean;
  documentation: boolean;
}

export interface FunctionsConfig {
  enabled: boolean;
  edge: boolean;
  database: boolean;
  webhooks: boolean;
  scheduled: boolean;
}

export interface ObservabilityConfig {
  enabled: boolean;
  metrics: boolean;
  logging: boolean;
  tracing: boolean;
  alerting: boolean;
}

export interface TestingConfig {
  enabled: boolean;
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: boolean;
}

export interface SupabaseFeaturesChecklistContinuedMetrics {
  ai: AIMetrics;
  catalog: CatalogMetrics;
  functions: FunctionsMetrics;
  observability: ObservabilityMetrics;
  testing: TestingMetrics;
  overall: {
    featureCoverage: number;
    implementationProgress: number;
    qualityScore: number;
    performanceScore: number;
  };
}

export interface AIMetrics {
  modelsDeployed: number;
  embeddingsProcessed: number;
  completionRequests: number;
  analysisTasks: number;
  modelAccuracy: number;
}

export interface CatalogMetrics {
  schemasManaged: number;
  tablesCataloged: number;
  relationshipsMapped: number;
  documentationCoverage: number;
  queryPerformance: number;
}

export interface FunctionsMetrics {
  edgeFunctionsDeployed: number;
  databaseFunctionsCreated: number;
  webhooksActive: number;
  scheduledTasksRunning: number;
  executionSuccessRate: number;
}

export interface ObservabilityMetrics {
  metricsCollected: number;
  logsAggregated: number;
  tracesGenerated: number;
  alertsTriggered: number;
  systemHealth: number;
}

export interface TestingMetrics {
  unitTestsPassed: number;
  integrationTestsPassed: number;
  e2eTestsPassed: number;
  performanceTestsPassed: number;
  codeCoverage: number;
}

export interface AIFeatures {
  models: AIModel[];
  embeddings: EmbeddingService[];
  completion: CompletionService[];
  analysis: AnalysisService[];
}

export interface AIModel {
  id: string;
  name: string;
  type: 'completion' | 'embedding' | 'classification' | 'generation';
  provider: 'openai' | 'anthropic' | 'cohere' | 'local';
  version: string;
  status: 'active' | 'inactive' | 'training' | 'deprecated';
  config: ModelConfig;
  performance: ModelPerformance;
  usage: ModelUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  systemPrompt: string;
}

export interface ModelPerformance {
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  lastEvaluated: Date;
}

export interface ModelUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  tokensProcessed: number;
  cost: number;
}

export interface EmbeddingService {
  id: string;
  name: string;
  model: string;
  provider: string;
  dimensions: number;
  status: 'active' | 'inactive';
  config: EmbeddingConfig;
  usage: EmbeddingUsage;
  performance: EmbeddingPerformance;
}

export interface EmbeddingConfig {
  batchSize: number;
  normalize: boolean;
  truncate: boolean;
  pooling: 'mean' | 'max' | 'cls';
}

export interface EmbeddingUsage {
  documentsProcessed: number;
  embeddingsGenerated: number;
  storageUsed: number;
  queriesServed: number;
}

export interface EmbeddingPerformance {
  averageLatency: number;
  throughput: number;
  accuracy: number;
  indexSize: number;
}

export interface CompletionService {
  id: string;
  name: string;
  model: string;
  provider: string;
  status: 'active' | 'inactive';
  config: CompletionConfig;
  usage: CompletionUsage;
  performance: CompletionPerformance;
}

export interface CompletionConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
}

export interface CompletionUsage {
  totalRequests: number;
  successfulRequests: number;
  tokensGenerated: number;
  averageResponseTime: number;
  cost: number;
}

export interface CompletionPerformance {
  averageLatency: number;
  throughput: number;
  qualityScore: number;
  userSatisfaction: number;
}

export interface AnalysisService {
  id: string;
  name: string;
  type: 'sentiment' | 'classification' | 'extraction' | 'summarization';
  model: string;
  status: 'active' | 'inactive';
  config: AnalysisConfig;
  usage: AnalysisUsage;
  performance: AnalysisPerformance;
}

export interface AnalysisConfig {
  confidence: number;
  maxResults: number;
  categories: string[];
  language: string;
}

export interface AnalysisUsage {
  documentsAnalyzed: number;
  analysesCompleted: number;
  averageProcessingTime: number;
  accuracy: number;
}

export interface AnalysisPerformance {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface CatalogManagement {
  schemas: SchemaCatalog[];
  tables: TableCatalog[];
  relationships: RelationshipCatalog[];
  documentation: DocumentationCatalog[];
}

export interface SchemaCatalog {
  id: string;
  name: string;
  description: string;
  owner: string;
  tables: string[];
  status: 'active' | 'inactive' | 'deprecated';
  metadata: SchemaMetadata;
  permissions: SchemaPermissions;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchemaMetadata {
  version: string;
  tags: string[];
  notes: string;
  dependencies: string[];
  changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
  author: string;
}

export interface SchemaPermissions {
  read: string[];
  write: string[];
  admin: string[];
}

export interface TableCatalog {
  id: string;
  schemaId: string;
  name: string;
  description: string;
  columns: ColumnCatalog[];
  indexes: IndexCatalog[];
  constraints: ConstraintCatalog[];
  status: 'active' | 'inactive' | 'deprecated';
  metadata: TableMetadata;
  statistics: TableStatistics;
}

export interface ColumnCatalog {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  description: string;
  constraints: string[];
  indexes: string[];
}

export interface IndexCatalog {
  name: string;
  columns: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gist' | 'gin';
  description: string;
}

export interface ConstraintCatalog {
  name: string;
  type: 'primary' | 'foreign' | 'unique' | 'check';
  columns: string[];
  referenceTable?: string;
  referenceColumns?: string[];
  condition?: string;
}

export interface TableMetadata {
  rowCount: number;
  size: number;
  lastAnalyzed: Date;
  tags: string[];
  notes: string;
}

export interface TableStatistics {
  readQueries: number;
  writeQueries: number;
  averageQueryTime: number;
  indexUsage: Record<string, number>;
}

export interface RelationshipCatalog {
  id: string;
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  sourceTable: string;
  sourceColumns: string[];
  targetTable: string;
  targetColumns: string[];
  description: string;
  cardinality: RelationshipCardinality;
  metadata: RelationshipMetadata;
}

export interface RelationshipCardinality {
  minSource: number;
  maxSource: number;
  minTarget: number;
  maxTarget: number;
}

export interface RelationshipMetadata {
  cascade: boolean;
  onUpdate: 'cascade' | 'restrict' | 'set_null' | 'no_action';
  onDelete: 'cascade' | 'restrict' | 'set_null' | 'no_action';
  validated: boolean;
  lastValidated: Date;
}

export interface DocumentationCatalog {
  id: string;
  entityType: 'schema' | 'table' | 'column' | 'relationship' | 'function';
  entityId: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'plain';
  version: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FunctionExtensions {
  edge: EdgeFunction[];
  database: DatabaseFunction[];
  webhooks: WebhookFunction[];
  scheduled: ScheduledFunction[];
}

export interface EdgeFunction {
  id: string;
  name: string;
  description: string;
  runtime: 'deno' | 'nodejs' | 'python';
  entrypoint: string;
  environment: Record<string, string>;
  status: 'active' | 'inactive' | 'deploying' | 'failed';
  config: EdgeFunctionConfig;
  usage: EdgeFunctionUsage;
  performance: EdgeFunctionPerformance;
  deployments: Deployment[];
}

export interface EdgeFunctionConfig {
  memory: number;
  cpu: number;
  timeout: number;
  maxConcurrency: number;
  retries: number;
  regions: string[];
}

export interface EdgeFunctionUsage {
  invocations: number;
  errors: number;
  averageDuration: number;
  maxDuration: number;
  throughput: number;
  cost: number;
}

export interface EdgeFunctionPerformance {
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  successRate: number;
}

export interface Deployment {
  id: string;
  version: string;
  deployedAt: Date;
  deployedBy: string;
  status: 'success' | 'failed';
  rollbackVersion?: string;
}

export interface DatabaseFunction {
  id: string;
  name: string;
  schema: string;
  language: 'sql' | 'plpgsql' | 'python' | 'javascript';
  returnType: string;
  parameters: FunctionParameter[];
  body: string;
  security: 'definer' | 'invoker';
  status: 'active' | 'inactive';
  usage: DatabaseFunctionUsage;
  performance: DatabaseFunctionPerformance;
}

export interface FunctionParameter {
  name: string;
  type: string;
  mode: 'in' | 'out' | 'inout';
  defaultValue?: string;
}

export interface DatabaseFunctionUsage {
  executions: number;
  averageExecutionTime: number;
  errors: number;
  lastExecuted: Date;
}

export interface DatabaseFunctionPerformance {
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  successRate: number;
}

export interface WebhookFunction {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  config: WebhookConfig;
  usage: WebhookUsage;
  performance: WebhookPerformance;
}

export interface WebhookConfig {
  retryPolicy: RetryPolicy;
  timeout: number;
  headers: Record<string, string>;
  method: 'POST' | 'PUT' | 'PATCH';
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export interface WebhookUsage {
  deliveries: number;
  successes: number;
  failures: number;
  averageDeliveryTime: number;
}

export interface WebhookPerformance {
  deliveryRate: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
}

export interface ScheduledFunction {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
  functionId: string;
  status: 'active' | 'inactive' | 'paused';
  config: ScheduledConfig;
  usage: ScheduledUsage;
  performance: ScheduledPerformance;
}

export interface ScheduledConfig {
  retryPolicy: RetryPolicy;
  timeout: number;
  maxRuntime: number;
  concurrency: number;
}

export interface ScheduledUsage {
  executions: number;
  successes: number;
  failures: number;
  averageRuntime: number;
  lastExecution: Date;
}

export interface ScheduledPerformance {
  successRate: number;
  averageRuntime: number;
  onTimeRate: number;
  errorRate: number;
}

export interface ObservabilitySuite {
  metrics: MetricsCollection[];
  logging: LoggingService[];
  tracing: TracingService[];
  alerting: AlertingService[];
}

export interface MetricsCollection {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  source: string;
  config: MetricsConfig;
  data: MetricsData[];
  status: 'active' | 'inactive';
}

export interface MetricsConfig {
  interval: number;
  retention: number;
  aggregation: string[];
  labels: Record<string, string>;
}

export interface MetricsData {
  timestamp: Date;
  value: number;
  labels: Record<string, string>;
}

export interface LoggingService {
  id: string;
  name: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destination: LogDestination[];
  config: LoggingConfig;
  usage: LoggingUsage;
}

export interface LogDestination {
  type: 'file' | 'console' | 'http' | 'database';
  config: Record<string, any>;
  status: 'active' | 'inactive';
}

export interface LoggingConfig {
  sampling: number;
  bufferSize: number;
  flushInterval: number;
  compression: boolean;
}

export interface LoggingUsage {
  logsWritten: number;
  storageUsed: number;
  averageWriteTime: number;
  errors: number;
}

export interface TracingService {
  id: string;
  name: string;
  provider: 'jaeger' | 'zipkin' | 'opentelemetry';
  config: TracingConfig;
  usage: TracingUsage;
  performance: TracingPerformance;
}

export interface TracingConfig {
  samplingRate: number;
  maxSpans: number;
  timeout: number;
  headers: string[];
}

export interface TracingUsage {
  tracesGenerated: number;
  spansCreated: number;
  storageUsed: number;
  averageTraceDuration: number;
}

export interface TracingPerformance {
  traceLatency: number;
  spanThroughput: number;
  samplingEfficiency: number;
  storagePerformance: number;
}

export interface AlertingService {
  id: string;
  name: string;
  rules: AlertRule[];
  channels: AlertChannel[];
  config: AlertingConfig;
  usage: AlertingUsage;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface AlertChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  status: 'active' | 'inactive';
}

export interface AlertingConfig {
  evaluationInterval: number;
  groupBy: string[];
  silenceRules: SilenceRule[];
}

export interface SilenceRule {
  id: string;
  name: string;
  condition: string;
  duration: number;
  createdBy: string;
}

export interface AlertingUsage {
  alertsTriggered: number;
  notificationsSent: number;
  falsePositives: number;
  averageResolutionTime: number;
}

export interface TestingFramework {
  unit: UnitTestSuite[];
  integration: IntegrationTestSuite[];
  e2e: E2ETestSuite[];
  performance: PerformanceTestSuite[];
}

export interface UnitTestSuite {
  id: string;
  name: string;
  framework: 'jest' | 'vitest' | 'mocha';
  tests: UnitTest[];
  config: UnitTestConfig;
  results: TestResults;
  coverage: CoverageReport;
}

export interface UnitTest {
  id: string;
  name: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface UnitTestConfig {
  testEnvironment: string;
  setupFiles: string[];
  coverage: CoverageConfig;
  reporters: string[];
}

export interface CoverageConfig {
  enabled: boolean;
  threshold: number;
  exclude: string[];
  reporters: string[];
}

export interface TestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: Date;
}

export interface CoverageReport {
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageMetric {
  covered: number;
  total: number;
  percentage: number;
}

export interface IntegrationTestSuite {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'external';
  tests: IntegrationTest[];
  config: IntegrationTestConfig;
  results: TestResults;
  environment: TestEnvironment;
}

export interface IntegrationTest {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface TestStep {
  name: string;
  action: string;
  expected: string;
  actual?: string;
  status: 'passed' | 'failed';
  duration: number;
}

export interface IntegrationTestConfig {
  services: string[];
  databases: string[];
  externalApis: string[];
  timeout: number;
  retries: number;
}

export interface TestEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production';
  config: Record<string, any>;
  status: 'ready' | 'busy' | 'error';
}

export interface E2ETestSuite {
  id: string;
  name: string;
  framework: 'playwright' | 'cypress' | 'selenium';
  tests: E2ETest[];
  config: E2ETestConfig;
  results: TestResults;
  browsers: BrowserConfig[];
}

export interface E2ETest {
  id: string;
  name: string;
  description: string;
  pages: string[];
  steps: E2ETestStep[];
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshots: string[];
  error?: string;
}

export interface E2ETestStep {
  name: string;
  action: string;
  selector?: string;
  value?: string;
  expected: string;
  actual?: string;
  status: 'passed' | 'failed';
  duration: number;
  screenshot?: string;
}

export interface E2ETestConfig {
  baseUrl: string;
  viewport: ViewportConfig;
  timeout: number;
  retries: number;
  headless: boolean;
}

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
}

export interface BrowserConfig {
  name: string;
  version: string;
  platform: string;
  headless: boolean;
}

export interface PerformanceTestSuite {
  id: string;
  name: string;
  tool: 'k6' | ' artillery' | 'jmeter' | 'custom';
  tests: PerformanceTest[];
  config: PerformanceTestConfig;
  results: PerformanceTestResults;
}

export interface PerformanceTest {
  id: string;
  name: string;
  type: 'load' | 'stress' | 'spike' | 'endurance';
  scenarios: PerformanceScenario[];
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface PerformanceScenario {
  name: string;
  weight: number;
  requests: PerformanceRequest[];
  thresholds: PerformanceThreshold[];
}

export interface PerformanceRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  expectedStatus: number;
  thinkTime?: number;
}

export interface PerformanceThreshold {
  metric: string;
  threshold: number;
  operator: 'lt' | 'gt' | 'lte' | 'gte';
}

export interface PerformanceTestConfig {
  virtualUsers: number;
  duration: number;
  rampUp: number;
  rampDown: number;
  environment: string;
}

export interface PerformanceTestResults {
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errors: PerformanceError[];
}

export interface PerformanceError {
  count: number;
  message: string;
  url: string;
  status: number;
}
