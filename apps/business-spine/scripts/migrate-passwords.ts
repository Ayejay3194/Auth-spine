#!/usr/bin/env tsx

/**
 * Password Migration Script
 * 
 * This script migrates all insecurely stored passwords to secure Argon2 hashing
 * and forces password reset for affected users.
 */

import { runPasswordMigration } from '../src/security/password-migration';

async function main() {
  console.log('🔒 Starting Password Migration');
  console.log('================================');
  
  try {
    const result = await runPasswordMigration();
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   - Users migrated: ${result.migratedUsers}`);
    console.log(`   - Users forced to reset: ${result.resetUsers}`);
    
    if (result.migratedUsers > 0) {
      console.log('\n⚠️  IMPORTANT: All migrated users must reset their passwords');
      console.log('   They will be prompted to reset on next login');
    }
    
    console.log('\n🎉 Password security is now properly implemented!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
