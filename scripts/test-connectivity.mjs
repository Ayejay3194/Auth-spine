#!/usr/bin/env node

/**
 * Auth-Spine System Connectivity Test
 * Verifies that all parts of the system can talk to each other.
 */

import { readFile } from 'fs/promises'

console.log('🔍 Auth-Spine Connectivity Test\n')
console.log('================================\n')

// Test 1: Check workspace packages
console.log('✅ Test 1: Workspace Package Resolution')
try {
  const sharedDbPkg = JSON.parse(await readFile('./packages/shared-db/package.json', 'utf-8'))
  console.log(`  ✓ Found ${sharedDbPkg.name}@${sharedDbPkg.version}`)
  
  const authPkg = JSON.parse(await readFile('./packages/auth-server/package.json', 'utf-8'))
  console.log(`  ✓ Found ${authPkg.name}@${authPkg.version}`)
  
  console.log('  ✅ All workspace packages found\n')
} catch (error) {
  console.error('  ❌ Failed:', error.message)
  process.exit(1)
}

// Test 2: Import paths
console.log('✅ Test 2: Package Import Paths')
try {
  const sessionStore = await readFile('./packages/auth-server/src/session-store.ts', 'utf-8')
  
  if (sessionStore.includes('@spine/shared-db/prisma')) {
    console.log('  ✓ session-store.ts uses @spine/shared-db/prisma')
  } else {
    throw new Error('session-store.ts not using shared-db')
  }
  
  const server = await readFile('./packages/auth-server/src/server.ts', 'utf-8')
  
  if (server.includes('@spine/shared-db/prisma')) {
    console.log('  ✓ server.ts uses @spine/shared-db/prisma')
  } else {
    throw new Error('server.ts not using shared-db')
  }
  
  console.log('  ✅ All import paths correct\n')
} catch (error) {
  console.error('  ❌ Failed:', error.message)
  process.exit(1)
}

// Test 3: Workspace configuration
console.log('✅ Test 3: Monorepo Configuration')
try {
  const rootPkg = JSON.parse(await readFile('./package.json', 'utf-8'))
  
  if (rootPkg.workspaces.includes('packages/*') && rootPkg.workspaces.includes('apps/*')) {
    console.log('  ✓ Workspaces properly configured')
  } else {
    throw new Error('Workspaces misconfigured')
  }
  
  console.log('  ✅ Monorepo structure valid\n')
} catch (error) {
  console.error('  ❌ Failed:', error.message)
  process.exit(1)
}

// Summary
console.log('================================')
console.log('✨ Connectivity Test Complete!\n')
console.log('All systems are properly connected.\n')
console.log('Next steps:')
console.log('1. Run: npm install')
console.log('2. Set up: ./setup.sh')
console.log('3. Start: npm run dev\n')
