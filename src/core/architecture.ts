/**
 * Core Architecture Implementation
 * 
 * This file implements the foundational architecture rules and patterns
 * defined in the canonical app building system.
 */

export interface TechStack {
  frontend: {
    framework: "Next.js 14";
    language: "TypeScript";
    state: "Redux Toolkit + RTK Query";
    styling: "Tailwind CSS";
    ui: "Custom component system";
  };
  
  backend: {
    runtime: "Node.js";
    framework: "Next.js API Routes + Express";
    language: "TypeScript";
    auth: "JWT + bcrypt + Argon2";
    validation: "Zod";
  };
  
  database: {
    primary: "PostgreSQL";
    orm: "Prisma";
    cache: "Redis";
    search: "PostgreSQL Full Text";
  };
  
  infrastructure: {
    hosting: "Vercel (Frontend) + Railway/Render (Backend)";
    cdn: "Vercel Edge Network";
    monitoring: "Sentry + Custom metrics";
    logging: "Winston + Structured logs";
  };
}

export interface Environment {
  name: "development" | "staging" | "production";
  
  database: {
    url: string;
    poolSize: number;
    ssl: boolean;
  };
  
  auth: {
    jwtSecret: string;
    jwtExpiry: string;
    bcryptRounds: number;
  };
  
  cache: {
    redisUrl?: string;
    ttl: number;
  };
  
  features: {
    debugMode: boolean;
    analytics: boolean;
    betaFeatures: boolean;
  };
  
  security: {
    corsOrigins: string[];
    rateLimiting: boolean;
    csrfProtection: boolean;
  };
}

export interface DataOwnership {
  serverOwned: {
    userCredentials: "server_only";
    authenticationTokens: "server_only";
    securityAuditLogs: "server_only";
    systemConfiguration: "server_only";
  };
  
  clientOwned: {
    formInputState: "client_only";
    uiPreferences: "client_only";
    componentVisibility: "client_only";
    temporarySelections: "client_only";
  };
  
  shared: {
    userProfile: "server_truth_client_cache";
    userPermissions: "server_truth_client_cache";
    calendarEvents: "server_truth_client_cache";
    taskLists: "server_truth_client_cache";
  };
}

export interface BaseEntity {
  id: string; // UUID, never reused
  createdAt: Date; // Server timestamp only
  updatedAt: Date; // Server timestamp only
  version: number; // Optimistic locking
}

export interface ClientEntity extends BaseEntity {
  clientId: string; // Client-generated for optimistic updates
  clientTimestamp: Date; // Client timestamp for ordering
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error';
}

export interface DataFlowRules {
  clientToServer: {
    validation: "Zod schemas at API boundary";
    sanitization: "Remove unknown fields";
    authentication: "JWT token required";
    authorization: "RBAC check";
    audit: "Log all writes";
  };
  
  serverToClient: {
    filtering: "Only authorized data";
    transformation: "Format for UI consumption";
    caching: "Cache with TTL";
    compression: "Gzip for large payloads";
    versioning: "API versioning";
  };
  
  cacheRules: {
    writeThrough: "Update cache on successful write";
    invalidate: "Explicit invalidation only";
    ttl: "Per-data-type TTL";
    fallback: "Server always wins";
  };
}

export interface Versioning {
  api: "Semantic versioning (v1, v2, v3)";
  database: "Migration-based versioning";
  frontend: "Feature flags + gradual rollout";
  contracts: "Backward compatibility guaranteed";
}

export interface RollbackStrategy {
  api: {
    method: "Blue-green deployment";
    rollbackTime: "< 30 seconds";
    dataCompatibility: "Forward and backward compatible";
  };
  
  database: {
    method: "Migration rollback scripts";
    rollbackTime: "< 5 minutes";
    dataSafety: "Point-in-time recovery";
  };
  
  frontend: {
    method: "Feature flags + CDN cache purge";
    rollbackTime: "< 1 minute";
    userExperience: "Seamless";
  };
}

export interface PerformanceTargets {
  api: {
    responseTime: "< 100ms (95th percentile)";
    throughput: "> 1000 RPS";
    errorRate: "< 0.1%";
  };
  
