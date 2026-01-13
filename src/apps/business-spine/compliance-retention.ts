#!/usr/bin/env tsx

/**
 * Data Retention Policy Runner
 * Run with: npm run compliance:retention
 * Schedule via cron: 0 2 * * * cd /path/to/app && npm run compliance:retention
 */

import { scheduleRetentionPolicies } from '@/src/compliance/data-retention';

async function main() {
  console.log('Starting data retention policy execution...');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const results = await scheduleRetentionPolicies();
    
    console.log('\n✅ Data retention policies executed successfully');
    console.log(JSON.stringify(results, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Data retention policy execution failed:', error);
    process.exit(1);
  }
}

main();

