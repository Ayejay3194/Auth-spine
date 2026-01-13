#!/bin/bash

# Auth-Spine Repository Consolidation Script
# This script systematically consolidates the repository structure

set -e

echo "🚀 Starting Auth-Spine Repository Consolidation..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/autreyjenkinsjr./Documents/GitHub/Auth-spine"
cd "$BASE_DIR"

echo ""
echo "${YELLOW}Phase 1: TypeScript Library Migration${NC}"
echo "✅ Already complete - all libraries in src/libs/"

echo ""
echo "${YELLOW}Phase 2: Consolidating Core Modules${NC}"
echo "Keeping src/core/ implementations as single source of truth..."

# Backup old files before deletion
mkdir -p .backup/phase2
echo "Creating backups..."
[ -f src/auth.ts ] && cp src/auth.ts .backup/phase2/
[ -f src/monitoring.ts ] && cp src/monitoring.ts .backup/phase2/
[ -f src/logging.ts ] && cp src/logging.ts .backup/phase2/
[ -f src/telemetry.ts ] && cp src/telemetry.ts .backup/phase2/

echo ""
echo "${YELLOW}Phase 3: Moving Root-Level Scientific Computing Files${NC}"
echo "Moving scattered files to proper structure..."

# Create target directories
mkdir -p src/computing/data/pandas
mkdir -p src/computing/data/numpy
mkdir -p src/computing/visualization/matplotlib
mkdir -p src/computing/optimization/scipy

# Move data files
echo "Moving data manipulation files..."
[ -f src/dataframe.ts ] && mv src/dataframe.ts src/computing/data/pandas/dataframe.ts
[ -f src/ndarray.ts ] && mv src/ndarray.ts src/computing/data/numpy/ndarray.ts
[ -f src/creation.ts ] && mv src/creation.ts src/computing/data/numpy/creation.ts
[ -f src/operations.ts ] && mv src/operations.ts src/computing/data/numpy/operations.ts
[ -f src/statistics.ts ] && mv src/statistics.ts src/computing/data/numpy/statistics.ts
[ -f src/manipulation.ts ] && mv src/manipulation.ts src/computing/data/numpy/manipulation.ts
[ -f src/interpolate.ts ] && mv src/interpolate.ts src/computing/data/numpy/interpolate.ts
[ -f src/stratified.ts ] && mv src/stratified.ts src/computing/data/stratified.ts
[ -f src/encoding.ts ] && mv src/encoding.ts src/computing/data/encoding.ts

# Move visualization files
echo "Moving visualization files..."
[ -f src/pyplot.ts ] && mv src/pyplot.ts src/computing/visualization/matplotlib/pyplot.ts
[ -f src/figure.ts ] && mv src/figure.ts src/computing/visualization/matplotlib/figure.ts
[ -f src/axes.ts ] && mv src/axes.ts src/computing/visualization/matplotlib/axes.ts
[ -f src/colors.ts ] && mv src/colors.ts src/computing/visualization/matplotlib/colors.ts
[ -f src/heatmap.ts ] && mv src/heatmap.ts src/computing/visualization/matplotlib/heatmap.ts
[ -f src/subplots.ts ] && mv src/subplots.ts src/computing/visualization/matplotlib/subplots.ts
[ -f src/advanced.ts ] && mv src/advanced.ts src/computing/visualization/matplotlib/advanced.ts

# Move optimization files
echo "Moving optimization files..."
[ -f src/optimize.ts ] && mv src/optimize.ts src/computing/optimization/scipy/optimize.ts

# Move utils
echo "Moving utility files..."
[ -f src/imputation.ts ] && mv src/imputation.ts src/utils/imputation.ts

echo ""
echo "${GREEN}✅ Phase 3 Complete${NC}"

echo ""
echo "${YELLOW}Phase 4: Migrating ts-scientific-computing Modules${NC}"
echo "This will be handled by TypeScript migration scripts..."

echo ""
echo "${GREEN}✅ Consolidation script complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run TypeScript compilation to check for import errors"
echo "2. Update import paths throughout the repository"
echo "3. Run tests to verify functionality"
echo "4. Clean up old ts-scientific-computing directory"
