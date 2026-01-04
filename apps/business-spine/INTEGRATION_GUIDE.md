# Business Spine Integration Guide

This guide explains how to integrate the Business Spine with your application.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Integration](#api-integration)
6. [Next.js Integration](#nextjs-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The Business Spine is a deterministic, rule-based assistant kernel for managing service businesses. It provides:

- **Intent Detection**: Pattern-based command recognition
- **Entity Extraction**: Extract dates, times, money, IDs from natural language
- **Flow Orchestration**: Slot-filling conversations with automatic validation
- **Multi-tenancy**: Isolated data per tenant
- **Role-based Access**: Owner, admin, staff, etc.
- **Audit Logging**: Every action is logged
- **Diagnostics**: Health checks for database, cache, queue, etc.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the demo
npm run dev

# Run tests
npm run test:all
```

## Installation

### As a standalone service

```bash
git clone <repo-url>
cd temp-spine
npm install
npm run build
```

### As a library in your project

```bash
npm install /path/to/temp-spine
```

```typescript
import { createDefaultOrchestrator, AssistantContext } from 'no-llm-business-assistant-spine';

const orchestrator = createDefaultOrchestrator();

const ctx: AssistantContext = {
  actor: { userId: "user_123", role: "owner" },
  tenantId: "tenant_1",
  nowISO: new Date().toISOString(),
  timezone: "America/New_York",
  channel: "api",
};

const result = await orchestrator.handle("book appointment for alex@example.com tomorrow 3pm", ctx);
```

## Configuration

### Environment Variables

```env
# API Configuration
BUSINESS_SPINE_API_KEY=your-secret-api-key
BUSINESS_SPINE_URL=http://localhost:3001

# Logging
LOG_LEVEL=info  # debug | info | warn | error

# Multi-tenancy
DEFAULT_TENANT_ID=default

# Database (optional, for Prisma adapter)
DATABASE_URL=postgresql://user:pass@localhost:5432/business_spine

# Redis (optional, for Redis adapter)
REDIS_URL=redis://localhost:6379

# Queue (optional, for BullMQ adapter)
QUEUE_URL=redis://localhost:6379
```

## API Integration

### Using the API Server

```typescript
import { getBusinessSpineApi, ApiRequest } from 'no-llm-business-assistant-spine';

const api = getBusinessSpineApi({
  apiKey: process.env.BUSINESS_SPINE_API_KEY,
  logLevel: "info",
});

// Handle a command
const request: ApiRequest = {
  text: "book appointment for alex@example.com tomorrow 3pm",
  context: {
    userId: "user_123",
    role: "owner",
    tenantId: "tenant_1",
    timezone: "America/New_York",
  },
};

const result = await api.handle(request);
console.log(result);
```

### Validating API Keys

```typescript
const isValid = api.validateApiKey(apiKey);
if (!isValid) {
  throw new UnauthorizedError("Invalid API key");
}
```

### Health Checks

```typescript
const health = await api.health();
console.log(health);
// { success: true, data: { status: "ok", timestamp: "...", version: "0.1.0" } }
```

## Next.js Integration

### 1. Copy API Routes

Copy the API route handlers to your Next.js project:

```bash
cp -r /workspace/enterprise_finish/app/api/spine /path/to/your-nextjs-app/app/api/
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
BUSINESS_SPINE_API_KEY=your-secret-api-key
BUSINESS_SPINE_URL=http://localhost:3001
```

### 3. Use the API Routes

```typescript
// In your React component
async function handleCommand(text: string) {
  const response = await fetch('/api/spine/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.BUSINESS_SPINE_API_KEY!,
    },
    body: JSON.stringify({
      text,
      context: {
        userId: session.user.id,
        role: session.user.role,
        tenantId: session.user.tenantId,
      },
    }),
  });

  const result = await response.json();
  return result;
}
```

### 4. Available Endpoints

- `POST /api/spine/chat` - Execute commands
- `POST /api/spine/intents` - Detect intents
- `GET /api/spine/health` - Health check
- `POST /api/spine/diagnostics` - Run diagnostics (admin only)

## Testing

### Integration Tests

Tests the full end-to-end flow:

```bash
npm run test:integration
```

### API Tests

Tests the API server:

```bash
npm run test:api
```

### Diagnostics Tests

Tests the diagnostics system:

```bash
npm run test:diagnostics
```

### All Tests

Run all tests:

```bash
npm run test:all
```

## Supported Commands

### Booking

- `book appointment for alex@example.com tomorrow 3pm`
- `schedule haircut for john@example.com next monday 2pm 60 min`
- `list bookings`
- `cancel booking_abc123`

### CRM

- `find client alex`
- `lookup client john@example.com`
- `add note for alex: prefers morning appointments`
- `tag client sam vip`
- `do not book client troublemaker@example.com`

### Payments

- `create invoice for alex@example.com $120 memo haircut`
- `mark paid invoice_abc123`
- `refund invoice_abc123 $50`

### Marketing

- `create promo code GLOWUP 15% expires next friday`
- `end promo OLDCODE`

### Analytics

- `how did i do this week`
- `show me weekly summary`
- `revenue this week`

### Diagnostics (Admin Only)

- `run diagnostics`
- `health check`
- `check database`
- `check redis`
- `check queue`
- `system status`

### Admin/Security

- `show audit trail`

## Role-Based Access

Different roles have different permissions:

### Owner
- Full access to all features
- Can run diagnostics
- Can view audit logs
- Can manage all resources

### Admin
- Can run diagnostics
- Can view audit logs
- Cannot delete critical resources

### Staff
- Limited access to bookings and clients
- Cannot run diagnostics
- Cannot view audit logs
- Cannot access financial data

### Accountant
- Access to financial data
- Cannot modify bookings
- Cannot access client data

## Confirmation Flow

Sensitive operations require confirmation:

```typescript
// First request
const result1 = await orchestrator.handle("refund invoice_abc123 $50", ctx);
// Returns: { final: { payload: { confirmToken: "confirm_xyz123" } } }

