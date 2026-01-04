# CORE ARCHITECTURE - PHASE 1

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** The foundational stack, environments, and data truth rules

---

## 🏗️ STACK & ENVIRONMENTS

### Technology Stack
```typescript
interface TechStack {
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
```

### Environment Configuration
```typescript
interface Environment {
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
```

### Environment-Specific Rules
```typescript
const environmentRules = {
  development: {
    debugMode: true,
    hotReload: true,
    mockData: true,
    relaxedSecurity: false, // Never relax security
    verboseLogging: true
  },
  
  staging: {
    debugMode: false,
    hotReload: false,
    mockData: false,
    productionData: true,
    verboseLogging: false
  },
  
  production: {
    debugMode: false,
    hotReload: false,
    mockData: false,
    productionData: true,
    verboseLogging: false,
    enhancedMonitoring: true
  }
};
```

---

## 📊 DATA TRUTH RULES

### One Source of Truth Per Data Type
```typescript
interface DataOwnership {
  // Server-owned data (never cached client-side)
  serverOwned: {
    userCredentials: "server_only";
    authenticationTokens: "server_only";
    securityAuditLogs: "server_only";
    systemConfiguration: "server_only";
  };
  
  // Client-owned data (ephemeral, UI state)
  clientOwned: {
    formInputState: "client_only";
    uiPreferences: "client_only";
    componentVisibility: "client_only";
    temporarySelections: "client_only";
  };
  
  // Shared data (cached with validation)
  shared: {
    userProfile: "server_truth_client_cache";
    userPermissions: "server_truth_client_cache";
    calendarEvents: "server_truth_client_cache";
    taskLists: "server_truth_client_cache";
  };
}
```

### Immutable IDs & Explicit Timestamps
```typescript
interface BaseEntity {
  id: string; // UUID, never reused
  createdAt: Date; // Server timestamp only
  updatedAt: Date; // Server timestamp only
  version: number; // Optimistic locking
}

interface ClientEntity extends BaseEntity {
  clientId: string; // Client-generated for optimistic updates
  clientTimestamp: Date; // Client timestamp for ordering
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error';
}
```

### Data Flow Rules
```typescript
interface DataFlowRules {
  // Client to Server
  clientToServer: {
    validation: "Zod schemas at API boundary";
    sanitization: "Remove unknown fields";
    authentication: "JWT token required";
    authorization: "RBAC check";
    audit: "Log all writes";
  };
  
  // Server to Client
  serverToClient: {
    filtering: "Only authorized data";
    transformation: "Format for UI consumption";
    caching: "Cache with TTL";
    compression: "Gzip for large payloads";
    versioning: "API versioning";
  };
  
  // Cache Management
  cacheRules: {
    writeThrough: "Update cache on successful write";
    invalidate: "Explicit invalidation only";
    ttl: "Per-data-type TTL";
    fallback: "Server always wins";
  };
}
```

---

## 🔄 VERSIONING & ROLLBACK STRATEGY

### Semantic Versioning
```typescript
interface Versioning {
  api: "Semantic versioning (v1, v2, v3)";
  database: "Migration-based versioning";
  frontend: "Feature flags + gradual rollout";
  contracts: "Backward compatibility guaranteed";
}
```

### Rollback Strategy
```typescript
interface RollbackStrategy {
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
```

---

## 🏛️ ARCHITECTURAL PATTERNS

### 1. Layered Architecture
```
┌─────────────────────────────────────┐
│           UI Layer                  │
│  (React Components + Hooks)         │
├─────────────────────────────────────┤
│         State Layer                 │
│    (Redux + RTK Query)             │
├─────────────────────────────────────┤
│        Service Layer                │
│  (API Clients + Business Logic)    │
├─────────────────────────────────────┤
│         Data Layer                  │
│   (Cache + Database + Storage)     │
└─────────────────────────────────────┘
```

### 2. Event-Driven Communication
```typescript
interface EventDrivenPattern {
  // Features don't call each other directly
  communication: "Event bus only";
  
  // Standard event lifecycle
  eventLifecycle: [
    "emit", 
    "validate", 
    "process", 
    "persist", 
    "notify"
  ];
  
  // Event guarantees
  guarantees: {
    delivery: "At least once";
    ordering: "Per-feature ordering";
    idempotency: "All handlers idempotent";
  };
}
```

### 3. CQRS Pattern (Command Query Responsibility Segregation)
```typescript
interface CQRSPattern {
  commands: {
    create: "POST /api/resources";
    update: "PUT /api/resources/:id";
    delete: "DELETE /api/resources/:id";
  };
  
  queries: {
    read: "GET /api/resources/:id";
    list: "GET /api/resources";
    search: "GET /api/resources/search";
  };
  
  separation: "Commands and queries use different endpoints";
}
```

---

## 🔒 SECURITY ARCHITECTURE

