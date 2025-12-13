# Business Spine Integration Guide

This document outlines the critical gaps that have been addressed to integrate Business Spine with the Auth-spine application.

## Critical Gaps Fixed

### 1. ✅ App Layout Initialization
**Status**: FIXED

The Business Spine is now automatically initialized when the app starts through the root provider component.

**Implementation**:
- Created `app/business-spine-provider.tsx` - React context provider that handles Business Spine initialization
- Updated `app/providers.tsx` to include `BusinessSpineProvider` in the provider chain
- Initialization happens automatically on app load with automatic retry logic

**Usage**:
```tsx
// Business Spine is automatically initialized in the root layout
// Access it anywhere with useBusinessSpine() hook
import { useBusinessSpine } from '@/app/business-spine-provider'

export function MyComponent() {
  const { client, initialized, error } = useBusinessSpine()
  // Use client to call Business Spine APIs
}
```

---

### 2. ✅ Environment Variables Documentation
**Status**: FIXED

Added comprehensive Business Spine configuration to `.env.example`.

**New Environment Variables**:
```env
# Business Spine Configuration
NEXT_PUBLIC_BUSINESS_SPINE_URL="http://localhost:3001"
BUSINESS_SPINE_API_KEY="your-business-spine-api-key"
BUSINESS_SPINE_TENANT_ID="default-tenant"
BUSINESS_SPINE_ENABLED=true
BUSINESS_SPINE_INIT_TIMEOUT=30000

# Business Spine Database
BUSINESS_SPINE_DATABASE_URL="postgresql://username:password@localhost:5432/business_spine"

# Business Spine Features
BUSINESS_SPINE_MODULES="booking,crm,payments,marketing,analytics,admin_security"
BUSINESS_SPINE_ASSISTANT_ENABLED=true
BUSINESS_SPINE_ASSISTANT_ENGINES="predictive_scheduling,client_behavior,dynamic_pricing,segmentation"
```

**Configuration**:
1. Copy `.env.example` to `.env.local`
2. Update `BUSINESS_SPINE_URL` to point to your Business Spine instance
3. Set `BUSINESS_SPINE_API_KEY` to a secure token
4. Configure database URL if using Prisma adapter

---

### 3. ✅ Middleware Setup
**Status**: FIXED

Created comprehensive middleware to handle Business Spine initialization and error states.

**Implementation**:
- Updated `middleware.ts` with Business Spine initialization logic
- Middleware checks Business Spine health on protected routes
- Automatic timeout handling (configurable via `BUSINESS_SPINE_INIT_TIMEOUT`)
- Graceful degradation if Business Spine is unavailable

**Protected Routes**:
- `/dashboard/*` - Requires Business Spine initialization
- `/settings/*` - Requires Business Spine initialization
- `/api/protected/*` - Requires Business Spine initialization
- `/api/business/*` - Requires authentication

**Features**:
- Initialization happens once per app instance
- Concurrent requests wait for initialization to complete
- Health check endpoint: `GET /health` (no auth required)

---

### 4. ✅ Database Adapter
**Status**: FIXED

Created Prisma adapter for persistent data storage.

**Files Created**:
- `business-spine/src/adapters/prisma.ts` - Full Prisma implementation
- `business-spine/prisma/schema.prisma` - Database schema

**Supported Models**:
- `Client` - Customer information with tags and notes
- `Booking` - Service bookings with status tracking
- `Invoice` - Payment invoices with status management
- `Promo` - Marketing promotions with expiration
- `AuditLog` - Audit trail for compliance
- `HashChain` - Blockchain-style audit verification

**Setup**:
```bash
# Install Prisma
npm install @prisma/client prisma

# Set database URL in .env
BUSINESS_SPINE_DATABASE_URL="postgresql://user:password@localhost:5432/business_spine"

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

**Usage**:
```typescript
import { initializePrisma, disconnectPrisma } from '@/src/adapters/prisma'

// Initialize on app start
await initializePrisma()

// Disconnect on shutdown
await disconnectPrisma()
```

---

### 5. ✅ Error Boundary
**Status**: FIXED

Created comprehensive error boundary and initialization guard components.

**Components**:
- `BusinessSpineErrorBoundary` - Catches React errors from Business Spine failures
- `BusinessSpineInitializationGuard` - Handles initialization states and health checks

**Features**:
- Beautiful error UI with retry functionality
- Loading state with spinner animation
- Service unavailable state with helpful messaging
- Automatic retry on user action
- Graceful fallback to home page

**Usage**:
```tsx
import { BusinessSpineErrorBoundary, BusinessSpineInitializationGuard } from '@/components/business-spine-error-boundary'

