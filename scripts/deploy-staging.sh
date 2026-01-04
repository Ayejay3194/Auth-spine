#!/bin/bash

# Auth-Spine Staging Deployment Script
# This script deploys the application to staging environment

set -e

echo "🚀 Starting Auth-Spine Staging Deployment..."

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

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
npm ci --workspace=packages/auth-server
npm ci --workspace=packages/auth
npm ci --workspace=packages/resource-api
npm ci --workspace=apps/business-spine

# Run type checking
echo "🔍 Running type checking..."
npm run typecheck

# Run linting
echo "🔍 Running linting..."
npm run lint:check

# Build all packages
echo "🏗️ Building packages..."
npm run build

# Run smoke tests
echo "🧪 Running smoke tests..."
npm run test -- --testPathPattern=smoke --passWithNoTests

echo "✅ Staging deployment completed successfully!"
echo "🌐 Application is ready for staging testing"

# Output deployment info
echo ""
echo "📋 Deployment Information:"
echo "  - Branch: $(git branch --show-current)"
echo "  - Commit: $(git rev-parse --short HEAD)"
echo "  - Timestamp: $(date)"
echo "  - Environment: staging"
echo ""
echo "🔗 Next Steps:"
echo "  1. Verify staging environment is working"
echo "  2. Run integration tests"
echo "  3. Deploy to production when ready"
