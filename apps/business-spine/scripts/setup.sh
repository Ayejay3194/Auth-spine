#!/bin/bash

# Business Spine Setup Script
set -e

echo "🚀 Setting up Business Spine..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Build the project
echo "🔨 Building the project..."
npm run build

# Set up git hooks (if git repository)
if [ -d .git ]; then
    echo "🔧 Setting up git hooks..."
    cp scripts/pre-commit .git/hooks/
    chmod +x .git/hooks/pre-commit
fi

# Run initial health check
echo "🏥 Running initial health check..."
npm run health || echo "⚠️  Health check failed, but setup completed"

echo "✅ Business Spine setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm start' to start the server"
echo "3. Visit http://localhost:3000/health to verify installation"
echo "4. Check README.md for usage instructions"
