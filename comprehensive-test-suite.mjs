#!/usr/bin/env node

/**
 * Comprehensive Auth-Spine Test Suite
 * Tests all major components and integrations
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 AUTH-SPINE COMPREHENSIVE TEST SUITE');
console.log('====================================');
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const results = {
  core: { passed: 0, failed: 0, tests: [] },
  packages: { passed: 0, failed: 0, tests: [] },
  apps: { passed: 0, failed: 0, tests: [] },
  typescript: { passed: 0, failed: 0, tests: [] },
  scripts: { passed: 0, failed: 0, tests: [] },
  docs: { passed: 0, failed: 0, tests: [] }
};

function test(category, name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    results[category].passed++;
    results[category].tests.push(`✅ ${name}${details ? ' - ' + details : ''}`);
  } else {
    failedTests++;
    results[category].failed++;
    results[category].tests.push(`❌ ${name}${details ? ' - ' + details : ''}`);
    failures.push({ category, name, details });
  }
}

function section(name) {
  console.log(`\n📂 ${name}`);
  console.log('─'.repeat(50));
}

function checkFile(path, description) {
  const exists = existsSync(path);
  test('core', description, exists, exists ? 'Found' : `Missing: ${path}`);
  return exists;
}

function checkDirectory(path, description) {
  const exists = existsSync(path) && statSync(path).isDirectory();
  test('core', description, exists, exists ? 'Found' : `Missing: ${path}`);
  return exists;
}

// ============================================================================
// 1. Core Infrastructure Tests
// ============================================================================
section('1. Core Infrastructure');

// Check essential files
checkFile('package.json', 'Root package.json');
checkFile('tsconfig.json', 'TypeScript configuration');
checkFile('pnpm-workspace.yaml', 'Workspace configuration');
checkFile('README.md', 'Main README');
checkFile('.gitignore', 'Git ignore file');
checkFile('.env.example', 'Environment template');

// Check essential directories
checkDirectory('src', 'Source directory');
checkDirectory('packages', 'Packages directory');
checkDirectory('apps', 'Applications directory');
checkDirectory('scripts', 'Scripts directory');
checkDirectory('docs', 'Documentation directory');

// ============================================================================
// 2. TypeScript Scientific Computing Tests
// ============================================================================
section('2. TypeScript Scientific Computing');

if (checkDirectory('ts-scientific-computing', 'TypeScript scientific computing')) {
  const tsDir = 'ts-scientific-computing';
  
  // Check build output
  checkFile(`${tsDir}/dist/index.js`, 'Built TypeScript index');
  checkFile(`${tsDir}/package.json`, 'TypeScript package.json');
  
  // Check source structure
  checkDirectory(`${tsDir}/src`, 'TypeScript source directory');
  checkDirectory(`${tsDir}/src/typescript`, 'TypeScript library implementations');
  checkDirectory(`${tsDir}/src/advanced`, 'Advanced features');
  checkDirectory(`${tsDir}/src/production`, 'Production auth/monitoring');
  
  // Test TypeScript libraries
  const tsLibs = ['nextauth', 'jose', 'pino', 'sentry', 'openid', 'opentelemetry'];
  tsLibs.forEach(lib => {
    checkFile(`${tsDir}/src/typescript/${lib}.ts`, `${lib} TypeScript implementation`);
  });
  
  // Test advanced features
  const advancedFeatures = ['performance', 'columnar', 'optimizers', 'timeseries', 'visualization'];
  advancedFeatures.forEach(feature => {
    checkFile(`${tsDir}/src/advanced/${feature}.ts`, `${feature} implementation`);
  });
  
  // Test production modules
  const productionModules = ['auth', 'logging', 'monitoring', 'telemetry'];
  productionModules.forEach(module => {
    checkFile(`${tsDir}/src/production/${module}.ts`, `${module} production module`);
  });
}

// ============================================================================
// 3. Packages Tests
// ============================================================================
section('3. Workspace Packages');

if (checkDirectory('packages', 'Packages directory')) {
  const packagesDir = 'packages';
  const packages = readdirSync(packagesDir).filter(item => 
    statSync(join(packagesDir, item)).isDirectory()
  );
  
  packages.forEach(pkg => {
    const pkgPath = join(packagesDir, pkg);
    checkFile(join(pkgPath, 'package.json'), `${pkg} package.json`);
    checkDirectory(join(pkgPath, 'src'), `${pkg} source directory`);
    checkDirectory(join(pkgPath, 'dist'), `${pkg} build directory`);
  });
  
  test('packages', `Total packages found: ${packages.length}`, packages.length > 0);
}

// ============================================================================
// 4. Applications Tests
// ============================================================================
section('4. Applications');

if (checkDirectory('apps', 'Applications directory')) {
  const appsDir = 'apps';
  const apps = readdirSync(appsDir).filter(item => 
    statSync(join(appsDir, item)).isDirectory()
  );
  
  apps.forEach(app => {
    const appPath = join(appsDir, app);
    checkFile(join(appPath, 'package.json'), `${app} package.json`);
    checkDirectory(join(appPath, 'src'), `${app} source directory`);
  });
  
  test('apps', `Total applications found: ${apps.length}`, apps.length > 0);
}

// ============================================================================
// 5. Scripts Tests
// ============================================================================
section('5. Build & Test Scripts');

if (checkDirectory('scripts', 'Scripts directory')) {
  const scriptsDir = 'scripts';
  const scripts = readdirSync(scriptsDir).filter(file => file.endsWith('.mjs'));
  
  // Check key scripts
  const keyScripts = [
    'test-full-connectivity.mjs',
    'verify-unification.mjs',
    'test-connectivity.mjs',
    'test-module-routing.mjs'
  ];
  
  keyScripts.forEach(script => {
    checkFile(join(scriptsDir, script), script);
  });
  
  test('scripts', `Total scripts found: ${scripts.length}`, scripts.length > 0);
}

// ============================================================================
// 6. Documentation Tests
// ============================================================================
section('6. Documentation');

if (checkDirectory('docs', 'Documentation directory')) {
  const docsDir = 'docs';
  
  // Check key documentation files
  const keyDocs = [
    'README.md',
    'CONTRIBUTING.md',
    'AUDIT_SYSTEM_GUIDE.md',
    'FINAL_STATUS_REPORT.md'
  ];
  
  keyDocs.forEach(doc => {
    checkFile(join(docsDir, doc), doc);
  });
  
  // Check documentation subdirectories
  const docDirs = ['archive', 'guides', 'api'];
  docDirs.forEach(dir => {
    checkDirectory(join(docsDir, dir), `${dir} documentation`);
  });
}

// ============================================================================
// 7. Vendor Removal Verification
// ============================================================================
section('7. Vendor Directory Status');

const vendorExists = existsSync('vendor');
test('core', 'Vendor directory removed', !vendorExists, vendorExists ? 'Still exists (1.1GB)' : 'Successfully removed');

// ============================================================================
// 8. TypeScript Build Verification
// ============================================================================
section('8. TypeScript Build Status');

if (checkDirectory('ts-scientific-computing/dist', 'TypeScript build output')) {
  const distDir = 'ts-scientific-computing/dist';
  const distFiles = readdirSync(distDir).filter(file => file.endsWith('.js'));
  test('typescript', `Built JavaScript files: ${distFiles.length}`, distFiles.length > 0);
}

// ============================================================================
// 9. Integration Tests
// ============================================================================
section('9. Integration Tests');

// Test if TypeScript libraries can be imported
try {
  const tsLibs = require('./ts-scientific-computing/dist/index.js');
  const libCount = Object.keys(tsLibs).length;
  test('typescript', `TypeScript libraries importable: ${libCount}`, libCount > 0);
} catch (e) {
  test('typescript', 'TypeScript libraries importable', false, e.message);
}

// Test if auth package can be imported
try {
  const authPackage = require('./packages/auth/dist/index.js');
  const hasGenerateToken = typeof authPackage.generateToken === 'function';
  test('packages', 'Auth package importable', hasGenerateToken);
} catch (e) {
  test('packages', 'Auth package importable', false, e.message);
}

// ============================================================================
// 10. Generate Report
// ============================================================================
section('Test Results Summary');

console.log('\n📊 COMPREHENSIVE TEST RESULTS');
console.log('=============================');

Object.entries(results).forEach(([category, result]) => {
  const total = result.passed + result.failed;
  const percentage = total > 0 ? (result.passed / total * 100).toFixed(1) : '0.0';
  console.log(`\n${category.toUpperCase()}:`);
  console.log(`  Passed: ${result.passed}, Failed: ${result.failed} (${percentage}%)`);
  result.tests.forEach(test => console.log(`    ${test}`));
});

const overallPercentage = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0.0';

console.log(`\n🎯 OVERALL SYSTEM STATUS:`);
console.log(`  Total Tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log(`  Success Rate: ${overallPercentage}%`);

if (parseFloat(overallPercentage) >= 90) {
  console.log('\n🎉 SYSTEM STATUS: EXCELLENT - Production Ready!');
} else if (parseFloat(overallPercentage) >= 75) {
  console.log('\n✅ SYSTEM STATUS: GOOD - Mostly Functional');
} else if (parseFloat(overallPercentage) >= 50) {
  console.log('\n⚠️  SYSTEM STATUS: NEEDS ATTENTION - Some Issues');
} else {
  console.log('\n❌ SYSTEM STATUS: CRITICAL - Major Issues');
}

if (failures.length > 0) {
  console.log('\n🔧 FAILED TESTS:');
  failures.forEach(({ category, name, details }) => {
    console.log(`  [${category}] ${name}: ${details}`);
  });
}

console.log('\n🚀 Auth-Spine Comprehensive Test Suite Complete!');
