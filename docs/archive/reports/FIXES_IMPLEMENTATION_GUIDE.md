# Fixes Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing all 42 identified fixes across the Auth-Spine codebase.

## Phase 1: Critical Fixes (Implement Immediately)

### 1.1 Type Safety Fixes ✅ IN PROGRESS

**Status:** Type definitions created (`packages/auth-server/src/types.ts`)

**Files Modified:**
- `packages/auth-server/src/types.ts` - NEW - Comprehensive type definitions
- `packages/auth-server/src/server.ts` - Updated imports and type annotations

**What Was Fixed:**
- ✅ Created `SpineJwtClaims` interface for JWT payload
- ✅ Created `Session` interface with proper types
- ✅ Created `RefreshToken` interface
- ✅ Created `AuditEvent` interface
- ✅ Created `AuthError` class for proper error handling
- ✅ Added `validateScopes()` function with type safety
- ✅ Removed `as any` type assertions
- ✅ Added null checks in `createSession()`
- ✅ Added stream cleanup to prevent memory leaks

**Remaining Type Safety Work:**
```typescript
// In packages/auth-server/src/server.ts
// Fix remaining implicit any types on route handlers
app.post('/login', (req: express.Request, res: express.Response) => {
  // ... handler
})
```

### 1.2 Security Middleware Fixes - PENDING

**Required Packages to Add:**
```json
{
  "express-rate-limit": "^7.0.0",
  "csurf": "^1.11.0",
  "helmet": "^7.0.0",
  "express-validator": "^7.0.0"
}
```

**Implementation Steps:**

1. **Add Rate Limiting:**
```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
})

app.post('/login', loginLimiter, loginHandler)
app.post('/refresh', rateLimit({
  windowMs: 60 * 1000,
  max: 10
}), refreshHandler)
```

2. **Add CSRF Protection:**
```typescript
const csrfProtection = csrf({ cookie: false })

app.use(csrfProtection)

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

app.post('/login', csrfProtection, loginHandler)
```

3. **Add Helmet Security Headers:**
```typescript
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}))
```

4. **Add Input Validation:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  clientId: z.string().min(1, 'Client ID required')
})

