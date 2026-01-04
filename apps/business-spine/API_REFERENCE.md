# Business Spine API Reference

Complete API documentation for the Business Spine system.

## Table of Contents

1. [Core Types](#core-types)
2. [Orchestrator API](#orchestrator-api)
3. [API Server](#api-server)
4. [Spine Interface](#spine-interface)
5. [Tool Registry](#tool-registry)
6. [Error Handling](#error-handling)
7. [Logging](#logging)

## Core Types

### AssistantContext

Context information for each request:

```typescript
type AssistantContext = {
  actor: {
    userId: string;
    role: "owner" | "staff" | "assistant" | "accountant" | "admin" | "moderator";
  };
  tenantId: string;
  nowISO: string;  // ISO 8601 timestamp
  timezone?: string;  // IANA timezone (e.g., "America/New_York")
  locale?: string;  // BCP 47 locale (e.g., "en-US")
  channel?: "cmdk" | "chat" | "api";
};
```

### Intent

Detected user intent:

```typescript
type Intent = {
  spine: string;       // Spine name (e.g., "booking")
  name: string;        // Intent name (e.g., "book")
  confidence: number;  // 0..1
  match: string;       // Debug: matched pattern
};
```

### FlowStep

Step in the conversation flow:

```typescript
type FlowStep =
  | { kind: "ask"; prompt: string; missing: string[] }
  | { kind: "confirm"; prompt: string; token: string }
  | { kind: "execute"; action: string; sensitivity: "low"|"medium"|"high"; tool: string; input: Record<string, unknown> }
  | { kind: "respond"; message: string; payload?: unknown };
```

### FlowRunResult

Result of executing a flow:

```typescript
type FlowRunResult = {
  steps: FlowStep[];
  final?: {
    ok: boolean;
    message: string;
    payload?: unknown;
  };
};
```

### ToolResult

Result from a tool execution:

```typescript
type ToolResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

## Orchestrator API

### createDefaultOrchestrator()

Create an orchestrator with all default spines:

```typescript
import { createDefaultOrchestrator } from 'no-llm-business-assistant-spine';

const orchestrator = createDefaultOrchestrator();
```

### Orchestrator.detect()

Detect intents without executing:

```typescript
const intents = orchestrator.detect(text, context);
// Returns: Intent[]
```

**Parameters:**
- `text`: string - User input
- `context`: AssistantContext - Request context

**Returns:** Array of detected intents, sorted by confidence (highest first), limited to 5.

### Orchestrator.handle()

Execute a command:

```typescript
const result = await orchestrator.handle(text, context, options);
// Returns: FlowRunResult
```

**Parameters:**
- `text`: string - User input
- `context`: AssistantContext - Request context
- `options?: { confirmToken?: string }` - Optional confirmation token

**Returns:** Promise<FlowRunResult>

**Example:**

```typescript
const result = await orchestrator.handle(
  "book appointment for alex@example.com tomorrow 3pm",
  {
    actor: { userId: "user_123", role: "owner" },
    tenantId: "tenant_1",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
  }
);

if (result.final?.ok) {
  console.log("Success:", result.final.payload);
} else {
  console.log("Failed:", result.final?.message);
}
```

## API Server

### BusinessSpineApi

API server class:

```typescript
import { BusinessSpineApi, ApiConfig } from 'no-llm-business-assistant-spine';

const api = new BusinessSpineApi({
  apiKey: "your-secret-key",
  port: 3001,
  corsOrigins: ["http://localhost:3000"],
  logLevel: "info",
});
```

**ApiConfig:**
```typescript
type ApiConfig = {
  port?: number;
  apiKey?: string;
  corsOrigins?: string[];
  logLevel?: "debug" | "info" | "warn" | "error";
};
```

### api.handle()

Handle a command request:

```typescript
const response = await api.handle({
  text: "book appointment",
  context: {
    userId: "user_123",
    role: "owner",
    tenantId: "tenant_1",
  },
});
```

**Request:**
```typescript
type ApiRequest = {
  text: string;
  context?: {
    userId?: string;
    role?: Role;
    tenantId?: string;
    timezone?: string;
    locale?: string;
    channel?: "cmdk" | "chat" | "api";
  };
  confirmToken?: string;
};
```

**Response:**
```typescript
type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

### api.detectIntents()

Detect intents without executing:

```typescript
const response = await api.detectIntents({
  text: "book appointment",
  context: { userId: "user_123", role: "owner" },
});
```

### api.health()

Health check:

```typescript
const response = await api.health();
// Returns: { success: true, data: { status: "ok", timestamp: "...", version: "..." } }
```

### api.validateApiKey()

Validate an API key:

```typescript
const isValid = api.validateApiKey(apiKey);
```

### getBusinessSpineApi()

Get or create singleton instance:

```typescript
import { getBusinessSpineApi } from 'no-llm-business-assistant-spine';

const api = getBusinessSpineApi({
  apiKey: process.env.BUSINESS_SPINE_API_KEY,
});
```

## Spine Interface

### Spine

Interface for creating custom spines:

```typescript
type Spine = {
  name: string;
  description: string;
  detectIntent: (text: string, ctx: AssistantContext) => Intent[];
  extractEntities: (intent: Intent, text: string, ctx: AssistantContext) => Extraction;
  buildFlow: (intent: Intent, extraction: Extraction, ctx: AssistantContext) => FlowStep[];
};
```

### Extraction

Entity extraction result:

```typescript
type Extraction = {
  entities: Record<string, unknown>;
  missing: string[];
};
```

### Pattern

Pattern for intent detection:

```typescript
type Pattern = {
  spine: string;
  intent: string;
  re: RegExp;
  baseConfidence: number;
  hint?: string;
};
```

### detectByPatterns()

Utility for pattern-based intent detection:

```typescript
import { detectByPatterns } from 'no-llm-business-assistant-spine';

const intents = detectByPatterns(text, patterns);
```

## Tool Registry

### ToolRegistry

Map of tool names to functions:

```typescript
type ToolRegistry = {
  [toolName: string]: (args: {
    ctx: AssistantContext;
    input: Record<string, unknown>;
  }) => Promise<ToolResult>;
};
```

### Example Tool

```typescript
const tools: ToolRegistry = {
  "booking.create": async ({ ctx, input }) => {
    const { clientQuery, startISO, durationMin } = input;
    
    // Implement your logic here
    
    return {
      ok: true,
      data: {
        id: "booking_123",
        clientId: "client_456",
        startISO,
        status: "booked",
      },
    };
  },
};
```

## Error Handling

### BusinessSpineError

Base error class:

```typescript
class BusinessSpineError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public statusCode: number = 500
  );
  
  toJSON(): {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### Error Types

```typescript
// Validation error (400)
throw new ValidationError("Invalid input", { field: "email" });

// Not found (404)
throw new NotFoundError("Client not found", { id: "client_123" });

// Unauthorized (401)
throw new UnauthorizedError("Invalid API key");

// Forbidden (403)
throw new ForbiddenError("Admin access required");

// Conflict (409)
throw new ConflictError("Email already exists");

// Timeout (408)
throw new TimeoutError("Request timeout");

// Rate limit (429)
throw new RateLimitError("Too many requests");
```

### handleError()

Handle any error:

```typescript
import { handleError } from 'no-llm-business-assistant-spine';

try {
  // Your code
} catch (error) {
  const handledError = handleError(error);
  console.error(handledError.toJSON());
}
```

### asyncHandler()

Wrap async functions with error handling:

```typescript
import { asyncHandler } from 'no-llm-business-assistant-spine';

const myFunction = asyncHandler(async (userId: string) => {
  // Your code that might throw
  return result;
});
```

### retryWithBackoff()

Retry failed operations:

```typescript
import { retryWithBackoff } from 'no-llm-business-assistant-spine';

const result = await retryWithBackoff(
  async () => {
    // Your operation that might fail
    return await fetch(url);
  },
  {
    maxRetries: 3,
    initialDelay: 100,
    maxDelay: 5000,
    backoffMultiplier: 2,
  }
);
```

## Logging

### Logger

Structured logging:

```typescript
import { getLogger, setLogLevel } from 'no-llm-business-assistant-spine';

// Set global log level
setLogLevel("debug");

// Get logger for module
const logger = getLogger("my-module");

// Log messages
logger.debug("Debug message", { userId: "123" });
logger.info("Info message", { action: "create" });
logger.warn("Warning message", { count: 0 });
logger.error("Error message", error, { requestId: "456" });

// Create child logger
const childLogger = logger.child("sub-module");
```

### Log Levels

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages

### Log Entry

```typescript
type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
};
```

## Entity Extraction

### extractEmail()

Extract email from text:

```typescript
import { extractEmail } from 'no-llm-business-assistant-spine';

const email = extractEmail("Send to alex@example.com");
// Returns: "alex@example.com"
```

### extractPhone()

Extract phone number:

```typescript
import { extractPhone } from 'no-llm-business-assistant-spine';

const phone = extractPhone("Call 555-123-4567");
// Returns: "555-123-4567"
```

### extractMoney()

Extract money amount:

```typescript
import { extractMoney } from 'no-llm-business-assistant-spine';

const amount = extractMoney("Charge $120.50");
// Returns: 120.50
```

### extractId()

Extract ID with prefix:

```typescript
import { extractId } from 'no-llm-business-assistant-spine';

const id = extractId("Cancel booking_abc123", "booking");
// Returns: "booking_abc123"
```

### extractDateTime()

Extract date and time:

```typescript
import { extractDateTime } from 'no-llm-business-assistant-spine';

const result = extractDateTime("tomorrow 3pm", new Date().toISOString());
// Returns: { dateISO: "2025-12-16", time: "15:00", dateTimeISO: "2025-12-16T15:00:00.000Z" }
```

Supports:
- Relative dates: "today", "tomorrow", "next monday"
- Explicit dates: "2025-12-15", "12/15", "dec 15"
- Times: "3pm", "15:30", "3:30pm"

## Diagnostics

### runAllDiagnostics()

Run all health checks:

```typescript
import { runAllDiagnostics } from 'no-llm-business-assistant-spine';

const result = await runAllDiagnostics({
  tenantId: "tenant_1",
  actorId: "admin_1",
  role: "admin",
});

console.log(result);
// {
//   runId: "run_xyz123",
//   at: "2025-12-15T12:00:00.000Z",
//   results: [...],
//   summary: { ok: 6, warn: 0, fail: 0 }
// }
```

### DiagResult

```typescript
type DiagResult = {
  id: string;           // Check ID (e.g., "db", "redis")
  name: string;         // Human-readable name
  status: "ok" | "warn" | "fail";
  ms: number;           // Duration in milliseconds
  details?: Record<string, unknown>;
};
```

## Business Spine Bridge

### BusinessSpineBridge

Bridge to business infrastructure:

```typescript
import { BusinessSpineBridge, getBusinessSpineBridge } from 'no-llm-business-assistant-spine';

const bridge = getBusinessSpineBridge({
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  queueUrl: process.env.QUEUE_URL,
  tenantId: "tenant_1",
  features: {
    diagnostics: true,
    analytics: true,
    automation: false,
  },
});

await bridge.initialize();

// Check feature flags
if (bridge.isFeatureEnabled("diagnostics")) {
  // Run diagnostics
}

// Get tenant ID
const tenantId = bridge.getTenantId();

// Shutdown
await bridge.shutdown();
```

## Next.js Handlers

### handleChat()

Next.js API route for chat:

```typescript
// app/api/spine/chat/route.ts
import { handleChat } from 'no-llm-business-assistant-spine';

export const POST = handleChat;
```

### handleIntents()

Next.js API route for intent detection:

```typescript
// app/api/spine/intents/route.ts
import { handleIntents } from 'no-llm-business-assistant-spine';

export const POST = handleIntents;
```

### handleHealth()

Next.js API route for health check:

```typescript
// app/api/spine/health/route.ts
import { handleHealth } from 'no-llm-business-assistant-spine';

export const GET = handleHealth;
```

## Examples

### Complete Example

```typescript
import {
  createDefaultOrchestrator,
  AssistantContext,
  getLogger,
  handleError,
} from 'no-llm-business-assistant-spine';

const logger = getLogger("my-app");
const orchestrator = createDefaultOrchestrator();

async function processCommand(
  text: string,
  userId: string,
  role: "owner" | "staff" | "admin"
) {
  try {
    logger.info("Processing command", { text, userId, role });

    const ctx: AssistantContext = {
      actor: { userId, role },
      tenantId: "my-tenant",
      nowISO: new Date().toISOString(),
      timezone: "America/New_York",
      channel: "api",
    };

    const result = await orchestrator.handle(text, ctx);

    if (result.final?.ok) {
      logger.info("Command succeeded", { payload: result.final.payload });
      return result.final.payload;
    } else {
      logger.warn("Command failed", { message: result.final?.message });
      throw new Error(result.final?.message || "Command failed");
    }
  } catch (error) {
    const handledError = handleError(error);
    logger.error("Error processing command", handledError);
    throw handledError;
  }
}

// Usage
const result = await processCommand(
  "book appointment for alex@example.com tomorrow 3pm",
  "user_123",
  "owner"
);
```

## Type Exports

All types are exported from the main module:

```typescript
import type {
  // Core
  AssistantContext,
  Role,
  Intent,
  Extraction,
  FlowStep,
  FlowRunResult,
  ToolResult,
  ToolRegistry,
  
  // Spine
  Spine,
  Pattern,
  
  // API
  ApiConfig,
  ApiRequest,
  ApiResponse,
  
  // Error
  ErrorCode,
  
  // Logging
  LogLevel,
  LogEntry,
  
  // Diagnostics
  DiagStatus,
  DiagResult,
  DiagContext,
  RunResponse,
  
  // Bridge
  BusinessSpineConfig,
} from 'no-llm-business-assistant-spine';
```
