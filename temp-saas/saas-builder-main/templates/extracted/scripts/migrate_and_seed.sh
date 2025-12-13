#!/usr/bin/env bash
set -e

echo "🗄️ Running Prisma migrate dev..."
npx prisma migrate dev

if npm run | grep -q "prisma:seed"; then
  echo "🌱 Running seed script..."
  npm run prisma:seed || pnpm prisma:seed || yarn prisma:seed || true
else
  echo "ℹ️ No prisma:seed script defined. Skipping seeding."
fi

echo "✅ Migration (and seed if present) complete."
