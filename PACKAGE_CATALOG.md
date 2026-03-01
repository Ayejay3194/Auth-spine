# Package Catalog

Complete catalog of all packages in the Auth-Spine monorepo, their purposes, status, and relationships.

---

## 📊 Package Summary

**Total Packages**: 42  
**Active Packages**: 30  
**Deprecated/Duplicate**: 12  
**Enterprise Modules**: 50+

---

## 🎯 Package Categories

### 1. Core Authentication & Authorization

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@spine/auth-server` | 0.1.0 | ✅ Active | Main authentication server with JWT, MFA, RBAC |
| `@spine/shared-auth` | 0.1.0 | ✅ Active | Shared authentication utilities |
| `@auth-spine/auth` | 1.0.0 | ✅ Active | Enhanced authentication utilities |

### 2. Database & Storage

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@spine/shared-db` | 0.1.0 | ✅ Active | Shared database utilities and Prisma client |
| `@spine/shared` | 0.1.0 | ✅ Active | Shared utilities across packages |

### 3. AI/ML Packages

#### Core AI/ML
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@auth-spine/ml-platform` | 0.1.0 | ✅ Active | Unified ML platform with 7 specialized sub-packages |
| `@auth-spine/ml-core` | 0.1.0 | ✅ Active | ML core types, metrics, drift detection |
| `@auth-spine/insight-core` | 0.1.0 | ✅ Active | Unified AI/ML spine with ephemeris, vibe, astro signals |
| `bioplausible-learning` | 0.1.0 | ✅ Active | Advanced learning algorithms (DFA, FA, PC, EP) |

#### LLM Platforms
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `faux-llm-platform-v5` | 0.1.0 | ✅ Active | **Latest** - Multi-provider LLM with multi-tenant PostgreSQL |
| `faux-llm-platform-v4` | 0.1.0 | ⚠️ Deprecated | Use v5 |
| `faux-llm-platform-v3` | 0.1.0 | ⚠️ Deprecated | Use v5 |
| `faux-llm-platform` | 0.1.0 | ⚠️ Deprecated | Use v5 |

**Recommendation**: Consolidate to `faux-llm-platform-v5` only

#### GenAI & Tools
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `solari-genai-kit` | - | ✅ Active | Schema-controlled generation, RAG, training |
| `solari-genai-agent` | - | ✅ Active | GenAI agent implementation |
| `solari-agent-kit` | - | ✅ Active | Agent toolkit |

#### ML Modules
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `aj-ml-modules` | - | ✅ Active | Additional ML modules collection |

### 4. Data Science & Processing

#### Data Science Core
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@aj/ds-core` (ds-core) | 0.1.0 | ✅ Active | Lightweight, auditable DS core (datasets, features, pipelines) |
| `@aj/ds-core` (ds-core-new) | 0.1.0 | ⚠️ Duplicate | Merge with ds-core |

**Recommendation**: Consolidate to single `ds-core` package

#### Parquet Processing
| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@auth-spine/hyparquet` | 1.25.1 | ✅ Active | **Primary** - Parquet parser with Auth-Spine integration |
| `hyparquet` (master) | 1.25.1 | ⚠️ Duplicate | Consolidate into @auth-spine/hyparquet |

**Recommendation**: Use `@auth-spine/hyparquet` as primary, remove duplicate

### 5. Enterprise Packages

Managed by `EnterpriseOrchestrator` in `packages/enterprise/`:

#### Core Enterprise (9 packages)
- `analytics` - Analytics engine
- `audit` - Audit logging system with Parquet storage
- `booking` - Booking management
- `inventory` - Inventory system
- `monitoring` - System monitoring
- `payroll` - Payroll management
- `rbac` - Role-based access control
- `security` - Security utilities
- `validation` - Validation service

#### Business Operations (4 packages)
- `customer-crm-system` - CRM functionality
- `financial-reporting-dashboard` - Financial reporting
- `instant-payouts-direct-deposit` - Payment processing
- `ops-dashboard` - Operations dashboard

#### Governance & Compliance (3 packages)
- `compliance-governance-layer` - Compliance framework
- `governance-drift` - Drift control
- `legal-compliance` - Legal compliance

#### Security Suite (10+ packages)
- `comprehensive-security` - Comprehensive security layer
- `comprehensive-platform-security` - Platform security
- `beauty-booking-security` - Booking security
- `saas-paas-security` - SaaS/PaaS security
- `security-governance` - Security governance
- And more...

#### Supabase Integration (10+ packages)
- `supabase-advanced` - Advanced features
- `supabase-advanced-features` - Extended features
- `supabase-at-home` - Self-hosted features
- `supabase-features-checklist-suite` - Feature checklist
- `supabase-saas-advanced` - SaaS features
- `supabase-saas-features` - SaaS feature pack
- `supabase-security` - Security features
- And more...

#### Advanced Features (4 packages)
- `ai-platform` - AI/ML platform manager
- `kill-switches` - Emergency shutdown system
- `launch-gate` - Launch readiness checklist
- `nlu` - Natural language understanding
- `vibe-coding-disasters` - Error recovery

### 6. API & Resources

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@spine/resource-api` | 0.1.0 | ✅ Active | Resource API implementation |

### 7. Administration & Tooling

