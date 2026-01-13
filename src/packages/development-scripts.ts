/**
 * Development Scripts for Supabase At Home Pack
 * 
 * Provides development scripts, automation tools,
 * and utility functions for local development.
 */

export class DevelopmentScriptsManager {
  private config: any;
  private initialized = false;

  /**
   * Initialize development scripts
   */
  async initialize(config: any): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Generate development scripts
   */
  generateScripts(): {
    start: string;
    stop: string;
    restart: string;
    logs: string;
    migrate: string;
    seed: string;
  } {
    return {
      start: this.generateStartScript(),
      stop: this.generateStopScript(),
      restart: this.generateRestartScript(),
      logs: this.generateLogsScript(),
      migrate: this.generateMigrateScript(),
      seed: this.generateSeedScript()
    };
  }

  /**
   * Generate package.json scripts
   */
  generatePackageScripts(): Record<string, string> {
    return {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "type-check": "tsc --noEmit",
      "db:push": "supabase db push",
      "db:reset": "supabase db reset",
      "db:seed": "supabase db seed",
      "db:types": "supabase gen types typescript --local > types/database.ts",
      "functions:deploy": "supabase functions deploy",
      "functions:serve": "supabase functions serve --env-file .env.local",
      "docker:start": "docker-compose up -d",
      "docker:stop": "docker-compose down",
      "docker:restart": "docker-compose restart",
      "docker:logs": "docker-compose logs -f",
      "docker:clean": "docker-compose down -v --remove-orphans",
      "local:start": "npm run docker:start && npm run db:push && npm run dev",
      "local:setup": "npm run docker:start && sleep 30 && npm run db:push && npm run db:seed",
      "local:teardown": "npm run docker:stop && npm run docker:clean",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "storybook": "storybook dev -p 6006",
      "storybook:build": "storybook build"
    };
  }

  /**
   * Generate shell scripts
   */
  generateShellScripts(): {
    setup: string;
    teardown: string;
    backup: string;
    restore: string;
  } {
    return {
      setup: this.generateSetupScript(),
      teardown: this.generateTeardownScript(),
      backup: this.generateBackupScript(),
      restore: this.generateRestoreScript()
    };
  }

