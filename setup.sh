#!/bin/bash

# ============================================
# Auth-Spine Setup Script
# ============================================
# Automated setup for development environment
# Supports: Local dev, Docker, and CI/CD
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIN_NODE_VERSION=18
MIN_POSTGRES_VERSION=14

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main script
print_header "🚀 Auth-Spine Setup Script"

# Check Node.js version
print_info "Checking Node.js version..."
if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt $MIN_NODE_VERSION ]; then
    print_error "Node.js $MIN_NODE_VERSION+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v)"

# Check npm
if ! command_exists npm; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_success "npm $(npm -v)"

# Check PostgreSQL (optional but recommended)
print_info "Checking PostgreSQL..."
if ! command_exists psql; then
    print_warning "PostgreSQL not found. You can install it or use Docker instead."
    print_info "Docker: docker-compose up -d postgres"
    print_info "Or install: https://www.postgresql.org/download/"
else
    print_success "PostgreSQL found"
fi

# Check Docker (optional)
if command_exists docker; then
    print_success "Docker $(docker --version | cut -d' ' -f3)"
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose available"
    fi
else
    print_info "Docker not found (optional - can use local PostgreSQL)"
fi

# Install dependencies
print_header "📥 Installing Dependencies"
npm install
print_success "Dependencies installed"

# Setup environment files
print_header "📝 Setting Up Environment Variables"

# Root .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Created .env file"
    print_warning "Please edit .env with your database credentials"
else
    print_info ".env already exists, skipping..."
fi

# Auth server .env
if [ ! -f "packages/auth-server/.env" ]; then
    if [ -f "packages/auth-server/.env.example" ]; then
        cp packages/auth-server/.env.example packages/auth-server/.env
        print_success "Created packages/auth-server/.env"
    fi
else
    print_info "packages/auth-server/.env already exists"
fi

# Business spine .env
if [ ! -f "apps/business-spine/.env" ]; then
    if [ -f "apps/business-spine/.env.example" ]; then
        cp apps/business-spine/.env.example apps/business-spine/.env
        print_success "Created apps/business-spine/.env"
    fi
else
    print_info "apps/business-spine/.env already exists"
fi

# Generate Prisma Client
print_header "🔨 Generating Prisma Client"
if [ -d "apps/business-spine" ]; then
    cd apps/business-spine
    if npx prisma generate; then
        print_success "Prisma Client generated"
    else
        print_warning "Prisma generate failed (may need database setup first)"
    fi
    cd ../..
fi

# Ask about database setup
print_header "🗄️  Database Setup"
print_info "Do you want to set up the database now?"
print_info "This requires PostgreSQL to be running and DATABASE_URL configured in .env"
echo ""
read -p "Set up database now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/business-spine
    
    print_info "Running database migrations..."
    if npx prisma migrate dev --name init; then
        print_success "Database migrations completed"
        
        # Ask about seeding
        echo ""
        read -p "Seed database with sample data? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if npx prisma db seed; then
                print_success "Database seeded"
            else
                print_warning "Seeding failed or no seed script found"
            fi
        fi
    else
        print_error "Database migration failed"
        print_info "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
        print_info "You can run migrations later with: cd apps/business-spine && npx prisma migrate dev"
    fi
    cd ../..
else
    print_info "Skipping database setup"
    print_info "Run later with: cd apps/business-spine && npx prisma migrate dev"
fi

# Build check (optional)
print_header "🏗️  Build Verification"
read -p "Run a test build to verify setup? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running type check..."
    if npm run typecheck; then
        print_success "Type check passed"
    else
        print_warning "Type check had errors (may be expected during initial setup)"
    fi
fi

# Final instructions
print_header "✨ Setup Complete!"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo ""
echo "1. Edit environment files:"
echo "   - .env (root)"
echo "   - packages/auth-server/.env"
echo "   - apps/business-spine/.env"
echo ""
echo "2. Choose your development method:"
echo ""
echo -e "${BLUE}   Option A: Local Development${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}   Option B: Docker Development${NC}"
echo "   docker-compose up -d"
echo ""
echo -e "${BLUE}   Option C: Production Docker${NC}"
echo "   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
echo "3. Access your services:"
echo "   - Business App: http://localhost:3000"
echo "   - Auth Server:  http://localhost:4000"
echo "   - Health Check: http://localhost:4000/health"
echo ""
echo "4. Test the API:"
echo "   - Import api-collections/auth-spine-postman.json into Postman"
echo "   - See api-collections/README.md for details"
echo ""
echo -e "${BLUE}For more information:${NC}"
echo "   - Quick Start: QUICK_START.md"
echo "   - Documentation: docs/"
echo "   - Deployment: k8s/ or docker-compose.yml"
echo "   - Security: SECURITY.md"
echo ""
print_success "Happy coding! 🚀"
echo ""
