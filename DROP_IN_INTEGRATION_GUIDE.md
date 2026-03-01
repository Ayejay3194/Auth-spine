# Drop-In Integration Guide

## Overview

Auth-Spine is designed as a **complete drop-in solution** that can be integrated into any existing project and extended with custom functionality. This guide shows you how to integrate Auth-Spine into your project.

---

## 🎯 Integration Methods

### Method 1: Full Stack Drop-In (Recommended)

Use the entire Auth-Spine system as your backend/full-stack foundation.

```bash
# Install Auth-Spine in your project
npm install @auth-spine/core

# Or use the CLI to scaffold
npx create-auth-spine-app my-project
cd my-project
npm install
npm run dev
```

### Method 2: Selective Package Integration

Choose only the packages you need:

```bash
# Core authentication
npm install @spine/auth-server @spine/shared-db

# AI/ML capabilities
npm install @auth-spine/ml-platform @auth-spine/solari-genai-kit

# Enterprise features
npm install @auth-spine/enterprise
```

### Method 3: Extend Existing Project

Add Auth-Spine to an existing project:

```bash
# Add as dependency
npm install auth-spine

# Import and initialize
import { AuthSpine } from 'auth-spine';
const authSpine = new AuthSpine(config);
await authSpine.initialize();
```

---

## 🏗️ Architecture for Drop-In Use

### Modular Architecture

```
Your Project
├── src/
│   ├── your-code/          # Your custom code
│   └── integrations/
│       └── auth-spine/     # Auth-Spine integration layer
├── node_modules/
│   └── @auth-spine/        # Auth-Spine packages
└── package.json
```

### Integration Patterns

#### Pattern 1: Wrapper Pattern

```typescript
// src/integrations/auth-spine/wrapper.ts
import { AuthSpine, AuthSpineConfig } from '@auth-spine/core';

export class MyProjectAuth extends AuthSpine {
  constructor(customConfig: any) {
    super({
      // Auth-Spine config
      ...AuthSpine.defaultConfig,
      // Your custom config
      ...customConfig
    });
  }

  // Add custom methods
  async customAuthFlow() {
    // Your custom logic
    await this.authenticate();
    // More custom logic
  }
}
```

#### Pattern 2: Plugin Pattern

```typescript
// src/integrations/auth-spine/plugins/my-plugin.ts
import { AuthSpinePlugin } from '@auth-spine/core';

export class MyCustomPlugin implements AuthSpinePlugin {
  name = 'my-custom-plugin';

  async onInitialize(authSpine: AuthSpine) {
    // Hook into initialization
  }

  async onAuthenticate(user: User) {
    // Hook into authentication
  }
}

// Use it
const authSpine = new AuthSpine();
authSpine.use(new MyCustomPlugin());
```

#### Pattern 3: Service Layer Pattern

```typescript
// src/services/auth.service.ts
import { EnterpriseOrchestrator } from '@auth-spine/enterprise';

export class AuthService {
  private authSpine: EnterpriseOrchestrator;

  constructor() {
    this.authSpine = new EnterpriseOrchestrator();
  }

  async initialize() {
    await this.authSpine.initialize();
  }

  // Expose only what you need
  async authenticateUser(credentials: Credentials) {
    const authPackage = this.authSpine.getPackage('security');
    return authPackage.authenticate(credentials);
  }
}
```

---

## 📦 Package Integration Examples

### Example 1: Add Auth to Express App

```typescript
// app.ts
import express from 'express';
import { createAuthMiddleware } from '@spine/auth-server';

const app = express();

// Add Auth-Spine authentication
app.use(createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET,
  sessionStore: 'postgresql'
}));

// Your existing routes
app.get('/api/data', async (req, res) => {
  // req.user is now available from Auth-Spine
  res.json({ user: req.user });
});
```

### Example 2: Add AI/ML to Existing App

```typescript
// services/ai.service.ts
import { AIPlatformManager } from '@auth-spine/enterprise';

export class AIService {
  private ai: AIPlatformManager;

  constructor() {
    this.ai = new AIPlatformManager({
      llm: {
        baseUrl: process.env.LLM_BASE_URL,
        apiKey: process.env.OPENAI_API_KEY
      }
    });
  }

  async analyzeSentiment(text: string) {
    await this.ai.initialize();
    // Use Auth-Spine AI capabilities
    return this.ai.llmClient?.complete({
      messages: [{ role: 'user', content: `Analyze sentiment: ${text}` }]
    });
  }
}
```

