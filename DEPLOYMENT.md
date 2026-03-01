# Complete Deployment Guide

This guide covers all deployment options for Auth-Spine - from local development to production Kubernetes clusters.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Production Checklist](#production-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Quick Start

```bash
# Clone and setup
git clone https://github.com/Ayejay3194/Auth-spine.git
cd Auth-spine
chmod +x setup.sh
./setup.sh

# Start development
npm run dev
```

Services available at:
- Business App: http://localhost:3000
- Auth Server: http://localhost:4000

### Manual Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with your config

# Generate Prisma client
cd apps/business-spine
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # Optional: sample data
cd ../..

# Start services
npm run dev
```

---

## Docker Deployment

### Development Mode

```bash
# Copy environment template
cp .env.docker .env
nano .env  # Edit configuration

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Mode

```bash
# Use production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml \
  up -d --scale auth-server=3 --scale business-app=3
```

### Services Included

- PostgreSQL 16 (port 5432)
- Redis 7 (port 6379)
- Auth Server (port 4000)
- Business App (port 3000)
- Nginx (port 80/443) - production only

### Custom Configuration

Edit `docker-compose.yml` to customize:
- Resource limits
- Environment variables
- Volume mounts
- Port mappings

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Persistent volume provisioner
- Ingress controller (nginx recommended)
- cert-manager (for TLS)

### Quick Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic auth-spine-db \
  --from-literal=postgres-password=YOUR_STRONG_PASSWORD \
  -n auth-spine

kubectl create secret generic auth-spine-jwt \
  --from-literal=jwt-secret=YOUR_JWT_SECRET_MIN_32_CHARS \
  -n auth-spine

kubectl create secret generic auth-spine-secrets \
  --from-literal=nextauth-secret=YOUR_NEXTAUTH_SECRET \
  --from-literal=redis-password=YOUR_REDIS_PASSWORD \
  -n auth-spine

# Deploy infrastructure
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Deploy applications
kubectl apply -f k8s/auth-server-deployment.yaml
kubectl apply -f k8s/business-app-deployment.yaml

# Setup ingress
kubectl apply -f k8s/ingress.yaml
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -n auth-spine

# Check services
kubectl get svc -n auth-spine

# Check ingress
kubectl get ingress -n auth-spine

# View logs
kubectl logs -f deployment/auth-server -n auth-spine
kubectl logs -f deployment/business-app -n auth-spine
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment auth-server --replicas=5 -n auth-spine

# Auto-scaling
kubectl autoscale deployment auth-server \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n auth-spine
```

### Production Recommendations

1. **Use Managed Databases**
   - Cloud SQL (GCP)
   - RDS (AWS)
   - Azure Database

2. **High Availability**
   - 2+ replicas for each service
   - Multi-zone deployment
   - LoadBalancer service type

3. **Security**
   - NetworkPolicies
   - Pod Security Standards
   - Secret rotation
   - RBAC policies

---

## Cloud Platform Deployment

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/business-spine
vercel deploy --prod
```

Configure environment variables in Vercel dashboard:
- `DATABASE_URL`
- `NEXT_PUBLIC_AUTH_URL`
- `NEXTAUTH_SECRET`

### AWS

**Option 1: ECS (Elastic Container Service)**
```bash
# Build and push images
docker build -t auth-spine/auth-server -f packages/auth-server/Dockerfile .
docker build -t auth-spine/business-app -f apps/business-spine/Dockerfile .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag auth-spine/auth-server:latest YOUR_ECR_URI/auth-server:latest
docker push YOUR_ECR_URI/auth-server:latest

# Deploy with ECS task definition
```

**Option 2: EKS (Kubernetes)**
```bash
# Use k8s/ manifests
kubectl apply -f k8s/
```

**Option 3: Elastic Beanstalk**
```bash
# Use docker-compose.yml
eb init
eb create
eb deploy
```

### Google Cloud

**Cloud Run (Serverless)**
```bash
# Build and deploy auth-server
gcloud builds submit --tag gcr.io/PROJECT_ID/auth-server packages/auth-server/
gcloud run deploy auth-server \
  --image gcr.io/PROJECT_ID/auth-server \
  --platform managed

# Build and deploy business-app
gcloud builds submit --tag gcr.io/PROJECT_ID/business-app apps/business-spine/
gcloud run deploy business-app \
  --image gcr.io/PROJECT_ID/business-app \
  --platform managed
```

**GKE (Kubernetes)**
```bash
# Use k8s/ manifests
kubectl apply -f k8s/
```

### Azure

**App Service**
```bash
# Deploy with Docker Compose
az webapp create --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name auth-spine \
  --multicontainer-config-type compose \
  --multicontainer-config-file docker-compose.yml
```

**AKS (Kubernetes)**
```bash
# Use k8s/ manifests
kubectl apply -f k8s/
```

### DigitalOcean

**App Platform**
```bash
# Use docker-compose.yml or k8s/
doctl apps create --spec .do/app.yaml
```

**Kubernetes**
```bash
# Use k8s/ manifests
kubectl apply -f k8s/
```

---

## Production Checklist

### Security
- [ ] Change all default secrets
- [ ] Use RS256 for JWT (not HS256)
- [ ] Enable HTTPS/TLS everywhere
- [ ] Configure CORS properly (no wildcards)
- [ ] Enable rate limiting
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement DDoS protection
- [ ] Regular security audits: `npm audit`
- [ ] Dependency updates: Dependabot/Renovate

### Database
- [ ] Use managed database service
- [ ] Enable SSL/TLS connections
- [ ] Set up automated backups
- [ ] Test restore procedures
- [ ] Configure connection pooling
- [ ] Monitor slow queries
- [ ] Set up replication (read replicas)

### Monitoring
- [ ] Application monitoring (Sentry, DataDog)
- [ ] Infrastructure monitoring (Prometheus, Grafana)
- [ ] Log aggregation (ELK, Splunk)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Alert configuration
- [ ] Performance metrics

### Performance
- [ ] Enable Redis caching
- [ ] Configure CDN
- [ ] Optimize database queries
- [ ] Enable gzip/brotli compression
- [ ] Implement caching headers
- [ ] Load testing completed

### Reliability
- [ ] Multi-region deployment
- [ ] Auto-scaling configured
- [ ] Health checks enabled
- [ ] Circuit breakers implemented
- [ ] Backup/restore tested
- [ ] Disaster recovery plan

### Compliance
- [ ] GDPR compliance (if applicable)
- [ ] SOC 2 requirements met
- [ ] Audit logging enabled
- [ ] Data retention policies
- [ ] Privacy policy updated
- [ ] Terms of service updated

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Database Connection Failed**
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# or
systemctl status postgresql

# Test connection
psql -U authspine -d authspine -h localhost
```

**Prisma Client Not Found**
```bash
cd apps/business-spine
npx prisma generate
```

**Docker Build Fails**
```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

**Environment Variables Not Loading**
```bash
# Check .env file exists
ls -la .env

# Restart services
docker-compose restart
# or
npm run dev
```

### Getting Help

- Documentation: `docs/`
- Issues: https://github.com/Ayejay3194/Auth-spine/issues
- Security: See [SECURITY.md](../SECURITY.md)
- Community: GitHub Discussions

---

## Next Steps

After deployment:

1. **Test the deployment**
   - Health checks: `/health` endpoints
   - API testing: Use Postman collection
   - Load testing: Use k6 or Artillery

2. **Monitor performance**
   - Check logs
   - Monitor metrics
   - Set up alerts

3. **Regular maintenance**
   - Update dependencies
   - Rotate secrets
   - Review security
   - Backup data

4. **Scale as needed**
   - Monitor traffic
   - Add replicas
   - Optimize queries
   - Add caching

---

**Need help?** Check our [Quick Start Guide](../QUICK_START.md) or open an issue on GitHub.