  database: {
    queryTime: "< 50ms (95th percentile)";
    connectionPool: "> 90% utilization";
    indexUsage: "> 95%";
  };
  
  cache: {
    hitRate: "> 90%";
    latency: "< 5ms";
    eviction: "LRU with TTL";
  };
  
  frontend: {
    firstPaint: "< 1.5s";
    interactive: "< 3s";
    bundleSize: "< 500KB (gzipped)";
  };
}

export interface GlobalState {
  auth: {
    user: any; // User type
    token: string | null;
    permissions: string[];
    status: 'authenticated' | 'unauthenticated' | 'loading';
  };
  
  data: {
    users: EntityState<any>; // User type
    tasks: EntityState<any>; // Task type
    events: EntityState<any>; // Event type
    cache: CacheState;
  };
  
  ui: {
    theme: 'light' | 'dark';
    sidebar: 'open' | 'closed';
    notifications: any[]; // Notification type
    modals: ModalState;
  };
}

export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface CacheState {
  version: number;
  lastSync: number | null;
  pendingWrites: string[];
  conflicts: string[];
}

export interface ModalState {
  active: string | null;
  data: Record<string, any>;
  queue: string[];
}

/**
 * Architecture Manager - Enforces architectural rules
 */
export class ArchitectureManager {
  private static instance: ArchitectureManager;
  private environment: Environment;
  private stack: TechStack;
  
  private constructor() {
    this.stack = this.initializeStack();
    this.environment = this.initializeEnvironment();
  }
  
  static getInstance(): ArchitectureManager {
    if (!ArchitectureManager.instance) {
      ArchitectureManager.instance = new ArchitectureManager();
    }
    return ArchitectureManager.instance;
  }
  
  getStack(): TechStack {
    return this.stack;
  }
  
  getEnvironment(): Environment {
    return this.environment;
  }
  
  validateDataOwnership(dataType: string, access: 'read' | 'write'): boolean {
    const serverOwned = ['userCredentials', 'authenticationTokens', 'securityAuditLogs', 'systemConfiguration'];
    const clientOwned = ['formInputState', 'uiPreferences', 'componentVisibility', 'temporarySelections'];
    
    if (serverOwned.includes(dataType)) {
      return access === 'read'; // Can only read server-owned data client-side
    }
    
    if (clientOwned.includes(dataType)) {
      return true; // Full access to client-owned data
    }
    
    return true; // Shared data with proper validation
  }
  
  validateStateOwnership(stateType: string, location: 'global' | 'local'): boolean {
    const globalStates = ['auth', 'data', 'cache'];
    const localStates = ['form', 'temporary', 'uiDetails'];
    
    if (globalStates.includes(stateType)) {
      return location === 'global';
    }
    
    if (localStates.includes(stateType)) {
      return location === 'local';
    }
    
    return true; // Flexible for custom states
  }
  
  validatePerformance(operation: string, duration: number): boolean {
    const targets: Record<string, number> = {
      'api_request': 100, // 100ms
      'database_query': 50, // 50ms
      'cache_access': 5, // 5ms
      'render_component': 16 // 16ms (60fps)
    };
    
    const target = targets[operation];
    if (!target) return true; // No target defined
    
    return duration <= target;
  }
  
  validateSecurity(context: {
    endpoint: string;
    method: string;
    authenticated: boolean;
    authorized: boolean;
  }): boolean {
    // All endpoints must be authenticated except health/public endpoints
    const publicEndpoints = ['/health', '/api/csrf', '/api/auth/login'];
    
    if (!publicEndpoints.includes(context.endpoint) && !context.authenticated) {
      return false;
    }
    
    // All write operations must be authorized
    if (['POST', 'PUT', 'DELETE'].includes(context.method) && !context.authorized) {
      return false;
    }
    
    return true;
  }
  
