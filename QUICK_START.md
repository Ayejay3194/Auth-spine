# Business Spine Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Step 1: Clone and Install (2 min)

```bash
# Frontend
cd temp-saas/saas-builder-main
npm install

# Backend
cd ../../business-spine
npm install
npm install @prisma/client prisma
```

### Step 2: Configure Environment (1 min)

**Frontend** - `temp-saas/saas-builder-main/.env.local`:
```env
NEXT_PUBLIC_BUSINESS_SPINE_URL=http://localhost:3001
BUSINESS_SPINE_API_KEY=dev-api-key-12345
BUSINESS_SPINE_TENANT_ID=default-tenant
BUSINESS_SPINE_ENABLED=true
BUSINESS_SPINE_INIT_TIMEOUT=30000
BUSINESS_SPINE_DATABASE_URL=postgresql://postgres:password@localhost:5432/business_spine
```

**Backend** - `business-spine/.env`:
```env
TENANT_ID=default-tenant
PORT=3001
NODE_ENV=development
BUSINESS_SPINE_API_KEY=dev-api-key-12345
DATABASE_URL=postgresql://postgres:password@localhost:5432/business_spine
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### Step 3: Database Setup (1 min)

```bash
cd business-spine

# Create database
createdb business_spine

# Run migrations
npx prisma migrate dev --name init

# Generate client
npx prisma generate
```

### Step 4: Start Services (1 min)

**Terminal 1 - Backend**:
```bash
cd business-spine
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd temp-saas/saas-builder-main
npm run dev
# Runs on http://localhost:3000
```

### Step 5: Verify (Optional)

1. Open http://localhost:3000
2. Sign in with test credentials
3. Navigate to dashboard
4. Check browser console for "Business Spine initialized"
5. Test features through UI

---

## Key Files Reference

### Frontend
| File | Purpose |
|------|---------|
| `app/business-spine-provider.tsx` | Initialization provider |
| `lib/business-spine-client.ts` | Client library |
| `components/business-spine-error-boundary.tsx` | Error handling |
| `middleware.ts` | Route protection |
| `app/api/business/*` | API routes |

### Backend
| File | Purpose |
|------|---------|
| `src/api/server.ts` | Express server |
| `src/api/auth-middleware.ts` | Authentication |
| `src/adapters/prisma.ts` | Database adapter |
| `prisma/schema.prisma` | Database schema |

---

## Common Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code quality

# Backend
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm run test         # Run tests
npx prisma studio   # Open database UI
npx prisma migrate  # Run migrations
```

---

## Troubleshooting

### "Cannot connect to Business Spine"
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_BUSINESS_SPINE_URL` is correct
- Verify API key matches between frontend and backend

### "Database connection failed"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run: `createdb business_spine`
- Run: `npx prisma migrate dev`

### "Authentication failed"
- Verify `BUSINESS_SPINE_API_KEY` matches in both `.env` files
- Check that you're logged in (NextAuth session)
- Verify `X-Tenant-ID` header is being sent

### "Port already in use"
- Change port in `.env` (e.g., PORT=3002)
- Or kill process: `lsof -ti:3001 | xargs kill -9`

---

## Testing the Integration

### Test 1: Initialization
```bash
# Check browser console
# Should see: "Business Spine initialized"
```

### Test 2: API Authentication
```bash
curl -X POST http://localhost:3001/api/business/init \
  -H "Authorization: Bearer dev-api-key-12345" \
  -H "X-Tenant-ID: default-tenant" \
  -H "Content-Type: application/json"
```

### Test 3: Database
```bash
npx prisma studio
# Opens http://localhost:5555
# View all database tables and data
```

### Test 4: Error Handling
```bash
# Stop backend server
# Reload frontend
# Should show "Service Unavailable" message
# Click Retry after restarting backend
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  (http://localhost:3000)                                │
├─────────────────────────────────────────────────────────┤
│  • BusinessSpineProvider (auto-init)                    │
│  • Error Boundary (error handling)                      │
│  • Middleware (route protection)                        │
│  • API Routes (auth + forwarding)                       │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │ (Bearer Token + Tenant ID)
┌────────────────▼────────────────────────────────────────┐
│              Business Spine Backend                      │
│  (http://localhost:3001)                                │
├─────────────────────────────────────────────────────────┤
│  • Express Server                                       │
│  • Auth Middleware (validates API key)                  │
│  • Tool Registry (business logic)                       │
│  • Prisma Adapter (database access)                     │
└────────────────┬────────────────────────────────────────┘
                 │ SQL
                 │
┌────────────────▼────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  (localhost:5432/business_spine)                        │
├─────────────────────────────────────────────────────────┤
│  • Clients, Bookings, Invoices, Promos                 │
│  • Audit Logs, Hash Chain                              │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables Explained

### Frontend (Next.js)
- `NEXT_PUBLIC_BUSINESS_SPINE_URL` - Backend URL (public)
- `BUSINESS_SPINE_API_KEY` - Auth token (secret)
- `BUSINESS_SPINE_TENANT_ID` - Tenant identifier
- `BUSINESS_SPINE_ENABLED` - Feature flag
- `BUSINESS_SPINE_INIT_TIMEOUT` - Init timeout (ms)
- `BUSINESS_SPINE_DATABASE_URL` - Database URL

### Backend (Express)
- `TENANT_ID` - Default tenant
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `BUSINESS_SPINE_API_KEY` - Must match frontend
- `DATABASE_URL` - PostgreSQL connection
- `CORS_ORIGINS` - Allowed origins
- `LOG_LEVEL` - Logging level

---

## Next Steps

1. **Customize** - Modify Business Spine modules for your needs
2. **Deploy** - Set up CI/CD pipeline
3. **Monitor** - Configure logging and alerting
4. **Scale** - Add caching and load balancing
5. **Secure** - Enable HTTPS and rate limiting

---

## Resources

- **Full Integration Guide**: `BUSINESS_SPINE_INTEGRATION.md`
- **Implementation Checklist**: `CRITICAL_GAPS_CHECKLIST.md`
- **Business Spine README**: `business-spine/README.md`
- **API Documentation**: `business-spine/src/api/server.ts`

---

## Support

For detailed troubleshooting, see `BUSINESS_SPINE_INTEGRATION.md` troubleshooting section.

**Status**: ✅ All critical gaps implemented and ready to use.
