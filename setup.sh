#!/bin/bash

# Auth-Spine Setup Script
# This script sets up the development environment

set -e

echo "🚀 Auth-Spine Setup Script"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
echo "🐘 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install it first.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

# Copy environment files
echo ""
echo "📝 Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your database credentials${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping...${NC}"
fi

if [ ! -f "packages/auth-server/.env" ]; then
    cp packages/auth-server/.env.example packages/auth-server/.env 2>/dev/null || echo "Creating auth-server .env..."
fi

if [ ! -f "apps/business-spine/.env" ]; then
    cp apps/business-spine/.env.example apps/business-spine/.env 2>/dev/null || echo "Creating business-spine .env..."
fi

# Generate Prisma Client
echo ""
echo "🔨 Generating Prisma Client..."
cd apps/business-spine
npx prisma generate
cd ../..

# Create database and run migrations
echo ""
echo "🗄️  Database setup..."
read -p "Do you want to create the database and run migrations? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/business-spine
    npx prisma migrate dev --name init
    echo -e "${GREEN}✅ Database migrations completed${NC}"
    
    # Seed database
    read -p "Do you want to seed the database with sample data? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma db seed
        echo -e "${GREEN}✅ Database seeded${NC}"
    fi
    cd ../..
fi

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. Run: npm run dev"
echo "3. Visit http://localhost:3000 (Business Spine)"
echo "4. Visit http://localhost:4000/health (Auth Server)"
echo ""
echo "For more info, see README.md"