### Example 3: Add Enterprise Features

```typescript
// services/enterprise.service.ts
import { EnterpriseOrchestrator } from '@auth-spine/enterprise';

export class EnterpriseService {
  private orchestrator: EnterpriseOrchestrator;

  constructor() {
    this.orchestrator = new EnterpriseOrchestrator();
  }

  async initialize() {
    await this.orchestrator.initialize();
  }

  // Use specific enterprise features
  async auditAction(action: string, metadata: any) {
    const audit = this.orchestrator.getPackage('audit');
    return audit.log(action, metadata);
  }

  async checkCompliance() {
    const compliance = this.orchestrator.getPackage('legalCompliance');
    return compliance.check();
  }
}
```

---

## 🔧 Configuration

### Minimal Configuration

```typescript
// auth-spine.config.ts
export default {
  // Core settings
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionTimeout: 3600,
    mfaEnabled: true
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    provider: 'postgresql'
  },

  // AI/ML (optional)
  ai: {
    enabled: true,
    llmProvider: 'openai',
    apiKey: process.env.OPENAI_API_KEY
  },

  // Enterprise features (optional)
  enterprise: {
    enabled: true,
    packages: ['audit', 'compliance', 'monitoring']
  }
};
```

### Advanced Configuration

```typescript
// auth-spine.config.ts
import { AuthSpineConfig } from '@auth-spine/core';

export default {
  // ... minimal config

  // Custom package registry
  registry: {
    autoDiscover: true,
    enableHealthChecks: true,
    healthCheckInterval: 60000
  },

  // Plugin system
  plugins: [
    new MyCustomPlugin(),
    new AnotherPlugin()
  ],

  // Hooks
  hooks: {
    beforeAuth: async (credentials) => {
      // Custom validation
    },
    afterAuth: async (user) => {
      // Custom logic after auth
    }
  },

  // Feature flags
  features: {
    aiml: true,
    analytics: true,
    booking: false
  }
} satisfies AuthSpineConfig;
```

---

## 🚀 Quick Start Templates

### Template 1: Express + Auth-Spine

```typescript
// server.ts
import express from 'express';
import { AuthSpine } from '@auth-spine/core';
import authSpineConfig from './auth-spine.config';

const app = express();
const authSpine = new AuthSpine(authSpineConfig);

async function startServer() {
  // Initialize Auth-Spine
  await authSpine.initialize();

  // Add Auth-Spine middleware
  app.use(authSpine.middleware());

  // Your routes
  app.get('/api/protected', authSpine.protect(), (req, res) => {
    res.json({ message: 'Protected route', user: req.user });
  });

  // Health check
  app.get('/health', async (req, res) => {
    const health = await authSpine.getHealth();
    res.json(health);
  });

  app.listen(3000, () => {
    console.log('Server running with Auth-Spine on port 3000');
  });
}

startServer().catch(console.error);
```

### Template 2: Next.js + Auth-Spine

```typescript
// pages/api/auth/[...authspine].ts
import { createAuthSpineHandler } from '@auth-spine/nextjs';
import authSpineConfig from '@/config/auth-spine.config';

export default createAuthSpineHandler(authSpineConfig);

// pages/_app.tsx
import { AuthSpineProvider } from '@auth-spine/react';

export default function App({ Component, pageProps }) {
  return (
    <AuthSpineProvider config={authSpineConfig}>
      <Component {...pageProps} />
    </AuthSpineProvider>
  );
}
```

### Template 3: Standalone Service

```typescript
// services/auth-spine-service.ts
import { EnterpriseOrchestrator } from '@auth-spine/enterprise';

export class AuthSpineService {
  private static instance: AuthSpineService;
  private orchestrator: EnterpriseOrchestrator;

  private constructor() {
    this.orchestrator = new EnterpriseOrchestrator();
  }

  static getInstance(): AuthSpineService {
    if (!AuthSpineService.instance) {
      AuthSpineService.instance = new AuthSpineService();
    }
    return AuthSpineService.instance;
  }

  async initialize() {
    await this.orchestrator.initialize();
  }

  getPackage(name: string) {
    return this.orchestrator.getPackage(name);
  }

  async getHealth() {
    return this.orchestrator.getHealthStatus();
  }
}

// Use it anywhere
const authSpine = AuthSpineService.getInstance();
await authSpine.initialize();
```