  private initializeStack(): TechStack {
    return {
      frontend: {
        framework: "Next.js 14",
        language: "TypeScript",
        state: "Redux Toolkit + RTK Query",
        styling: "Tailwind CSS",
        ui: "Custom component system"
      },
      backend: {
        runtime: "Node.js",
        framework: "Next.js API Routes + Express",
        language: "TypeScript",
        auth: "JWT + bcrypt + Argon2",
        validation: "Zod"
      },
      database: {
        primary: "PostgreSQL",
        orm: "Prisma",
        cache: "Redis",
        search: "PostgreSQL Full Text"
      },
      infrastructure: {
        hosting: "Vercel (Frontend) + Railway/Render (Backend)",
        cdn: "Vercel Edge Network",
        monitoring: "Sentry + Custom metrics",
        logging: "Winston + Structured logs"
      }
    };
  }
  
  private initializeEnvironment(): Environment {
    const name = (process.env.NODE_ENV as any) || "development";
    
    return {
      name,
      database: {
        url: process.env.DATABASE_URL || "",
        poolSize: name === "production" ? 20 : 5,
        ssl: name === "production"
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || "",
        jwtExpiry: process.env.JWT_EXPIRY || "24h",
        bcryptRounds: name === "production" ? 12 : 10
      },
      cache: {
        redisUrl: process.env.REDIS_URL,
        ttl: name === "production" ? 3600 : 300 // 1 hour vs 5 minutes
      },
      features: {
        debugMode: name !== "production",
        analytics: name === "production",
        betaFeatures: name === "development"
      },
      security: {
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ["http://localhost:3000"],
        rateLimiting: true,
        csrfProtection: true
      }
    };
  }
}

/**
 * Performance Monitor - Tracks architectural performance targets
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  record(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const measurements = this.metrics.get(operation)!;
    measurements.push(duration);
    
    // Keep only last 100 measurements
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    // Validate against targets
    const architecture = ArchitectureManager.getInstance();
    if (!architecture.validatePerformance(operation, duration)) {
      console.warn(`Performance target missed: ${operation} took ${duration}ms`);
    }
  }
  
  getMetrics(operation: string): {
    count: number;
    average: number;
    p95: number;
    p99: number;
  } | null {
    const measurements = this.metrics.get(operation);
    if (!measurements || measurements.length === 0) return null;
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const count = sorted.length;
    const average = sorted.reduce((sum, val) => sum + val, 0) / count;
    const p95 = sorted[Math.floor(count * 0.95)];
    const p99 = sorted[Math.floor(count * 0.99)];
    
    return { count, average, p95, p99 };
  }
  
  getAllMetrics(): Record<string, ReturnType<typeof this.getMetrics>> {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {};
    
    for (const operation of this.metrics.keys()) {
      result[operation] = this.getMetrics(operation);
    }
    
    return result;
  }
}

/**
 * Security Validator - Enforces security architecture rules
 */
export class SecurityValidator {
  validateRequest(context: {
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check authentication
    const token = context.headers.authorization;
    const authenticated = !!token;
    
    // Check authorization (simplified - would use actual RBAC)
    const authorized = true; // Would implement actual authorization check
    
    const architecture = ArchitectureManager.getInstance();
    const securityValid = architecture.validateSecurity({
      endpoint: context.endpoint,
      method: context.method,
      authenticated,
      authorized
    });
    
    if (!securityValid) {
      violations.push("Security validation failed");
    }
    
    // Check for common security issues
    if (context.body && typeof context.body === 'object') {
      const suspiciousFields = ['password', 'secret', 'token', 'key'];
      for (const field of suspiciousFields) {
        if (field in context.body) {
          violations.push(`Sensitive field '${field}' in request body`);
        }
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
}

// Global instances
export const architecture = ArchitectureManager.getInstance();
export const performanceMonitor = new PerformanceMonitor();
export const securityValidator = new SecurityValidator();

/**
 * Performance measurement decorator
 */
export function measurePerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        performanceMonitor.record(operation, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        performanceMonitor.record(operation, duration);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Security validation decorator
 */
export function validateSecurity(endpoint: string, method: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (request: any, ...args: any[]) {
      const validation = securityValidator.validateRequest({
        endpoint,
        method,
        headers: request.headers || {},
        body: request.body
      });
      
      if (!validation.valid) {
        throw new Error(`Security validation failed: ${validation.violations.join(', ')}`);
      }
      
      return method.apply(this, [request, ...args]);
    };
    
    return descriptor;
  };
}