  /**
   * Generate environment files
   */
  generateEnvironmentFiles(): {
    local: string;
    development: string;
    production: string;
  } {
    return {
      local: this.generateLocalEnv(),
      development: this.generateDevelopmentEnv(),
      production: this.generateProductionEnv()
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  private generateStartScript(): string {
    return `#!/bin/bash
# Supabase At Home - Start Script

set -e

echo "🚀 Starting Supabase At Home environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are healthy
echo "🔍 Checking service health..."
python scripts/check-health.py

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:push

# Seed database if requested
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

# Start development server
echo "🛠️ Starting development server..."
npm run dev

echo "✅ Supabase At Home environment started successfully!"
echo "🌐 Supabase Studio: http://localhost:3000"
echo "🔧 Kong Admin: http://localhost:8001"
echo "📊 Kong Manager: http://localhost:8002"
echo "🚀 API: http://localhost:8000"
`;
  }

  private generateStopScript(): string {
    return `#!/bin/bash
# Supabase At Home - Stop Script

set -e

echo "🛑 Stopping Supabase At Home environment..."

# Stop Docker containers
echo "📦 Stopping Docker containers..."
docker-compose down

# Clean up if requested
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
fi

echo "✅ Supabase At Home environment stopped successfully!"
`;
  }

  private generateRestartScript(): string {
    return `#!/bin/bash
# Supabase At Home - Restart Script

set -e

echo "🔄 Restarting Supabase At Home environment..."

# Stop environment
./scripts/stop.sh

# Wait a moment
sleep 5

# Start environment
./scripts/start.sh

echo "✅ Supabase At Home environment restarted successfully!"
`;
  }

  private generateLogsScript(): string {
    return `#!/bin/bash
# Supabase At Home - Logs Script

set -e

SERVICE=${1:-"all"}

if [ "$SERVICE" = "all" ]; then
    echo "📋 Showing logs for all services..."
    docker-compose logs -f
else
    echo "📋 Showing logs for $SERVICE..."
    docker-compose logs -f "$SERVICE"
fi
`;
  }

  private generateMigrateScript(): string {
    return `#!/bin/bash
# Supabase At Home - Migration Script

set -e

echo "🗄️ Running database migrations..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Run migrations
supabase db push

echo "✅ Database migrations completed successfully!"
`;
  }

  private generateSeedScript(): string {
    return `#!/bin/bash
# Supabase At Home - Seed Script

set -e

echo "🌱 Seeding database with test data..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Seed database
supabase db seed

echo "✅ Database seeding completed successfully!"
`;
  }

  private generateSetupScript(): string {
    return `#!/bin/bash
# Supabase At Home - Setup Script

set -e

echo "🔧 Setting up Supabase At Home environment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p volumes/postgres/data
mkdir -p volumes/storage
mkdir -p supabase/migrations
mkdir -p supabase/seed
mkdir -p functions
mkdir -p kong
mkdir -p scripts

# Generate environment files
echo "📝 Generating environment files..."
cp .env.example .env.local

# Generate Kong configuration
echo "🔧 Generating Kong configuration..."
cat > kong/kong.yml << 'EOF'
_format_version: "3.0"
services:
- name: supabase-postgrest
  url: http://supabase:3000
routes:
- name: supabase-rest
  service: supabase-postgrest
  paths: ["/rest/v1"]
EOF

# Initialize Supabase project
echo "🚀 Initializing Supabase project..."
supabase init

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

echo "✅ Supabase At Home environment setup completed!"
echo "🎯 Run './scripts/start.sh' to start the environment."
`;
  }

  private generateTeardownScript(): string {
    return `#!/bin/bash
# Supabase At Home - Teardown Script

set -e

echo "🧹 Tearing down Supabase At Home environment..."

# Stop and remove containers
echo "📦 Removing Docker containers..."
docker-compose down -v --remove-orphans

# Remove Docker images
echo "🖼️ Removing Docker images..."
docker-compose down --rmi all

# Clean up Docker system
echo "🧽 Cleaning up Docker system..."
docker system prune -af

# Remove generated files
echo "🗑️ Removing generated files..."
rm -rf volumes/
rm -f .env.local
rm -f supabase/config.toml

echo "✅ Supabase At Home environment torn down successfully!"
`;
  }

  private generateBackupScript(): string {
    return `#!/bin/bash
# Supabase At Home - Backup Script

set -e

BACKUP_DIR=${1:-"./backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "💾 Creating database backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create database backup
docker-compose exec -T postgres pg_dump -U postgres postgres > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "✅ Database backup created: ${BACKUP_FILE}.gz"
echo "📂 To restore: ./scripts/restore.sh ${BACKUP_FILE}.gz"
`;
  }

  private generateRestoreScript(): string {
    return `#!/bin/bash
# Supabase At Home - Restore Script

set -e

BACKUP_FILE=${1:-""}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Please provide a backup file path."
    echo "Usage: ./scripts/restore.sh <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from backup..."

# Decompress backup if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U postgres -d postgres
else
    docker-compose exec -T postgres psql -U postgres -d postgres < "$BACKUP_FILE"
fi

echo "✅ Database restored successfully from: $BACKUP_FILE"
`;
  }

  private generateLocalEnv(): string {
    return `# Supabase At Home - Local Environment Variables

# Supabase Configuration
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres

# Kong Configuration
KONG_ADMIN_URL=http://localhost:8001
KONG_PROXY_URL=http://localhost:8000

# Development Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# Email Configuration (for development)
SMTP_HOST=inbucket
SMTP_PORT=2500
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=admin@email.com

# Storage Configuration
STORAGE_BACKEND=file
FILE_SIZE_LIMIT=52428800

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
`;
  }

  private generateDevelopmentEnv(): string {
    return `# Supabase At Home - Development Environment Variables

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Development Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-jwt-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# Development Settings
NODE_ENV=development
LOG_LEVEL=info
`;
  }

  private generateProductionEnv(): string {
    return `# Supabase At Home - Production Environment Variables

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Production Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-production-jwt-secret

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# Production Settings
NODE_ENV=production
LOG_LEVEL=error

# Security
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=90000
`;
  }
}

// Export singleton instance
export const developmentScripts = new DevelopmentScriptsManager();
