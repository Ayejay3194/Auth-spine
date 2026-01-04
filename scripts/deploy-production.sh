#!/bin/bash

# Auth-Spine Production Deployment Script
# This script deploys the application to production environment

set -e

echo "🚀 Starting Auth-Spine Production Deployment..."

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    echo "❌ Error: Must be on main branch to deploy"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    git status
    exit 1
fi

# Confirm deployment
read -p "🔔 This will deploy to PRODUCTION. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm install --workspace=packages/auth-server
npm install --workspace=packages/auth
npm install --workspace=packages/resource-api
npm install --workspace=apps/business-spine

# Run type checking
echo "🔍 Running type checking..."
npm run typecheck

# Run linting
echo "🔍 Running linting..."
npm run lint:check

# Build all packages
echo "🏗️ Building packages..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

# Security audit
echo "🔒 Running security audit..."
npm run security:validate

# Create deployment tag
TAG="v$(date +%Y%m%d-%H%M%S)"
echo "🏷️ Creating deployment tag: $TAG"
git tag -a $TAG -m "Production deployment $TAG"
git push origin $TAG

echo "✅ Production deployment completed successfully!"
echo "🌐 Application is now live in production"

# Output deployment info
echo ""
echo "📋 Deployment Information:"
echo "  - Branch: $(git branch --show-current)"
echo "  - Commit: $(git rev-parse --short HEAD)"
echo "  - Tag: $TAG"
echo "  - Timestamp: $(date)"
echo "  - Environment: production"
echo ""
echo "🔗 Next Steps:"
echo "  1. Monitor production environment"
echo "  2. Check error logs and metrics"
echo "  3. Verify all endpoints are working"
echo "  4. Run smoke tests on production"
echo ""
echo "🆘 Rollback Command:"
echo "  git checkout <previous-tag>"
echo "  npm run deploy:production"
