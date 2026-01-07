#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Finding files with relative imports to packages...\n');

// Find all TypeScript files with relative imports to packages
const files = execSync(
  `find apps/business-spine/src -name "*.ts" -o -name "*.tsx"`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    // Fix imports from ../../../packages/enterprise to @spine/enterprise
    const enterpriseRegex = /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/packages\/enterprise\/([\w\/\-]+)(?:\.js)?['"]/g;
    if (enterpriseRegex.test(content)) {
      content = content.replace(enterpriseRegex, 'from "@spine/enterprise/$1"');
      modified = true;
    }

    // Also handle shorter relative paths
    const enterpriseRegex2 = /from ['"]\.\.\/\.\.\/\.\.\/packages\/enterprise\/([\w\/\-]+)(?:\.js)?['"]/g;
    if (enterpriseRegex2.test(content)) {
      content = content.replace(enterpriseRegex2, 'from "@spine/enterprise/$1"');
      modified = true;
    }

    if (modified) {
      writeFileSync(file, content);
      totalFixed++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✅ Fixed ${totalFixed} files with relative imports`);
