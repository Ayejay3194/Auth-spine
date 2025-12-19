/**
 * Type definitions for Supabase Advanced Features Pack
 */

export interface SupabaseAdvancedConfig {
  sql: {
    enableExtensions: boolean;
    enableMonitoring: boolean;
    enableAudit: boolean;
    enableSearch: boolean;
  };
  edgeFunctions: {
    enableMiddleware: boolean;
    enableAuthGate: boolean;
    enableRateLimit: boolean;
    enableWebhooks: boolean;
    enableCronJobs: boolean;
  };
  realtime: {
    enablePresence: boolean;
    enableBroadcast: boolean;
    enableChannels: boolean;
  };
  storage: {
    enableSignedUrls: boolean;
    enablePolicies: boolean;
    enableResumableUploads: boolean;
  };
  testing: {
    enableDBTests: boolean;
    enableAPITests: boolean;
    enableRLSTests: boolean;
  };
}

export interface SQLEnvironment {
  extensions: Array<{
    name: string;
    version: string;
    description: string;
    enabled: boolean;
  }>;
  monitoring: {
    views: Array<{
      name: string;
      description: string;
      sql: string;
    }>;
    functions: Array<{
      name: string;
      description: string;
      parameters: Array<{
        name: string;
        type: string;
        description: string;
      }>;
      returns: string;
    }>;
  };
  audit: {
    tables: Array<{
      name: string;
      description: string;
      columns: Array<{
        name: string;
        type: string;
        description: string;
      }>;
    }>;
    triggers: Array<{
      name: string;
      table: string;
      event: string;
      function: string;
    }>;
  };
  search: {
    indexes: Array<{
      name: string;
      table: string;
      columns: string[];
      type: string;
    }>;
    functions: Array<{
      name: string;
      description: string;
      usage: string;
    }>;
  };
}

export interface EdgeFunctionEnvironment {
  middleware: {
    auth: {
      enabled: boolean;
      jwtSecret: string;
      requiredClaims: string[];
    };
    cors: {
      enabled: boolean;
      origins: string[];
      methods: string[];
      headers: string[];
    };
    rateLimit: {
      enabled: boolean;
      requests: number;
      window: number;
      storage: 'memory' | 'redis' | 'upstash';
    };
  };
  functions: Array<{
    name: string;
    path: string;
    method: string[];
    middleware: string[];
    handler: string;
  }>;
  webhooks: {
    handlers: Array<{
      name: string;
      event: string;
      url: string;
      secret: string;
      retries: number;
    }>;
    queue: {
      enabled: boolean;
      maxRetries: number;
      deadLetterQueue: string;
    };
  };
  cron: {
    jobs: Array<{
      name: string;
      schedule: string;
      handler: string;
      enabled: boolean;
    }>;
    storage: 'memory' | 'database';
  };
}

export interface RealtimeEnvironment {
  presence: {
    channels: Array<{
      name: string;
      maxUsers: number;
      timeout: number;
      metadata: Record<string, any>;
    }>;
    handlers: Array<{
      event: 'join' | 'leave' | 'sync';
      handler: string;
    }>;
  };
  broadcast: {
    channels: Array<{
      name: string;
      authorized: boolean;
      rateLimit: number;
    }>;
    events: Array<{
      name: string;
      payload: any;
      target: string[];
    }>;
  };
  presenceState: {
    online: Map<string, any>;
    lastSeen: Map<string, Date>;
    metadata: Map<string, any>;
  };
}

export interface StorageEnvironment {
  policies: Array<{
    bucket: string;
    name: string;
    definition: string;
    operations: string[];
    roles: string[];
  }>;
  signedUrls: {
    enabled: boolean;
    expiresIn: number;
    allowedMimeTypes: string[];
    maxFileSize: number;
  };
  resumable: {
    enabled: boolean;
    chunkSize: number;
    maxChunks: number;
    timeout: number;
  };
  buckets: Array<{
    name: string;
    public: boolean;
    fileSizeLimit: number;
    allowedMimeTypes: string[];
    transformations: Array<{
      name: string;
      format: string;
      quality?: number;
      width?: number;
      height?: number;
    }>;
  }>;
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
  users: {
    total: number;
    active: number;
    roles: Array<{
      name: string;
      members: number;
      permissions: string[];
    }>;
  };
}

export interface AuditEvent {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  userId: string;
  timestamp: Date;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  };
}

export interface SearchResult {
  items: Array<{
    id: string;
    table: string;
    rank: number;
    highlight: Record<string, string>;
    data: Record<string, any>;
  }>;
  total: number;
  query: string;
  took: number;
}

export interface PresenceUser {
  id: string;
  presenceRef: string;
  onlineAt: Date;
  lastSeen: Date;
  metadata: Record<string, any>;
}

export interface BroadcastEvent {
  event: string;
  payload: any;
  timestamp: Date;
  source: string;
  channel?: string;
}

export interface StorageUpload {
  id: string;
  path: string;
  bucket: string;
  contentType: string;
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  chunks: Array<{
    number: number;
    size: number;
    uploaded: boolean;
    url?: string;
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EdgeFunctionContext {
  req: Request;
  env: Record<string, string>;
  client: any;
  user?: any;
  metadata: Record<string, any>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface WebhookPayload {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
  signature: string;
}

export interface CronJobResult {
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
  nextRun: Date;
}

export interface TestEnvironment {
  database: {
    url: string;
    migrations: string[];
    seeds: string[];
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceKey: string;
  };
  fixtures: Record<string, any>;
  mocks: Record<string, any>;
}

export interface RLSPolicyTest {
  policyName: string;
  tableName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  user: {
    id: string;
    role: string;
    claims: Record<string, any>;
  };
  data?: Record<string, any>;
  expected: {
    allowed: boolean;
    rowCount?: number;
    error?: string;
  };
}

export interface APIEndpointTest {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
  user?: {
    id: string;
    role: string;
    token: string;
  };
  expected: {
    status: number;
    body?: any;
    headers?: Record<string, string>;
  };
}

export interface DatabaseFunctionTest {
  functionName: string;
  parameters: any[];
  expected: {
    result: any;
    error?: string;
  };
}

export interface TestSuite {
  name: string;
  tests: Array<RLSPolicyTest | APIEndpointTest | DatabaseFunctionTest>;
  setup?: string;
  teardown?: string;
  timeout?: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface TestReport {
  suite: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  results: TestResult[];
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}
