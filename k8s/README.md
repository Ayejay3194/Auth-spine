# Kubernetes Deployment for Auth-Spine

This directory contains Kubernetes manifests for deploying Auth-Spine to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Persistent volume provisioner (for database)
- Ingress controller (nginx-ingress recommended)
- cert-manager (optional, for TLS)

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets

```bash
# Create database secret
kubectl create secret generic auth-spine-db \
  --from-literal=postgres-password=YOUR_STRONG_PASSWORD \
  -n auth-spine

# Create JWT secret
kubectl create secret generic auth-spine-jwt \
  --from-literal=jwt-secret=YOUR_JWT_SECRET_AT_LEAST_32_CHARS \
  -n auth-spine

# Create app secrets
kubectl create secret generic auth-spine-secrets \
  --from-literal=nextauth-secret=YOUR_NEXTAUTH_SECRET \
  --from-literal=redis-password=YOUR_REDIS_PASSWORD \
  -n auth-spine
```

### 3. Deploy Infrastructure

```bash
# Deploy PostgreSQL
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml

# Deploy Redis
kubectl apply -f redis-deployment.yaml
```

### 4. Deploy Applications

```bash
# Deploy Auth Server
kubectl apply -f auth-server-deployment.yaml

# Deploy Business App
kubectl apply -f business-app-deployment.yaml
```

### 5. Configure Ingress

```bash
kubectl apply -f ingress.yaml
```

## Cleanup

```bash
kubectl delete namespace auth-spine
```
