#!/bin/bash

# Auth-Spine Import Path Update Script
# Updates all imports to use new consolidated structure

set -e

echo "🔄 Updating import paths to use consolidated structure..."
echo "=========================================================="

BASE_DIR="/Users/autreyjenkinsjr./Documents/GitHub/Auth-spine"
cd "$BASE_DIR"

# Function to update imports in a file
update_file_imports() {
    local file=$1
    echo "Processing: $file"
    
    # Update ts-scientific-computing imports to new structure
    sed -i '' 's|from.*ts-scientific-computing/dist/index\.js|from "@libs/auth/jose"|g' "$file" 2>/dev/null || true
    
    # Update root-level imports to new paths
    sed -i '' 's|from.*["'\'']\.\.*/dataframe["'\'']|from "@computing/data/pandas/dataframe"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/ndarray["'\'']|from "@computing/data/numpy/ndarray"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/pyplot["'\'']|from "@computing/visualization/matplotlib/pyplot"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/auth["'\'']|from "@core/auth"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/monitoring["'\'']|from "@core/monitoring"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/logging["'\'']|from "@core/logging"|g' "$file" 2>/dev/null || true
    sed -i '' 's|from.*["'\'']\.\.*/telemetry["'\'']|from "@core/telemetry"|g' "$file" 2>/dev/null || true
}

# Find and update all TypeScript files
echo ""
echo "Updating TypeScript files in src/..."
find src -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
    update_file_imports "$file"
done

echo ""
echo "Updating TypeScript files in packages/..."
find packages -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
    update_file_imports "$file"
done

echo ""
echo "Updating TypeScript files in apps/..."
find apps -name "*.ts" -type f ! -path "*/node_modules/*" | while read file; do
    update_file_imports "$file"
done

echo ""
echo "Updating TSX files..."
find . -name "*.tsx" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" | while read file; do
    update_file_imports "$file"
done

echo ""
echo "✅ Import path updates complete!"
echo ""
echo "Next steps:"
echo "1. Run TypeScript compilation: npm run typecheck"
echo "2. Run tests: npm test"
echo "3. Verify no broken imports"
