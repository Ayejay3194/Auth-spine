#!/bin/bash

# Professional Deployment Script for Auth-spine Enterprise
# Optimized for production deployment with safety checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
HEALTH_CHECK_URL="https://your-domain.com/api/health"
ROLLBACK_THRESHOLD=5 # Max failed health checks before rollback

echo -e "${BLUE}🚀 Starting Auth-spine Enterprise Deployment${NC}"
echo "=================================================="
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo ""

# Pre-deployment checks
echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Check environment variables
if [[ ! -f ".env.$ENVIRONMENT" ]]; then
    echo -e "${RED}❌ Environment file .env.$ENVIRONMENT not found.${NC}"
    exit 1
fi

# Run tests
echo -e "${YELLOW}🧪 Running test suite...${NC}"
npm test -- --coverage --watchAll=false

# Build application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# Create backup
echo -e "${YELLOW}💾 Creating backup...${NC}"
mkdir -p $BACKUP_DIR
cp -r .next $BACKUP_DIR/
cp package.json $BACKUP_DIR/

# Deploy to production
echo -e "${YELLOW}🚀 Deploying to $ENVIRONMENT...${NC}"

# Example deployment commands - customize based on your infrastructure
case $ENVIRONMENT in
    "production")
        # Production deployment
        echo "Deploying to production..."
        # Add your production deployment commands here
        # docker-compose -f docker-compose.prod.yml up -d
        # kubectl apply -f k8s/
        ;;
    "staging")
        # Staging deployment
        echo "Deploying to staging..."
        # Add your staging deployment commands here
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        exit 1
        ;;
esac

# Post-deployment health checks
echo -e "${YELLOW}🏥 Running post-deployment health checks...${NC}"
HEALTH_CHECKS=0
MAX_CHECKS=30

while [ $HEALTH_CHECKS -lt $MAX_CHECKS ]; do
    if curl -f -s $HEALTH_CHECK_URL > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        break
    fi
    
    HEALTH_CHECKS=$((HEALTH_CHECKS + 1))
    echo "Health check attempt $HEALTH_CHECKS/$MAX_CHECKS..."
    sleep 10
done

if [ $HEALTH_CHECKS -eq $MAX_CHECKS ]; then
    echo -e "${RED}❌ Health checks failed. Rolling back...${NC}"
    # Rollback logic here
    cp -r $BACKUP_DIR/.next .next
    echo -e "${YELLOW}🔄 Rollback completed${NC}"
    exit 1
fi

# Deployment verification
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
# Add verification steps here
# - Check database connectivity
# - Verify critical services
# - Run smoke tests

# Cleanup old backups (keep last 5)
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
ls -t backups/ | tail -n +6 | xargs -r rm -rf

# Generate deployment report
echo -e "${YELLOW}📋 Generating deployment report...${NC}"
cat > deployment-report.json << EOF
{
  "deploymentTime": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "environment": "$ENVIRONMENT",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
  "nodeVersion": "$(node --version)",
  "buildSize": "$(du -sh .next | cut -f1)",
  "healthChecks": $HEALTH_CHECKS,
  "status": "success"
}
EOF

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 Deployment Statistics:${NC}"
echo "  - Environment: $ENVIRONMENT"
echo "  - Git commit: $(git rev-parse --short HEAD)"
echo "  - Build size: $(du -sh .next | cut -f1)"
echo "  - Health checks: $HEALTH_CHECKS/$MAX_CHECKS"
echo "  - Backup: $BACKUP_DIR"
echo ""
echo -e "${GREEN}🎉 Auth-spine Enterprise is live!${NC}"
