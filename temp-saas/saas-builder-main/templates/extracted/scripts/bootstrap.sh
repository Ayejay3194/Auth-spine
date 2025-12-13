#!/usr/bin/env bash
set -e

echo "🔧 Bootstrapping project..."

if [ -f ".env" ]; then
  echo "✅ .env already exists, skipping copy."
else
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example. Remember to fill in real values."
  else
    echo "⚠️ No .env.example found. Please create .env manually."
  fi
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "📦 Installing dependencies with pnpm..."
  pnpm install
elif command -v npm >/dev/null 2>&1; then
  echo "📦 Installing dependencies with npm..."
  npm install
else
  echo "❌ Neither pnpm nor npm found. Install one and re-run."
  exit 1
fi

echo "🗄️ Running Prisma migrations..."
npx prisma migrate dev

echo "✅ Bootstrap complete. You can now run:"
echo "   pnpm dev   # or: npm run dev"