// Second request with confirmation token
const result2 = await orchestrator.handle(
  "refund invoice_abc123 $50",
  ctx,
  { confirmToken: "confirm_xyz123" }
);
// Executes the refund
```

## Audit Logging

All operations are automatically logged:

```typescript
const audit = await orchestrator.handle("show audit trail", adminCtx);
// Returns last 25 audit entries with:
// - Timestamp
// - Actor (userId, role)
// - Action (e.g., "payments.refund")
// - Outcome (success/failure/blocked)
// - Input summary
// - Optional hash chain for tamper-evidence
```

## Error Handling

The spine provides structured errors:

```typescript
import { handleError, ValidationError, NotFoundError } from 'no-llm-business-assistant-spine';

try {
  const result = await api.handle(request);
} catch (error) {
  const handledError = handleError(error);
  
  console.error({
    code: handledError.code,
    message: handledError.message,
    details: handledError.details,
  });
}
```

### Error Types

- `ValidationError` - Invalid input (400)
- `NotFoundError` - Resource not found (404)
- `UnauthorizedError` - Invalid credentials (401)
- `ForbiddenError` - Insufficient permissions (403)
- `ConflictError` - Resource conflict (409)
- `TimeoutError` - Request timeout (408)
- `RateLimitError` - Rate limit exceeded (429)

## Logging

Configure logging level:

```typescript
import { setLogLevel } from 'no-llm-business-assistant-spine';

setLogLevel("debug");  // debug | info | warn | error
```

Access logger:

```typescript
import { getLogger } from 'no-llm-business-assistant-spine';

const logger = getLogger("my-module");

logger.info("Processing request", { userId: "123" });
logger.error("Failed to process", error, { requestId: "456" });
```

## Troubleshooting

### Command Not Recognized

**Problem**: Intent detection returns empty array

**Solution**: Check pattern matching in spine intents files. Patterns are case-insensitive regex.

### Missing Entities

**Problem**: Command requires additional information

**Solution**: The system will respond with `{ kind: "ask", missing: ["field1", "field2"] }`. Provide the missing information in the next request.

### Confirmation Required

**Problem**: Sensitive operation needs confirmation

**Solution**: Extract the `confirmToken` from the response and pass it in the next request with the same command.

### Permission Denied

**Problem**: User role doesn't have access

**Solution**: Check role-based access control. Some commands are restricted to admin/owner roles.

### API Key Invalid

**Problem**: API returns 401 Unauthorized

**Solution**: Verify `BUSINESS_SPINE_API_KEY` matches in both client and server.

### Database Not Connected

**Problem**: Database health check fails

**Solution**: 
1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Run migrations if needed
4. Check network connectivity

### Tests Failing

**Problem**: Integration tests fail

**Solution**:
1. Run `npm run clean && npm run build`
2. Check database state (may need to reset)
3. Verify all dependencies installed
4. Check Node.js version (requires 18+)

## Best Practices

1. **Always validate API keys** in production
2. **Use role-based access control** to limit permissions
3. **Enable audit logging** for compliance
4. **Run health checks** regularly
5. **Handle confirmation flows** properly for sensitive operations
6. **Provide context** (timezone, locale) for better parsing
7. **Use structured logging** for debugging
8. **Test with multiple roles** to verify access control
9. **Monitor audit logs** for security events
10. **Run diagnostics** during deployment

## Advanced Topics

### Custom Spines

Create custom spines for your domain:

```typescript
import { Spine, Intent, Extraction, FlowStep } from 'no-llm-business-assistant-spine';

const mySpine: Spine = {
  name: "inventory",
  description: "Inventory management",
  
  detectIntent(text, ctx) {
    // Return array of detected intents
  },
  
  extractEntities(intent, text, ctx) {
    // Extract entities from text
  },
  
  buildFlow(intent, extraction, ctx) {
    // Build flow steps
  },
};
```

### Custom Tools

Add custom tools to the registry:

```typescript
import { ToolRegistry, ToolResult } from 'no-llm-business-assistant-spine';

const customTools: ToolRegistry = {
  "inventory.checkStock": async ({ ctx, input }) => {
    // Implement your tool logic
    return { ok: true, data: { inStock: true } };
  },
};
```

### Database Adapters

Replace memory adapter with real database:

```typescript
import { BusinessSpineBridge } from 'no-llm-business-assistant-spine';

const bridge = new BusinessSpineBridge({
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  tenantId: "your-tenant",
});

await bridge.initialize();
```

## Support

For issues, questions, or contributions:

1. Check the [README](./README.md)
2. Review [test files](./src/tests/) for examples
3. Check [diagnostics](./src/adapters/diagnostics.ts) for health monitoring
4. Review [error handling](./src/utils/error-handler.ts) for error types

## License

See [LICENSE](./LICENSE) file for details.