app.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body)
    // ... rest of handler
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' })
  }
})
```

### 1.3 Environment Variable Validation - PENDING

**Create `packages/auth-server/src/env.ts`:**
```typescript
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  ISSUER: z.string().url('ISSUER must be a valid URL'),
  JWT_ALG: z.enum(['HS256', 'RS256']).default('HS256'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  ACCESS_TTL_SECONDS: z.coerce.number().default(1800),
  REFRESH_TTL_SECONDS: z.coerce.number().default(604800),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export const env = envSchema.parse(process.env)
```

---

## Phase 2: High-Priority Fixes (Sprint 1)

### 2.1 Error Handling & Logging

**Create `packages/auth-server/src/logger.ts`:**
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'auth-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
```

**Update all route handlers with try-catch:**
```typescript
app.post('/login', async (req, res) => {
  try {
    // ... logic
    logger.info('User login successful', { userId: user.id })
  } catch (error) {
    logger.error('Login failed', { error, email: req.body.email })
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

### 2.2 Persistent Storage for Sessions & Audit Logs

**Create `packages/auth-server/src/db.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient()

export async function createSessionInDb(session: Session) {
  return await db.session.create({
    data: {
      id: session.id,
      userId: session.userId,
      clientId: session.clientId,
      scopes: session.scopes,
      risk: session.risk,
      entitlements: session.entitlements,
      expiresAt: new Date(session.expiresAt)
    }
  })
}

export async function recordAuditInDb(event: AuditEvent) {
  return await db.auditLog.create({
    data: {
      eventType: event.eventType,
      userId: event.userId,
      clientId: event.clientId,
      metadata: event.metadata,
      createdAt: new Date(event.createdAt)
    }
  })
}
```

### 2.3 Add Unit Tests

**Create `packages/auth-server/src/__tests__/auth.test.ts`:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createSession, validateScopes } from '../server'
import { AuthError } from '../types'

describe('Auth Functions', () => {
  describe('createSession', () => {
    it('should create session with correct expiry', () => {
      const user = { id: '1', email: 'test@example.com', password: 'hash' }
      const session = createSession(user, 'client1', ['read'])
      
      expect(session.userId).toBe('1')
      expect(session.clientId).toBe('client1')
      expect(session.scopes).toEqual(['read'])
    })

    it('should throw if user is null', () => {
      expect(() => createSession(null, 'client1', [])).toThrow(AuthError)
    })
  })

  describe('validateScopes', () => {
    it('should validate allowed scopes', () => {
      const scopes = validateScopes(['read', 'write'])
      expect(scopes).toEqual(['read', 'write'])
    })

    it('should reject invalid scopes', () => {
      expect(() => validateScopes(['invalid'])).toThrow(AuthError)
    })

    it('should reject non-array input', () => {
      expect(() => validateScopes('read')).toThrow(AuthError)
    })
  })
})
```

---

## Phase 3: Medium-Priority Fixes (Sprint 2)

### 3.1 Race Condition Fixes

**Update session operations to use transactions:**
```typescript
async function createSessionAtomic(user: UserConfig, clientId: string, scopes: AllowedScope[]) {
  return await db.$transaction(async (tx) => {
    const session = await tx.session.create({
      data: { /* ... */ }
    })
    const refreshToken = await tx.refreshToken.create({
      data: { /* ... */ }
    })
    return { session, refreshToken }
  })
}
```

### 3.2 Caching Strategy

**Create `packages/auth-server/src/cache.ts`:**
```typescript
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private ttl: number

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttl
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

export const userCache = new Cache<UserConfig>(5 * 60 * 1000)
```

### 3.3 Database Indexes

**Create migration:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_session_user_id ON sessions(user_id);
CREATE INDEX idx_session_expires_at ON sessions(expires_at);
CREATE INDEX idx_refresh_token_session_id ON refresh_tokens(session_id);
CREATE INDEX idx_audit_log_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_logs(created_at);
```

---

## Phase 4: Low-Priority Fixes (Backlog)

### 4.1 Code Organization

**Refactor into modules:**
```
packages/auth-server/src/
├── types.ts
├── env.ts
├── logger.ts
├── db.ts
├── cache.ts
├── routes/
│   ├── auth.ts
│   ├── session.ts
│   └── audit.ts
├── services/
│   ├── auth-service.ts
│   └── session-service.ts
├── middleware/
│   ├── auth.ts
│   ├── error-handler.ts
│   └── security.ts
├── __tests__/
│   ├── auth.test.ts
│   ├── session.test.ts
│   └── integration.test.ts
└── server.ts
```

### 4.2 Remove Vite Configurations

```bash
rm apps/demo-ui/vite.config.ts
rm packages/enterprise/Handy/vite.config.ts
rm packages/enterprise/assistant-ui/examples/with-tanstack/vite.config.ts
rm packages/enterprise/CopilotKit/src/v2.x/apps/react/demo/mcp-apps/vite.config.ts
```

---

## Implementation Checklist

### Critical (Week 1)
- [ ] Type definitions created
- [ ] Type assertions removed
- [ ] Rate limiting added
- [ ] CSRF protection added
- [ ] Input validation added
- [ ] Environment validation added

### High Priority (Week 2)
- [ ] Error handling improved
- [ ] Logging implemented
- [ ] Sessions persisted to database
- [ ] Audit logs persisted to database
- [ ] Unit tests added
- [ ] Integration tests added

### Medium Priority (Week 3)
- [ ] Race conditions fixed
- [ ] Caching implemented
- [ ] Database indexes created
- [ ] Security tests added
- [ ] Performance tests added

### Low Priority (Week 4+)
- [ ] Code refactored into modules
- [ ] Vite configs removed
- [ ] Documentation updated
- [ ] API documentation added

---

## Testing Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Security tests pass
- [ ] Load tests pass (1000+ concurrent users)
- [ ] Rate limiting works correctly
- [ ] CSRF protection works
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Scope validation works
- [ ] Audit logs recorded
- [ ] Sessions persist across restarts

---

## Dependencies to Add

```json
{
  "express-rate-limit": "^7.0.0",
  "csurf": "^1.11.0",
  "helmet": "^7.0.0",
  "express-validator": "^7.0.0",
  "winston": "^3.11.0",
  "@prisma/client": "^5.0.0",
  "vitest": "^1.0.0",
  "@testing-library/node": "^1.0.0"
}
```

---

## Deployment Checklist

Before deploying to production:
1. [ ] All tests passing
2. [ ] Security audit completed
3. [ ] Load testing completed
4. [ ] Database migrations run
5. [ ] Environment variables configured
6. [ ] Logging configured
7. [ ] Monitoring configured
8. [ ] Backup strategy in place
9. [ ] Rollback plan documented
10. [ ] Security review completed

---

## Success Criteria

✅ All 42 issues addressed
✅ Type safety score: 100%
✅ Test coverage: >80%
✅ Security vulnerabilities: 0
✅ Performance: <100ms p95 latency
✅ Availability: >99.9% uptime
✅ Production-ready code quality

