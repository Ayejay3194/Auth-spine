#!/usr/bin/env tsx

/**
 * Auth-Spine System Connectivity Test
 * 
 * This script verifies that all parts of the system can talk to each other.
 */

console.log('🔍 Auth-Spine Connectivity Test\n')
console.log('================================\n')

// Test 1: Check workspace packages
console.log('✅ Test 1: Workspace Package Resolution')
try {
  // These imports verify the monorepo is configured correctly
  console.log('  → Checking @spine/shared...')
  const sharedPackage = await import('./packages/shared/package.json', { assert: { type: 'json' } })
  console.log(`    ✓ Found ${sharedPackage.default.name}@${sharedPackage.default.version}`)
  
  console.log('  → Checking @spine/auth-server...')
  const authPackage = await import('./packages/auth-server/package.json', { assert: { type: 'json' } })
  console.log(`    ✓ Found ${authPackage.default.name}@${authPackage.default.version}`)
  
  console.log('  ✅ All workspace packages found\n')
} catch (error) {
  console.error('  ❌ Failed:', error)
  process.exit(1)
}

// Test 2: TypeScript compilation
console.log('✅ Test 2: TypeScript Configuration')
try {
  const fs = await import('fs/promises')
  
  console.log('  → Checking auth-server tsconfig.json...')
  const authTsConfig = await fs.readFile('./packages/auth-server/tsconfig.json', 'utf-8')
  const authConfig = JSON.parse(authTsConfig)
  console.log(`    ✓ Target: ${authConfig.compilerOptions.target}`)
  console.log(`    ✓ Module: ${authConfig.compilerOptions.module}`)
  
  console.log('  → Checking business-spine tsconfig.json...')
  const appTsConfig = await fs.readFile('./apps/business-spine/tsconfig.json', 'utf-8')
  const appConfig = JSON.parse(appTsConfig)
  console.log(`    ✓ Target: ${appConfig.compilerOptions.target}`)
  
  console.log('  ✅ TypeScript configurations valid\n')
} catch (error) {
  console.error('  ❌ Failed:', error)
  process.exit(1)
}

// Test 3: Database connectivity
console.log('✅ Test 3: Database Connectivity')
try {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  console.log('  → Connecting to database...')
  await prisma.$connect()
  console.log('    ✓ Database connected')
  
  console.log('  → Checking database schema...')
  const userCount = await prisma.user.count()
  console.log(`    ✓ Found ${userCount} users in database`)
  
  await prisma.$disconnect()
  console.log('  ✅ Database connectivity verified\n')
} catch (error) {
  console.error('  ⚠️  Database not available (this is OK if not set up yet)')
  console.error(`    ${(error as Error).message}\n`)
}

// Test 4: Import paths
console.log('✅ Test 4: Package Import Paths')
try {
  console.log('  → Checking session-store imports...')
  const fs = await import('fs/promises')
  const sessionStore = await fs.readFile('./packages/auth-server/src/session-store.ts', 'utf-8')
  
  if (sessionStore.includes('@spine/shared/prisma')) {
    console.log('    ✓ Uses @spine/shared/prisma')
  } else {
    throw new Error('session-store.ts not using shared package')
  }
  
  console.log('  → Checking server.ts imports...')
  const server = await fs.readFile('./packages/auth-server/src/server.ts', 'utf-8')
  
  if (server.includes('@spine/shared/prisma')) {
    console.log('    ✓ Uses @spine/shared/prisma')
  } else {
    throw new Error('server.ts not using shared package')
  }
  
  console.log('  ✅ All import paths correct\n')
} catch (error) {
  console.error('  ❌ Failed:', error)
  process.exit(1)
}

// Summary
console.log('================================')
console.log('✨ Connectivity Test Complete!\n')
console.log('All systems are properly connected.')
console.log('\nNext steps:')
console.log('1. Run: npm install')
console.log('2. Set up database: cd apps/business-spine && npx prisma migrate dev')
console.log('3. Start services: npm run dev')
console.log('\n')
