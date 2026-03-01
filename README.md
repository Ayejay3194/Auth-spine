# Auth-Spine 🔐

> **Drop-in Backend/Full Stack Solution** - Enterprise-grade TypeScript authentication and authorization system with multi-tenant RBAC, JWT, MFA, and 60+ enterprise features.

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18.0+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue.svg)](https://kubernetes.io/)

## 🎯 What is Auth-Spine?

Auth-Spine is a **complete drop-in backend/full stack solution** - a unified TypeScript monorepo providing production-ready authentication, authorization, and business platform features. Perfect for SaaS applications, multi-tenant systems, and enterprise platforms.

**🚀 Deploy anywhere in 5 minutes** - See [DROP_IN_GUIDE.md](DROP_IN_GUIDE.md) for the complete quick-start guide.

### 🚀 Ready to Deploy Anywhere

- **Docker** - Full-stack orchestration with docker-compose ✅
- **Kubernetes** - Production-ready K8s manifests included ✅
- **Cloud** - Deploy to AWS, GCP, Azure, or any cloud provider ✅
- **Vercel/Netlify** - Automated CI/CD pipeline configured ✅
- **On-Premise** - Self-hosted with complete control ✅

### Key Features

✅ **100% TypeScript** - Type-safe from end to end  
✅ **Unified Repository** - All packages work together seamlessly  
✅ **Database-Backed Sessions** - No data loss on restart  
✅ **7-Tier RBAC** - Granular role-based access control  
✅ **JWT Authentication** - HS256 & RS256 support  
✅ **MFA Ready** - TOTP with recovery codes  
✅ **Rate Limiting** - Brute force protection  
✅ **Audit Logging** - Complete compliance trail  
✅ **Advanced AI/ML System** - 25+ ML functions, RAG, LLM integration, bioplausible learning ⭐
✅ **60+ Enterprise Features** - AI/ML, booking, payments, and more  

## 🚀 Quick Start

### Method 1: Drop-In Integration (30 Seconds)

Add Auth-Spine to your existing project:

```bash
# Install core package
npm install @auth-spine/core

# Use in your app
import { AuthSpine } from '@auth-spine/core';

const authSpine = new AuthSpine({
  auth: { jwtSecret: process.env.JWT_SECRET },
  ai: { enabled: true },
  enterprise: { enabled: true }
});

await authSpine.initialize();
// Done! Auth + AI/ML + Enterprise features ready
```

**See [DROP_IN_INTEGRATION_GUIDE.md](DROP_IN_INTEGRATION_GUIDE.md) for complete integration guide.**

### Method 2: Full Repository Setup

Clone and run the complete system:

```bash
# 1. Clone the repository
git clone https://github.com/Ayejay3194/Auth-spine.git
cd Auth-spine

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

### One-Command Docker Deployment

```bash
# Copy environment template
cp .env.docker .env

# Edit .env with your configuration
nano .env

# Start everything with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
```

### Kubernetes Deployment

```bash
# See k8s/README.md for complete instructions
kubectl apply -f k8s/
```

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

## 🤖 AI/ML Capabilities

Auth-Spine includes an **advanced, production-ready AI/ML system** with multiple specialized packages:

### AI/ML Packages

1. **Solari GenAI Kit** - Self-hosted controlled generation
   - Schema-validated outputs with automatic JSON repair
   - RAG (Retrieval-Augmented Generation)
   - Tool framework and router
   - Training pipeline (LoRA/QLoRA)
   - Evaluation and regression testing

2. **Faux LLM Platform** - Multi-provider LLM orchestration
   - OpenAI, Anthropic, local vLLM, llama-cpp support
   - Guardrails and policy engine
   - Multi-tenant architecture
   - Session management with feedback loops

3. **ML Platform** - Specialized ML packages
   - `ml-core` - Types, metrics, drift detection
   - `ml-ranking` - Learning-to-rank + calibration
   - `ml-recs` - Two-tower models + bandits
   - `ml-risk` - Fraud/abuse detection
   - `ml-forecast` - Time series forecasting
   - `ml-search` - Semantic search + reranking
   - `ml-astro` - Astrology-specific models

4. **Bioplausible Learning** - Advanced learning algorithms
   - Direct Feedback Alignment (DFA)
   - Feedback Alignment (FA)
   - Predictive Coding (PC)
   - Equilibrium Propagation (EP)

5. **Unified AI Agent** - Transformers.js integration
   - Autonomous operation (no external LLM required)
   - NLP: sentiment, intent, NER, QA, summarization
   - Teacher mode with continuous learning
   - Authentication-based firewall

### Quick Start

```typescript
import { UnifiedAIAgent } from '@auth-spine/enterprise';

const agent = new UnifiedAIAgent({ authLevel: 'authenticated' });
await agent.initialize();

// Sentiment analysis
const sentiment = await agent.analyzeSentiment('Great product!');
// { score: 0.95, label: 'POSITIVE' }

// Intent detection
const intent = await agent.detectIntent('I want to book');
// { intent: 'booking', confidence: 0.92 }
```

**See [AI_ML_CAPABILITIES.md](AI_ML_CAPABILITIES.md) for complete AI/ML documentation.**

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

## 🚢 Deployment Options

Auth-Spine is a **true drop-in solution** with multiple deployment options:

### 1. Docker Compose (Recommended for Quick Start)

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Development deployment
docker-compose up -d
```

### 2. Kubernetes

```bash
# Complete K8s manifests included
kubectl apply -f k8s/

# See k8s/README.md for details
```

### 3. Cloud Platforms

**Vercel** (Frontend + Serverless Functions)
```bash
vercel deploy
```

**AWS** (ECS, EKS, or EC2)
```bash
# Use provided docker-compose.yml or k8s/ manifests
```

**Google Cloud** (Cloud Run, GKE)
```bash
# Deploy with Docker or Kubernetes configs
```

### 4. Traditional Hosting

```bash
npm run build
npm start
```

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Switch to RS256 for JWT (recommended)
- [ ] Use strong secrets (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Review [SECURITY.md](SECURITY.md)

## 📚 API Documentation

### Quick Reference

- **[DROP_IN_INTEGRATION_GUIDE.md](DROP_IN_INTEGRATION_GUIDE.md)** - How to integrate Auth-Spine into any project
- **[PACKAGE_CATALOG.md](PACKAGE_CATALOG.md)** - Complete catalog of all 42 packages
- **[PACKAGE_ORGANIZATION.md](PACKAGE_ORGANIZATION.md)** - Package orchestration & extension guide
- **[AI_ML_CAPABILITIES.md](AI_ML_CAPABILITIES.md)** - Complete AI/ML feature overview
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- **[SECURITY.md](SECURITY.md)** - Security policy and best practices

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

### Testing the API

**Postman Collection** (Recommended)
```bash
# Import: api-collections/auth-spine-postman.json
# See: api-collections/README.md
```

**cURL Examples**
```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "SecurePass123!", "client_id": "business-spine-app"}'
```

## 🔌 Integration Examples

Ready-to-use integration examples for popular frameworks:

- **React** - `examples/integration/react-integration/`
- **Vue** - Coming soon
- **Angular** - Coming soon
- **React Native** - Coming soon
- **Express** - Coming soon

Each example includes:
- Complete authentication flow
- Token management
- Protected routes
- Auto-refresh logic

See `examples/integration/README.md` for details.

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
