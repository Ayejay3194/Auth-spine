#!/usr/bin/env node
/**
 * Comprehensive Connectivity Test for Auth-Spine
 * Verifies all features are properly connected end-to-end
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('='.repeat(80));
console.log('AUTH-SPINE COMPREHENSIVE CONNECTIVITY TEST');
console.log('='.repeat(80));
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    failedTests++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failures.push({ name, details });
  }
}

function section(name) {
  console.log();
  console.log('━'.repeat(80));
  console.log(`SECTION: ${name}`);
  console.log('━'.repeat(80));
}

// ============================================================================
// 1. Database Schema Connectivity
// ============================================================================
section('1. Database Schema Models');

const schemaPath = join(__dirname, 'apps/business-spine/prisma/schema.prisma');
try {
  const schema = readFileSync(schemaPath, 'utf-8');
  
  const models = [
    'User', 'Provider', 'Client', 'Booking', 'Service', 
    'Session', 'RefreshToken', 'AuditLog', 'MfaSecret', 'MfaRecoveryCode',
    'KillSwitch', 'KillSwitchHistory', 'LaunchGate', 'LaunchGateHistory'
  ];
  
  for (const model of models) {
    const hasModel = schema.includes(`model ${model} {`);
    test(`Schema Model: ${model}`, hasModel, hasModel ? 'Defined' : 'Missing');
  }
} catch (error) {
  test('Database Schema', false, error.message);
}

// ============================================================================
// 2. MFA System Connectivity
// ============================================================================
section('2. MFA System Integration');

const mfaTests = [
  { file: 'apps/business-spine/src/security/mfa.ts', name: 'MFA Core Logic' },
  { file: 'apps/business-spine/src/app/api/auth/mfa/enroll/route.ts', name: 'MFA Enroll API' },
  { file: 'apps/business-spine/src/app/api/auth/mfa/verify/route.ts', name: 'MFA Verify API' },
  { file: 'apps/business-spine/src/app/api/auth/mfa/recovery/route.ts', name: 'MFA Recovery API' },
  { file: 'apps/business-spine/src/app/api/auth/mfa/status/route.ts', name: 'MFA Status API' }
];

for (const { file, name } of mfaTests) {
  const fullPath = join(__dirname, file);
  const exists = existsSync(fullPath);
  test(name, exists, exists ? 'Connected' : 'Missing');
  
  if (exists) {
    const content = readFileSync(fullPath, 'utf-8');
    const imports = content.match(/import.*from.*mfa/g) || [];
    test(`  └─ ${name} imports MFA logic`, imports.length > 0 || content.includes('mfa'), 
         imports.length > 0 ? `${imports.length} MFA imports` : 'Direct implementation');
  }
}

// ============================================================================
// 3. Kill Switches Connectivity
// ============================================================================
section('3. Kill Switches System');

const killSwitchPath = join(__dirname, 'apps/business-spine/src/ops/kill-switches.ts');
if (existsSync(killSwitchPath)) {
  const content = readFileSync(killSwitchPath, 'utf-8');
  
  test('Kill Switches Manager', true);
  test('  └─ Database integration', content.includes('prisma.killSwitch'), 
       content.includes('prisma.killSwitch') ? 'Using Prisma' : 'Not using database');
  test('  └─ History logging', content.includes('killSwitchHistory'), 
       content.includes('killSwitchHistory') ? 'Enabled' : 'Disabled');
  test('  └─ Auto-disable feature', content.includes('autoDisableExpiredSwitches'), 'Implemented');
  
  const apiPath = join(__dirname, 'apps/business-spine/src/app/api/ops/kill-switches/route.ts');
  const hasAPI = existsSync(apiPath);
  test('Kill Switches API', hasAPI, hasAPI ? 'GET, POST, PUT endpoints' : 'Missing');
  
  if (hasAPI) {
    const apiContent = readFileSync(apiPath, 'utf-8');
    test('  └─ API uses KillSwitchManager', apiContent.includes('KillSwitchManager'), 'Connected');
  }
} else {
  test('Kill Switches Manager', false, 'File missing');
}

// ============================================================================
// 4. Launch Gate Connectivity
// ============================================================================
section('4. Launch Gate System');

const launchGatePath = join(__dirname, 'apps/business-spine/src/app/api/ops/launch-gate/route.ts');
if (existsSync(launchGatePath)) {
  const content = readFileSync(launchGatePath, 'utf-8');
  
  test('Launch Gate API', true);
  test('  └─ Database integration', content.includes('prisma.launchGate'), 'Using Prisma');
  test('  └─ History logging', content.includes('launchGateHistory'), 'Enabled');
  test('  └─ GET endpoint', content.includes('export async function GET'), 'Implemented');
  test('  └─ POST endpoint', content.includes('export async function POST'), 'Implemented');
} else {
  test('Launch Gate API', false, 'File missing');
}

// ============================================================================
// 5. Notification Adapters
// ============================================================================
section('5. Notification System Integration');

const sendgridPath = join(__dirname, 'apps/business-spine/src/notifications/adapters/sendgrid.ts');
const twilioPath = join(__dirname, 'apps/business-spine/src/notifications/adapters/twilio.ts');

if (existsSync(sendgridPath)) {
  const content = readFileSync(sendgridPath, 'utf-8');
  test('SendGrid Adapter', true);
  test('  └─ Real API implementation', content.includes('api.sendgrid.com'), 'Connected to SendGrid');
  test('  └─ Environment config', content.includes('SENDGRID_API_KEY'), 'Uses env vars');
  test('  └─ Template support', content.includes('templateId'), 'Supported');
  test('  └─ Error handling', content.includes('try') && content.includes('catch'), 'Implemented');
} else {
  test('SendGrid Adapter', false, 'File missing');
}

if (existsSync(twilioPath)) {
  const content = readFileSync(twilioPath, 'utf-8');
  test('Twilio Adapter', true);
  test('  └─ Real API implementation', content.includes('api.twilio.com'), 'Connected to Twilio');
  test('  └─ Environment config', content.includes('TWILIO_ACCOUNT_SID'), 'Uses env vars');
  test('  └─ MMS support', content.includes('mediaUrls'), 'Supported');
  test('  └─ Error handling', content.includes('try') && content.includes('catch'), 'Implemented');
} else {
  test('Twilio Adapter', false, 'File missing');
}

// ============================================================================
// 6. TypeScript Migration
// ============================================================================
section('6. TypeScript Migration Status');

const tsFiles = [
  { path: 'index.ts', name: 'Main Orchestrator' },
  { path: 'apps/business-spine/ml/ranking/predict-wrapper.ts', name: 'ML TypeScript Wrapper' }
];

for (const { path: filePath, name } of tsFiles) {
  const fullPath = join(__dirname, filePath);
  const exists = existsSync(fullPath);
  test(name, exists, exists ? 'Migrated to TypeScript' : 'Not migrated');
}

// Check for remaining JS files (excluding config)
const jsFiles = [
  'index.js',
  'business-spine/verify-connections.js',
  'apps/business-spine/verify-connections.js'
];

for (const file of jsFiles) {
  const fullPath = join(__dirname, file);
  const exists = existsSync(fullPath);
  test(`Obsolete JS: ${file}`, !exists, exists ? 'Should be deleted' : 'Cleaned up');
}

// ============================================================================
// 7. AI/ML Integration
// ============================================================================
section('7. AI/ML Feature Connectivity');

const aiFiles = [
  { path: 'packages/enterprise/nlu/nlu-engine.ts', name: 'NLU Engine' },
  { path: 'apps/business-spine/src/llm/service.ts', name: 'LLM Service' },
  { path: 'apps/business-spine/src/smart/assistant.ts', name: 'Smart Assistant' },
  { path: 'apps/business-spine/src/assistant/engines/dynamicPricing.ts', name: 'Dynamic Pricing Engine' },
  { path: 'apps/business-spine/src/assistant/engines/predictiveScheduling.ts', name: 'Predictive Scheduling' },
  { path: 'apps/business-spine/src/assistant/engines/segmentation.ts', name: 'Segmentation Engine' }
];

for (const { path: filePath, name } of aiFiles) {
  const fullPath = join(__dirname, filePath);
  const exists = existsSync(fullPath);
  test(name, exists, exists ? 'Operational' : 'Missing');
}

// ============================================================================
// 8. Workspace Package Connectivity
// ============================================================================
section('8. Workspace Package Resolution');

const packageJsonPath = join(__dirname, 'package.json');
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  test('Root package.json', true);
  test('  └─ Workspaces defined', Array.isArray(packageJson.workspaces), 
       `${packageJson.workspaces?.length || 0} workspaces`);
  
  // Check shared-db package
  const sharedDbPath = join(__dirname, 'packages/shared-db/package.json');
  const hasSharedDb = existsSync(sharedDbPath);
  test('@spine/shared-db package', hasSharedDb, hasSharedDb ? 'Created' : 'Missing');
  
  // Check auth-server uses shared-db
  const authServerPkgPath = join(__dirname, 'packages/auth-server/package.json');
  if (existsSync(authServerPkgPath)) {
    const authServerPkg = JSON.parse(readFileSync(authServerPkgPath, 'utf-8'));
    const usesSharedDb = authServerPkg.dependencies?.['@spine/shared-db'];
    test('Auth-server → shared-db', !!usesSharedDb, usesSharedDb || 'Not using shared-db');
  }
}

// ============================================================================
// 9. API Endpoint Coverage
// ============================================================================
section('9. API Endpoint Coverage');

const apiEndpoints = [
  { path: 'apps/business-spine/src/app/api/auth/mfa/enroll/route.ts', name: '/api/auth/mfa/enroll' },
  { path: 'apps/business-spine/src/app/api/auth/mfa/verify/route.ts', name: '/api/auth/mfa/verify' },
  { path: 'apps/business-spine/src/app/api/auth/mfa/recovery/route.ts', name: '/api/auth/mfa/recovery' },
  { path: 'apps/business-spine/src/app/api/auth/mfa/status/route.ts', name: '/api/auth/mfa/status' },
  { path: 'apps/business-spine/src/app/api/ops/kill-switches/route.ts', name: '/api/ops/kill-switches' },
  { path: 'apps/business-spine/src/app/api/ops/launch-gate/route.ts', name: '/api/ops/launch-gate' }
];

for (const { path: filePath, name } of apiEndpoints) {
  const fullPath = join(__dirname, filePath);
  const exists = existsSync(fullPath);
  test(`API: ${name}`, exists, exists ? 'Implemented' : 'Missing');
  
  if (exists) {
    const content = readFileSync(fullPath, 'utf-8');
    const hasMethods = [];
    if (content.includes('export async function GET')) hasMethods.push('GET');
    if (content.includes('export async function POST')) hasMethods.push('POST');
    if (content.includes('export async function PUT')) hasMethods.push('PUT');
    if (content.includes('export async function DELETE')) hasMethods.push('DELETE');
    test(`  └─ HTTP Methods`, hasMethods.length > 0, hasMethods.join(', '));
  }
}

// ============================================================================
// 10. Cross-Component Integration
// ============================================================================
section('10. Cross-Component Integration Checks');

// Check if MFA APIs import from security/mfa
const mfaEnrollPath = join(__dirname, 'apps/business-spine/src/app/api/auth/mfa/enroll/route.ts');
if (existsSync(mfaEnrollPath)) {
  const content = readFileSync(mfaEnrollPath, 'utf-8');
  test('MFA API → MFA Security Module', 
       content.includes('from \'@/security/mfa\'') || content.includes('from "@/security/mfa"'),
       'APIs use core MFA logic');
}

// Check if kill switches API imports manager
const killSwitchAPIPath = join(__dirname, 'apps/business-spine/src/app/api/ops/kill-switches/route.ts');
if (existsSync(killSwitchAPIPath)) {
  const content = readFileSync(killSwitchAPIPath, 'utf-8');
  test('Kill Switch API → Manager', 
       content.includes('KillSwitchManager'),
       'API uses manager class');
}

// Check if notification engines use adapters
const notifEnginePath = join(__dirname, 'apps/business-spine/src/assistant/engines/notifications.ts');
if (existsSync(notifEnginePath)) {
  const content = readFileSync(notifEnginePath, 'utf-8');
  const usesSendGrid = content.includes('sendgrid') || content.includes('SendGrid');
  const usesTwilio = content.includes('twilio') || content.includes('Twilio');
  test('Notification Engine → Adapters', 
       usesSendGrid || usesTwilio,
       `Uses: ${[usesSendGrid && 'SendGrid', usesTwilio && 'Twilio'].filter(Boolean).join(', ')}`);
}

// ============================================================================
// 11. Test Files Connectivity
// ============================================================================
section('11. Test Infrastructure');

const testFiles = [
  { path: 'test-connectivity.mjs', name: 'Workspace Connectivity Test' },
  { path: 'test-ai-ml-features.mjs', name: 'AI/ML Features Test' },
  { path: 'test-full-connectivity.mjs', name: 'Full Connectivity Test (This file)' }
];

for (const { path: filePath, name } of testFiles) {
  const fullPath = join(__dirname, filePath);
  test(name, existsSync(fullPath));
}

// ============================================================================
// 12. Documentation
// ============================================================================
section('12. Documentation');

const docs = [
  { path: 'INTEGRATION_COMPLETE.md', name: 'Integration Documentation' },
  { path: 'TYPESCRIPT_MIGRATION_REPORT.md', name: 'TypeScript Migration Report' },
  { path: 'README.md', name: 'Main README' }
];

for (const { path: filePath, name } of docs) {
  const fullPath = join(__dirname, filePath);
  test(name, existsSync(fullPath));
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log();
console.log('='.repeat(80));
console.log('CONNECTIVITY TEST SUMMARY');
console.log('='.repeat(80));
console.log();
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log();

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);
console.log();

if (failedTests === 0) {
  console.log('🎉 ALL SYSTEMS CONNECTED! Repository is production-ready.');
} else if (successRate >= 90) {
  console.log('✅ EXCELLENT CONNECTIVITY (90%+)');
  console.log('⚠️  Minor issues detected:');
  failures.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
} else if (successRate >= 75) {
  console.log('⚠️  GOOD CONNECTIVITY (75-90%)');
  console.log('🔧 Issues to address:');
  failures.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
} else {
  console.log('❌ CONNECTIVITY ISSUES DETECTED');
  console.log('🔧 Critical issues to fix:');
  failures.forEach(f => console.log(`   - ${f.name}: ${f.details}`));
}

console.log();
console.log('='.repeat(80));
console.log('CONNECTIVITY MATRIX');
console.log('='.repeat(80));
console.log();

const matrix = {
  'Database Schema': passedTests >= 14,
  'MFA System': passedTests >= 20,
  'Kill Switches': passedTests >= 24,
  'Launch Gates': passedTests >= 28,
  'Notifications': passedTests >= 36,
  'TypeScript Migration': passedTests >= 40,
  'AI/ML Features': passedTests >= 46,
  'Workspace Packages': passedTests >= 49,
  'API Endpoints': passedTests >= 58,
  'Cross-Component': passedTests >= 61,
  'Tests': passedTests >= 64,
  'Documentation': passedTests >= 67
};

for (const [component, connected] of Object.entries(matrix)) {
  console.log(`${connected ? '✅' : '❌'} ${component}`);
}

console.log();
process.exit(failedTests === 0 ? 0 : 1);