| Package | Version | Status | Description |
|---------|---------|--------|-------------|
| `@spine/audit-reporting` | 1.0.0 | ✅ Active | Audit reporting and analytics |
| `admin-suite` | - | ✅ Active | Admin dashboard suite |
| `create-auth-spine-app` | 1.0.0 | ✅ Active | CLI tool for creating new Auth-Spine apps |

---

## 🔗 Package Dependencies

### Core Dependencies Flow

```
┌─────────────────────────────────────────┐
│     Enterprise Orchestrator             │
│  (Manages all enterprise packages)      │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌─────────┐ ┌──────────┐
│   Core   │ │   AI/ML │ │ Business │
│ Packages │ │ Platform│ │ Packages │
└──────────┘ └─────────┘ └──────────┘
      │           │           │
      └───────────┼───────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Shared Packages│
         │  (@spine/*)    │
         └────────────────┘
```

### AI/ML Dependencies

```
┌─────────────────────────────────────┐
│      AIPlatformManager              │
└─────────────────┬───────────────────┘
                  │
      ┌───────────┼────────────────┐
      │           │                │
      ▼           ▼                ▼
┌──────────┐ ┌─────────┐  ┌──────────────┐
│  Solari  │ │Faux-LLM │  │ ML Platform  │
│  GenAI   │ │Platform │  │  (7 modules) │
└──────────┘ └─────────┘  └──────────────┘
      │           │                │
      └───────────┼────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Bioplausible  │
         │    Learning    │
         └────────────────┘
```

---

## 📋 Consolidation Recommendations

### Priority 1: Remove Duplicates

1. **LLM Platforms**
   - Keep: `faux-llm-platform-v5`
   - Remove: `faux-llm-platform`, `faux-llm-platform-v3`, `faux-llm-platform-v4`
   - Action: Archive older versions, update imports

2. **Data Science Core**
   - Keep: `ds-core` (main)
   - Remove: `ds-core-new`
   - Action: Merge any unique features, delete duplicate

3. **Hyparquet**
   - Keep: `@auth-spine/hyparquet`
   - Remove: `hyparquet-master`
   - Action: Consolidate, update references

### Priority 2: Namespace Standardization

Standardize package namespaces:
- Core packages: `@spine/*` (auth-server, shared, etc.)
- AI/ML packages: `@auth-spine/*` (ml-platform, hyparquet, etc.)
- DS packages: `@aj/*` (ds-core, ml-modules)
- Enterprise: Keep in `packages/enterprise/`

### Priority 3: Package Organization

Create logical groupings:
```
packages/
├── core/           # Core auth & shared
├── ai-ml/          # All AI/ML packages
├── data-science/   # DS and data processing
├── enterprise/     # Enterprise modules (existing)
└── tools/          # CLI tools and utilities
```

---

## 🚀 Orchestration Improvements

### Current Orchestration

**EnterpriseOrchestrator**: ✅ Implemented
- Manages 50+ enterprise packages
- Health monitoring
- Metrics collection
- Initialization coordination

**AIPlatformManager**: ✅ Implemented
- Manages AI/ML subsystems
- LLM client integration
- RAG store coordination
- Tool registry

### Proposed Enhancements

1. **Unified Package Registry**
   - Auto-discover packages
   - Version management
   - Dependency resolution
   - Lifecycle hooks

2. **Package Health Dashboard**
   - Real-time health monitoring
   - Dependency graph visualization
   - Performance metrics
   - Error tracking

3. **Inter-Package Communication**
   - Event bus for package coordination
   - Shared state management
   - Message passing
   - Service discovery

4. **Configuration Management**
   - Centralized config
   - Environment-specific settings
   - Feature flags
   - A/B testing

---

## 📊 Package Statistics

### By Category
- **Authentication**: 3 packages
- **AI/ML**: 12 packages (4 duplicates)
- **Data Science**: 3 packages (1 duplicate)
- **Enterprise**: 50+ modules
- **Business**: 4 packages
- **Tools**: 2 packages

### By Status
- **Active**: 30 packages
- **Deprecated**: 8 packages
- **Duplicates**: 4 packages

### By Namespace
- `@spine/*`: 5 packages
- `@auth-spine/*`: 5 packages
- `@aj/*`: 2 packages
- `packages/enterprise/*`: 50+ modules
- Others: 10 packages

---

## 🎯 Migration Path

### Phase 1: Documentation (Current)
- ✅ Create this package catalog
- ✅ Document dependencies
- ✅ Identify duplicates

### Phase 2: Consolidation
- [ ] Merge duplicate packages
- [ ] Update import statements
- [ ] Remove deprecated packages
- [ ] Create migration guide

### Phase 3: Enhancement
- [ ] Implement unified package registry
- [ ] Add health dashboard
- [ ] Enhance orchestration
- [ ] Add inter-package communication

### Phase 4: Optimization
- [ ] Optimize dependencies
- [ ] Reduce bundle sizes
- [ ] Improve build times
- [ ] Add performance monitoring

---

## 📚 Related Documentation

- [AI_ML_CAPABILITIES.md](AI_ML_CAPABILITIES.md) - AI/ML feature overview
- [EnterpriseOrchestrator](packages/enterprise/orchestrator.ts) - Enterprise package manager
- [AIPlatformManager](packages/enterprise/ai-platform/manager.ts) - AI/ML coordinator
- [pnpm-workspace.yaml](pnpm-workspace.yaml) - Workspace configuration

---

**Last Updated**: 2026-03-01  
**Status**: Active Catalog - Living Document