---

## 🔌 Extension Points

### 1. Custom Authentication Provider

```typescript
// extensions/custom-auth-provider.ts
import { AuthProvider } from '@auth-spine/core';

export class MyAuthProvider implements AuthProvider {
  async authenticate(credentials: any) {
    // Your custom authentication logic
    return { user, token };
  }

  async validate(token: string) {
    // Your custom validation logic
    return user;
  }
}

// Register it
authSpine.registerAuthProvider('custom', new MyAuthProvider());
```

### 2. Custom AI Model

```typescript
// extensions/custom-ai-model.ts
import { AIModel } from '@auth-spine/ai-platform';

export class MyCustomModel implements AIModel {
  async predict(input: any) {
    // Your custom ML logic
    return prediction;
  }
}

// Register it
const aiPlatform = authSpine.getPackage('aiPlatform');
aiPlatform.registerModel('my-model', new MyCustomModel());
```

### 3. Custom Enterprise Module

```typescript
// extensions/custom-module.ts
export const myCustomModule = {
  async initialize() {
    console.log('Custom module initialized');
  },

  async getHealthStatus() {
    return true;
  },

  async getMetrics() {
    return { customMetric: 100 };
  },

  async myCustomFunction() {
    // Your logic
  }
};

// Register it
orchestrator.addPackage('myCustomModule', myCustomModule);
```

---

## 📊 Migration Path

### From Scratch

```bash
1. npx create-auth-spine-app my-project
2. cd my-project
3. npm install
4. Configure .env
5. npm run dev
```

### Existing Project

```bash
# 1. Install
npm install @auth-spine/core

# 2. Create integration layer
mkdir -p src/integrations/auth-spine
touch src/integrations/auth-spine/index.ts

# 3. Configure
cp node_modules/@auth-spine/core/config.example.ts ./auth-spine.config.ts

# 4. Initialize in your app
# See templates above

# 5. Migrate gradually
# Start with auth, then add AI/ML, then enterprise features
```

---

## 🎓 Best Practices

### 1. Use Configuration Files

```typescript
// Don't hardcode
const authSpine = new AuthSpine({
  jwtSecret: 'hardcoded-secret' // ❌
});

// Use config files
import config from './auth-spine.config';
const authSpine = new AuthSpine(config); // ✅
```

### 2. Initialize Once

```typescript
// Singleton pattern
export class AuthSpineManager {
  private static instance: EnterpriseOrchestrator;

  static async getInstance() {
    if (!this.instance) {
      this.instance = new EnterpriseOrchestrator();
      await this.instance.initialize();
    }
    return this.instance;
  }
}
```

### 3. Use Type Safety

```typescript
// Import types
import type { User, Session } from '@auth-spine/core';

// Use them
function processUser(user: User) {
  // TypeScript knows the shape
}
```

### 4. Handle Errors Gracefully

```typescript
try {
  await authSpine.initialize();
} catch (error) {
  console.error('Failed to initialize Auth-Spine:', error);
  // Fallback logic or graceful degradation
}
```

### 5. Monitor Health

```typescript
// Regular health checks
setInterval(async () => {
  const health = await authSpine.getHealth();
  if (!health.overall) {
    console.error('Auth-Spine unhealthy:', health);
    // Alert or take action
  }
}, 60000);
```

---

## 📚 Examples Repository

Full integration examples available at:
- [Express Integration](examples/integration/express/)
- [Next.js Integration](examples/integration/nextjs/)
- [Standalone Service](examples/integration/standalone/)
- [Microservices](examples/integration/microservices/)

---

## 🆘 Support

- [GitHub Issues](https://github.com/Ayejay3194/Auth-spine/issues)
- [Documentation](https://github.com/Ayejay3194/Auth-spine)
- [Discord Community](#)

---

**Auth-Spine: Drop it in. Build on top. Scale to enterprise.** 🚀