export default function RootLayout({ children }) {
  return (
    <BusinessSpineErrorBoundary>
      <BusinessSpineInitializationGuard>
        {children}
      </BusinessSpineInitializationGuard>
    </BusinessSpineErrorBoundary>
  )
}
```

---

### 6. ✅ Authentication Integration
**Status**: FIXED

Added authentication to all Business Spine API endpoints.

**Backend Authentication** (`business-spine/src/api/auth-middleware.ts`):
- `authMiddleware` - Requires valid API key and tenant ID
- `optionalAuthMiddleware` - Optional authentication with fallback
- `requireRole` - Role-based access control

**API Endpoints with Auth**:

#### Protected Endpoints (Require Authentication):
```
POST /api/business/init - Initialize Business Spine
```

#### Optional Auth Endpoints:
```
POST /assistant/chat - Chat with assistant
POST /assistant/intent - Detect user intents
POST /assistant/suggestions - Get smart suggestions
GET /system/info - Get system information
GET /system/plugins - List plugins
```

**Frontend API Routes** (with NextAuth):
- `POST /api/business/init` - Initialize Business Spine (requires session)
- `POST /api/business/chat` - Chat endpoint (requires session)
- `POST /api/business/suggestions` - Suggestions endpoint (requires session)

**Authentication Headers**:
```
Authorization: Bearer {BUSINESS_SPINE_API_KEY}
X-Tenant-ID: {BUSINESS_SPINE_TENANT_ID}
X-User-ID: {optional-user-id}
X-User-Role: {optional-user-role}
```

**Implementation**:
```typescript
// Frontend - automatically handled by API routes
const response = await fetch('/api/business/chat', {
  method: 'POST',
  body: JSON.stringify({ message, context })
})

// Backend - authentication is automatic via middleware
app.use('/api/business', authMiddleware)
app.post('/api/business/init', (req: AuthenticatedRequest, res) => {
  // req.userId, req.tenantId, req.role are available
})
```

---

## Setup Instructions

### 1. Install Dependencies

**Frontend (Next.js)**:
```bash
cd temp-saas/saas-builder-main
npm install
```

**Backend (Business Spine)**:
```bash
cd business-spine
npm install
npm install @prisma/client prisma
```

### 2. Configure Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_BUSINESS_SPINE_URL=http://localhost:3001
BUSINESS_SPINE_API_KEY=your-secure-api-key
BUSINESS_SPINE_TENANT_ID=default-tenant
BUSINESS_SPINE_ENABLED=true
BUSINESS_SPINE_DATABASE_URL=postgresql://user:password@localhost:5432/business_spine
```

**Backend** (`.env`):
```env
TENANT_ID=default-tenant
PORT=3001
NODE_ENV=development
BUSINESS_SPINE_API_KEY=your-secure-api-key
DATABASE_URL=postgresql://user:password@localhost:5432/business_spine
```

### 3. Setup Database

```bash
cd business-spine

# Create database
createdb business_spine

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd business-spine
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd temp-saas/saas-builder-main
npm run dev
# App runs on http://localhost:3000
```

### 5. Verify Integration

1. Open http://localhost:3000 in browser
2. Sign in with your credentials
3. Navigate to dashboard - Business Spine should initialize automatically
4. Check browser console for initialization logs
5. Test Business Spine features through the UI

---

## API Reference

### Business Spine Client

```typescript
import { getBusinessSpineClient } from '@/lib/business-spine-client'

const client = getBusinessSpineClient()

// Initialize
await client.initialize()

// Chat
const result = await client.chat('Hello', { actor: 'user@example.com' })

// Detect intents
const intents = await client.detectIntents('Book a meeting', context)

// Get suggestions
const suggestions = await client.getSuggestions(context)

// System info
const info = await client.getSystemInfo()
```

### Frontend API Routes

All routes require authentication (NextAuth session).

```typescript
// Initialize Business Spine
POST /api/business/init

// Chat with assistant
POST /api/business/chat
Body: { message: string, context?: object }

// Get suggestions
POST /api/business/suggestions
Body: { context?: object }
```

---

## Troubleshooting

### Business Spine Not Initializing

1. Check if Business Spine server is running on the configured URL
2. Verify `BUSINESS_SPINE_API_KEY` matches between frontend and backend
3. Check browser console for error messages
4. Verify network connectivity to Business Spine server

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` is correct
3. Check database exists: `psql -l | grep business_spine`
4. Run migrations: `npx prisma migrate dev`

### Authentication Errors

1. Verify `BUSINESS_SPINE_API_KEY` is set in both `.env` files
2. Check that `X-Tenant-ID` header is being sent
3. Ensure NextAuth session is valid before calling protected endpoints

### Middleware Timeout

1. Increase `BUSINESS_SPINE_INIT_TIMEOUT` if Business Spine is slow to start
2. Check Business Spine server logs for errors
3. Verify network latency to Business Spine server

---

## Security Considerations

1. **API Keys**: Store `BUSINESS_SPINE_API_KEY` securely, never commit to git
2. **Tenant Isolation**: Always validate `X-Tenant-ID` header
3. **Authentication**: All protected endpoints require valid API key
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Configure rate limits on Business Spine server
6. **Audit Logging**: All operations are logged for compliance

---

## Next Steps

1. Customize Business Spine modules for your use case
2. Implement additional smart engines
3. Add custom plugins
4. Configure payment processing
5. Set up email notifications
6. Deploy to production

For more information, see the Business Spine README and API documentation.
