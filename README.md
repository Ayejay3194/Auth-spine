# Auth-Spine 🔐

> Enterprise-grade TypeScript authentication and authorization system with multi-tenant RBAC, JWT, MFA, and 60+ enterprise features.

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18.0+-green.svg)](https://nodejs.org/)

## 🎯 What is Auth-Spine?

Auth-Spine is a **unified TypeScript monorepo** providing production-ready authentication, authorization, and business platform features. Perfect for SaaS applications, multi-tenant systems, and enterprise platforms.

### Key Features

✅ **100% TypeScript** - Type-safe from end to end  
✅ **Unified Repository** - All packages work together seamlessly  
✅ **Database-Backed Sessions** - No data loss on restart  
✅ **7-Tier RBAC** - Granular role-based access control  
✅ **JWT Authentication** - HS256 & RS256 support  
✅ **MFA Ready** - TOTP with recovery codes  
✅ **Rate Limiting** - Brute force protection  
✅ **Audit Logging** - Complete compliance trail  
✅ **60+ Enterprise Features** - AI/ML, booking, payments, and more  

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
PostgreSQL >= 14.0
npm >= 9.0.0
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/auth-spine.git
cd auth-spine

# 2. Run the setup script
chmod +x setup.sh
./setup.sh

# 3. Start development servers
npm run dev
```

Services will be available at:
- 🌐 **Business App**: http://localhost:3000
- 🔐 **Auth Server**: http://localhost:4000
- 📊 **Health Check**: http://localhost:4000/health

## 📁 Project Structure

```
auth-spine/
├── packages/
│   ├── auth-server/          # JWT authentication server (Port 4000)
│   ├── shared/               # Unified auth + database exports ⭐ NEW
│   ├── shared-auth/          # Shared auth utilities (legacy)
│   ├── shared-db/            # Shared Prisma client (legacy)
│   └── enterprise/           # 60+ business packages
├── apps/
│   └── business-spine/       # Main Next.js application (Port 3000)
├── .env.example              # Environment template
├── setup.sh                  # Automated setup script
└── README.md                 # You are here
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/authspine

# Auth Server
JWT_SECRET=your-super-secret-key-32-characters-minimum
ISSUER=http://localhost:4000

# Optional Services
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
```

See `.env.example` for all available options.

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:auth         # Start auth server only
npm run dev:ui           # Start business app only

# Building
npm run build            # Build all packages
npm run build:auth       # Build auth server
npm run build:ui         # Build business app

# Testing
npm test                 # Run all tests
npm run typecheck        # Type check all packages

# Database
cd apps/business-spine
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio
npx prisma db seed       # Seed database
```

## 🏗️ Architecture

### Unified TypeScript Monorepo

All packages are written in TypeScript and connected through workspace dependencies:

```typescript
// packages/auth-server uses shared module
import { prisma } from '@spine/shared/prisma'

// apps/business-spine uses shared module
import { prisma } from '@spine/shared/prisma'
```

### Authentication Flow

```
User Login
  ↓
POST /token (auth-server:4000)
  ↓
Verify credentials → Create session in DB → Issue JWT
  ↓
Return access_token + refresh_token
  ↓
Frontend stores in httpOnly cookie
  ↓
Protected requests → Verify JWT → Check RBAC → Return data
```

### Database Schema

Single PostgreSQL database shared by all services:

- **Session** - User sessions with tokens
- **RefreshToken** - Token refresh management
- **AuditLog** - Security audit trail
- **User** - User accounts
- **Provider/Client** - Business entities
- **Booking, Payment, Review** - Business features

## 🔒 Security Features

- ✅ **Password Complexity** - 8+ chars, uppercase, lowercase, number, special char
- ✅ **Rate Limiting** - 5 login attempts per 15 minutes
- ✅ **CSP Headers** - XSS protection
- ✅ **HSTS Enabled** - Force HTTPS
- ✅ **Session Cleanup** - Automatic hourly cleanup
- ✅ **Audit Logging** - All auth events logged to database
- ✅ **Database-Backed** - Sessions persist across restarts

## 📊 RBAC System

7-tier role hierarchy:

```
system → admin → dev-admin → owner → practitioner → client → guest
```

Permissions format: `resource:action`

Examples:
- `users:read` - View users
- `bookings:create` - Create bookings
- `payments:refund` - Process refunds
- `admin:*` - All admin permissions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/auth-server
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Production Checklist

- [ ] Switch to RS256 for JWT (recommended)
- [ ] Use environment-specific secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable Redis caching
- [ ] Configure monitoring (Sentry)
- [ ] Set up log aggregation
- [ ] Configure secrets management
- [ ] Enable database encryption at rest

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# Check health
curl http://localhost:4000/health
curl http://localhost:3000/api/health
```

## 📚 API Documentation

### Auth Server (Port 4000)

#### POST `/token`
Authenticate and get access token

```bash
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "client_id": "business-spine-app"
  }'
```

#### POST `/token/refresh`
Refresh an expired token

```bash
curl -X POST http://localhost:4000/token/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "abc123...",
    "client_id": "business-spine-app"
  }'
```

#### GET `/oauth/userinfo`
Get user information

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:4000/oauth/userinfo
```

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes (TypeScript only!)
4. Run `npm run typecheck` and `npm test`
5. Submit a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

**Port already in use**
```bash
# Find process using port 4000 or 3000
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Prisma Client not generated**
```bash
cd apps/business-spine
npx prisma generate
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built with:
- [TypeScript](https://www.typescriptlang.org/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Jose](https://github.com/panva/jose)
- [Zod](https://zod.dev/)

---

**Built with ❤️ in TypeScript**
