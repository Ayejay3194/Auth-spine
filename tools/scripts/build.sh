#!/bin/bash

# Professional Build Script for Auth-spine Enterprise
# Optimized for performance and reliability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build configuration
BUILD_DIR="dist"
CACHE_DIR=".next/cache"
LOG_FILE="build.log"

echo -e "${BLUE}🚀 Starting Auth-spine Enterprise Build${NC}"
echo "=================================================="

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf $BUILD_DIR
rm -rf .next
rm -rf $CACHE_DIR

# Install dependencies with optimization
echo -e "${YELLOW}📦 Installing optimized dependencies...${NC}"
npm ci --prefer-offline --no-audit --no-fund

# Type checking with performance optimization
echo -e "${YELLOW}🔍 Running optimized type checking...${NC}"
npx tsc --noEmit --incremental --tsBuildInfoFile .tsbuildinfo

# Linting with caching
echo -e "${YELLOW}✨ Running optimized linting...${NC}"
npx eslint . --cache --cache-location .eslintcache --ext .ts,.tsx --max-warnings 0

# Build with optimization
echo -e "${YELLOW}🏗️ Building optimized application...${NC}"
NODE_ENV=production npm run build

# Performance analysis
echo -e "${YELLOW}📊 Analyzing build performance...${NC}"
if command -v npx &> /dev/null; then
    npx bundle-analyzer .next/static/chunks/
fi

# Security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level moderate

# Generate build report
echo -e "${YELLOW}📋 Generating build report...${NC}"
cat > build-report.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "environment": "production",
  "optimizations": [
    "tree-shaking",
    "code-splitting",
    "minification",
    "compression",
    "caching"
  ]
}
EOF

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 Build Statistics:${NC}"
echo "  - Build time: $(date +%T)"
echo "  - Output size: $(du -sh .next | cut -f1)"
echo "  - Bundle files: $(find .next -name "*.js" | wc -l)"
echo ""
echo -e "${GREEN}🎉 Auth-spine Enterprise is ready for deployment!${NC}"