### Defense in Depth
```typescript
interface SecurityLayers {
  network: {
    https: "TLS 1.3 only";
    cors: "Strict origin checking";
    rateLimit: "Per-IP and per-user";
  };
  
  application: {
    authentication: "JWT + refresh tokens";
    authorization: "RBAC with least privilege";
    validation: "Zod schemas everywhere";
    sanitization: "Input sanitization";
  };
  
  data: {
    encryption: "Encryption at rest and in transit";
    hashing: "Argon2 for passwords";
    secrets: "Environment variables only";
    audit: "Comprehensive audit logging";
  };
}
```

### Zero Trust Principles
```typescript
interface ZeroTrust {
  principle: "Never trust, always verify";
  
  verification: {
    everyRequest: "Validate every API call";
    everySession: "Validate session on each use";
    everyDataAccess: "Check permissions for each access";
  };
  
  minimalAccess: {
    principle: "Least privilege access";
    implementation: "Role-based with scope limiting";
    auditing: "Log all access decisions";
  };
}
```

---

## 📈 PERFORMANCE ARCHITECTURE

### Performance Targets
```typescript
interface PerformanceTargets {
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
```

### Caching Strategy
```typescript
interface CachingStrategy {
  levels: [
    "Browser cache (static assets)",
    "CDN cache (API responses)",
    "Application cache (Redis)",
    "Database cache (query results)"
  ];
  
  invalidation: {
    manual: "Explicit cache invalidation";
    automatic: "TTL-based expiration";
    event: "Event-driven invalidation";
  };
}
```

---

## 🔄 STATE MANAGEMENT ARCHITECTURE

### Global State Structure
```typescript
interface GlobalState {
  auth: {
    user: User | null;
    token: string | null;
    permissions: Permission[];
    status: 'authenticated' | 'unauthenticated' | 'loading';
  };
  
  data: {
    users: EntityState<User>;
    tasks: EntityState<Task>;
    events: EntityState<Event>;
    cache: CacheState;
  };
  
  ui: {
    theme: 'light' | 'dark';
    sidebar: 'open' | 'closed';
    notifications: Notification[];
    modals: ModalState;
  };
}
```

### State Ownership Rules
```typescript
interface StateOwnership {
  global: {
    auth: "Redux store (shared across app)";
    data: "Redux + RTK Query (cached server data)";
    ui: "Redux (shared UI state)";
  };
  
  local: {
    form: "React state (component-local)";
    temporary: "React state (ephemeral)";
    uiDetails: "React state (non-shared)";
  };
  
  server: {
    truth: "Database is always source of truth";
    cache: "Server cache for performance";
    session: "Server-side session state";
  };
}
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Deployment Pipeline
```typescript
interface DeploymentPipeline {
  stages: [
    "development (local)",
    "feature branch (preview)",
    "staging (integration)",
    "production (live)"
  ];
  
  gates: {
    tests: "All tests must pass";
    security: "Security scan must pass";
    performance: "Performance benchmarks must pass";
    manual: "Manual approval for production";
  };
  
  rollback: {
    automatic: "Auto-rollback on health check failure";
    manual: "Manual rollback within 30 seconds";
    data: "Database rollback scripts ready";
  };
}
```

### Infrastructure as Code
```typescript
interface InfrastructureCode {
  database: "Prisma migrations + schema";
  caching: "Redis configuration";
  monitoring: "Prometheus + Grafana dashboards";
  logging: "Structured logging with correlation IDs";
  security: "Security headers + CSP + HSTS";
}
```

---

## 📋 ARCHITECTURE DECISIONS RECORD (ADR)

### ADR-001: Technology Stack
**Decision:** Next.js + TypeScript + Prisma + PostgreSQL  
**Status:** Accepted  
**Consequences:** Strong type safety, good DX, scalable database

### ADR-002: State Management
**Decision:** Redux Toolkit + RTK Query  
**Status:** Accepted  
**Consequences:** Predictable state, excellent caching, dev tools

### ADR-003: Authentication
**Decision:** JWT + refresh tokens + RBAC  
**Status:** Accepted  
**Consequences:** Stateless auth, secure, scalable

### ADR-004: Caching Strategy
**Decision:** Multi-level caching with explicit invalidation  
**Status:** Accepted  
**Consequences:** High performance, data consistency

---

## 🎯 ARCHITECTURE PRINCIPLES

### 1. Simplicity Over Complexity
- Choose the simplest solution that works
- Avoid over-engineering
- Prefer explicit over implicit

### 2. Security First
- Never compromise security for convenience
- Default to most secure settings
- Regular security reviews

### 3. Performance by Design
- Design for performance from the start
- Measure everything
- Optimize based on data

### 4. Developer Experience
- Clear error messages
- Comprehensive documentation
- Excellent tooling

### 5. Production Readiness
- Monitoring and alerting built-in
- Graceful error handling
- Automated rollback

---

## 🚀 NEXT STEPS

With core architecture defined:
1. **Phase 2:** Data models and API contracts
2. **Phase 3:** UI build with dummy data
3. **Phase 4:** State, cache, and performance
4. **Phase 5:** Error handling and recovery

**All future phases must follow these architectural principles.**
