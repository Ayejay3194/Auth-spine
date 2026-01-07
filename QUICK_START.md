# Auth-Spine Quick Start Guide

Get up and running with Auth-Spine in under 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/auth-spine.git
cd auth-spine
npm install
```

### 2. Database Configuration

```bash
# Create PostgreSQL database
createdb authspine

# Copy environment file
cp .env.example .env

# Edit .env and add your DATABASE_URL
nano .env
```

Example `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/authspine
JWT_SECRET=your-32-character-secret-key-here-please-change
ISSUER=http://localhost:4000
```

### 3. Run Database Migrations

```bash
cd apps/business-spine
npx prisma migrate dev
npx prisma generate
cd ../..
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts both:
- Auth Server on http://localhost:4000
- Business App on http://localhost:3000

## Verify Installation

### Check Auth Server

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-07T...",
  "uptime": 1234
}
```

### Check Business App

Open http://localhost:3000 in your browser. You should see the Auth-Spine dashboard.

## Quick Commands

### Development
```bash
npm run dev              # Start all services
npm run dev:auth         # Auth server only
npm run dev:ui           # Business app only
```

### Building
```bash
npm run build            # Build all packages
npm run typecheck        # Type check everything
```

### Database
```bash
cd apps/business-spine

npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma db seed       # Seed test data
```

### Testing
```bash
npm test                 # Run all tests
npm run test:coverage    # With coverage report
```

## Test User Credentials

After seeding, use these credentials:

```
Email: admin@example.com
Password: AdminPass123!
Role: admin
```

## Create Your First User

```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

## Login and Get Token

```bash
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "client_id": "business-spine-app"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "abc123...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

## Use the Token

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/oauth/userinfo
```

## Project Structure

```
auth-spine/
├── apps/
│   └── business-spine/       # Main Next.js app (@spine/business-spine)
│       ├── src/
│       │   ├── app/          # Next.js pages
│       │   ├── security/     # Security modules (auth, mfa, rbac)
│       │   ├── ops/          # Operations (kill switches, launch gates)
│       │   └── suites/       # Business feature suites
│       ├── prisma/           # Database schema
│       └── package.json
│
├── packages/
│   ├── auth-server/          # JWT auth server (port 4000)
│   ├── shared-db/            # Shared Prisma client
│   ├── shared-auth/          # Auth utilities
│   └── enterprise/           # 60+ enterprise features
│
├── scripts/                  # Build & utility scripts
├── tests/                    # Test suites
└── package.json              # Root workspace config
```

## Next Steps

1. **Read the docs:**
   - [README.md](./README.md) - Full feature list
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow
   - [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - API reference

2. **Explore features:**
   - Multi-factor authentication (MFA)
   - Role-based access control (RBAC)
   - Audit logging
   - AI/ML capabilities
   - Payment processing

3. **Customize:**
   - Add your own business logic
   - Configure external services
   - Set up deployment

## Common Issues

### Port already in use
```bash
# Kill processes on ports 3000 and 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Prisma Client not found
```bash
cd apps/business-spine
npx prisma generate
```

### Module resolution errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- Documentation: See [README.md](./README.md)
- Issues: https://github.com/your-username/auth-spine/issues
- Discussions: https://github.com/your-username/auth-spine/discussions

## Development Tips

1. **TypeScript strict mode** - All code must be TypeScript
2. **Run type check** before committing: `npm run typecheck`
3. **Format code** with: `npm run format`
4. **Check linting** with: `npm run lint:check`

## Ready for Production?

See [DEPLOYMENT_READY_SUMMARY.md](./DEPLOYMENT_READY_SUMMARY.md) for the production deployment checklist.

---

**You're all set! Happy coding!** 🚀
