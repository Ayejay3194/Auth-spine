# Business Spine Deployment Guide

Guide for deploying the Business Spine to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Production Configuration](#production-configuration)
5. [Security](#security)
6. [Monitoring](#monitoring)
7. [Scaling](#scaling)

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL 14+ (if using database adapter)
- Redis 6+ (if using cache/queue)
- SSL/TLS certificates for HTTPS

## Environment Setup

### Required Environment Variables

```env
# API Security
BUSINESS_SPINE_API_KEY=<generate-secure-random-key>
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=<redis-password>

# Logging
LOG_LEVEL=info

# Multi-tenancy
DEFAULT_TENANT_ID=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Secure API Key

```bash
# Generate 32-byte random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Docker

#### Build Image

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src ./src

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/api/server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t business-spine:latest .

# Run container
docker run -d \
  --name business-spine \
  -p 3001:3001 \
  --env-file .env.production \
  business-spine:latest
```

### Option 2: PM2

```bash
# Install PM2
npm install -g pm2

# Build project
npm run build

# Start with PM2
pm2 start dist/api/server.js \
  --name business-spine \
  --instances 4 \
  --exec-mode cluster

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Option 3: Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: business-spine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: business-spine
  template:
    metadata:
      labels:
        app: business-spine
    spec:
      containers:
      - name: business-spine
        image: business-spine:latest
        ports:
        - containerPort: 3001
        env:
        - name: BUSINESS_SPINE_API_KEY
          valueFrom:
            secretKeyRef:
              name: business-spine-secrets
              key: api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: business-spine-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: business-spine
spec:
  selector:
    app: business-spine
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

### Option 4: Serverless (AWS Lambda)

Not recommended for real-time applications due to cold start times, but possible:

```typescript
// lambda.ts
import { getBusinessSpineApi } from 'no-llm-business-assistant-spine';

const api = getBusinessSpineApi({
  apiKey: process.env.BUSINESS_SPINE_API_KEY,
});

export const handler = async (event: any) => {
  const { text, context } = JSON.parse(event.body);
  
  const result = await api.handle({ text, context });
  
  return {
    statusCode: result.success ? 200 : 400,
    body: JSON.stringify(result),
  };
};
```

## Production Configuration

### Database Configuration

```typescript
// Use connection pooling
const bridge = new BusinessSpineBridge({
  databaseUrl: process.env.DATABASE_URL,
  // Connection pool settings
  prismaClient: new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }),
});
```

### Redis Configuration

```typescript
// Use Redis Cluster for high availability
const bridge = new BusinessSpineBridge({
  redisUrl: process.env.REDIS_URL,
  redisClient: new Redis.Cluster([
    { host: 'redis-1', port: 6379 },
    { host: 'redis-2', port: 6379 },
    { host: 'redis-3', port: 6379 },
  ], {
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  }),
});
```

### Logging Configuration

```typescript
import { setLogLevel, getLogger } from 'no-llm-business-assistant-spine';

// Set production log level
setLogLevel(process.env.LOG_LEVEL as any || "info");

// Configure structured logging
const logger = getLogger("production");
```

## Security

### 1. API Key Management

```bash
# Store API keys in secrets manager
aws secretsmanager create-secret \
  --name business-spine-api-key \
  --secret-string "your-secret-key"

# In production, load from secrets manager
export BUSINESS_SPINE_API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id business-spine-api-key \
  --query SecretString \
  --output text)
```

### 2. HTTPS Only

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Rate Limiting

```typescript
// Implement rate limiting middleware
import { RateLimitError } from 'no-llm-business-assistant-spine';

const rateLimiter = new Map<string, { count: number; reset: number }>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const limit = rateLimiter.get(userId);
  
  if (!limit || now > limit.reset) {
    rateLimiter.set(userId, {
      count: 1,
      reset: now + 60000, // 1 minute
    });
    return;
  }
  
  if (limit.count >= 100) {
    throw new RateLimitError("Rate limit exceeded");
  }
  
  limit.count++;
}
```

### 4. Input Validation

```typescript
import { ValidationError } from 'no-llm-business-assistant-spine';

function validateRequest(req: ApiRequest) {
  if (!req.text || typeof req.text !== 'string') {
    throw new ValidationError("Invalid text field");
  }
  
  if (req.text.length > 1000) {
    throw new ValidationError("Text too long");
  }
  
  if (req.context?.userId && !/^[a-zA-Z0-9_-]+$/.test(req.context.userId)) {
    throw new ValidationError("Invalid userId format");
  }
}
```

### 5. SQL Injection Prevention

Always use parameterized queries:

```typescript
// Good ✓
const result = await prisma.client.findMany({
  where: { email: userInput }
});

// Bad ✗ - Never do this
const result = await prisma.$queryRaw`
  SELECT * FROM clients WHERE email = '${userInput}'
`;
```

## Monitoring

### Health Checks

```typescript
// Implement comprehensive health checks
async function healthCheck() {
  const checks = {
    api: true,
    database: await checkDatabase(),
    redis: await checkRedis(),
    queue: await checkQueue(),
  };
  
  const healthy = Object.values(checks).every(v => v);
  
  return {
    status: healthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  };
}

// Endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

### Metrics

```typescript
// Track key metrics
const metrics = {
  requests: 0,
  errors: 0,
  latency: [] as number[],
};

// Increment on each request
function trackRequest(duration: number, error?: boolean) {
  metrics.requests++;
  if (error) metrics.errors++;
  metrics.latency.push(duration);
  
  // Keep only last 1000 measurements
  if (metrics.latency.length > 1000) {
    metrics.latency.shift();
  }
}

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  const avgLatency = metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length;
  
  res.json({
    requests: metrics.requests,
    errors: metrics.errors,
    errorRate: metrics.errors / metrics.requests,
    avgLatency,
  });
});
```

### Logging

```typescript
// Use structured logging for production
import { getLogger } from 'no-llm-business-assistant-spine';

const logger = getLogger("production");

// Log every request
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userId: req.headers['x-user-id'],
    });
  });
  
  next();
});

// Log errors
app.use((error, req, res, next) => {
  logger.error("Request failed", error, {
    method: req.method,
    path: req.path,
    userId: req.headers['x-user-id'],
  });
  
  next(error);
});
```

## Scaling

### Horizontal Scaling

```yaml
# kubernetes-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: business-spine-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: business-spine
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```typescript
// Use read replicas for analytics queries
const primaryDb = new PrismaClient({
  datasources: {
    db: { url: process.env.PRIMARY_DATABASE_URL },
  },
});

const replicaDb = new PrismaClient({
  datasources: {
    db: { url: process.env.REPLICA_DATABASE_URL },
  },
});

// Use replica for read-only operations
async function getAnalytics() {
  return await replicaDb.analytics.findMany();
}

// Use primary for writes
async function createBooking(data: any) {
  return await primaryDb.booking.create({ data });
}
```

### Caching Strategy

```typescript
// Implement caching layer
import { getLogger } from 'no-llm-business-assistant-spine';

const logger = getLogger("cache");
const cache = new Map<string, { value: any; expires: number }>();

async function getCached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() < cached.expires) {
    logger.debug("Cache hit", { key });
    return cached.value;
  }
  
  logger.debug("Cache miss", { key });
  const value = await fn();
  
  cache.set(key, {
    value,
    expires: Date.now() + ttl,
  });
  
  return value;
}
```

## Backup and Recovery

### Database Backups

```bash
#!/bin/bash
# backup.sh

# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Upload to S3
aws s3 cp backup-*.sql s3://my-backups/business-spine/

# Keep only last 30 days
find backup-*.sql -mtime +30 -delete

# Schedule daily backups
# Add to crontab: 0 2 * * * /path/to/backup.sh
```

### Restore Process

```bash
# Restore from backup
psql $DATABASE_URL < backup-20251215-020000.sql

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM bookings;"
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys generated and stored securely
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup
- [ ] Health checks working
- [ ] Backups scheduled
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Team trained on operations

## Troubleshooting

### High Memory Usage

```bash
# Check Node.js memory usage
pm2 monit

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart business-spine
```

### Database Connection Issues

```bash
# Check connection pool
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Adjust connection pool size
export DATABASE_CONNECTION_LIMIT=20
```

### Slow Response Times

```bash
# Check logs for slow queries
grep "duration" /var/log/business-spine/app.log | sort -n -k5

# Enable query logging
export LOG_LEVEL=debug
```

## Support

For production issues:
1. Check [health endpoint](#health-checks)
2. Review [logs](#logging)
3. Run [diagnostics](#monitoring)
4. Contact support team
