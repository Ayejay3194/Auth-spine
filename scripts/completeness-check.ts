#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CheckResults {
  overall: boolean;
  categories: Record<string, CategoryResult>;
  score: number;
  maxScore: number;
  timestamp: string;
}

interface CategoryResult {
  score: number;
  maxScore: number;
  checks: Record<string, any>;
}

class SystemCompletenessChecker {
  private rootPath: string;
  private results: CheckResults;

  constructor() {
    this.rootPath = path.join(__dirname, '..');
    this.results = {
      overall: true,
      categories: {},
      score: 0,
      maxScore: 0,
      timestamp: new Date().toISOString()
    };
  }

  async runCompletenessCheck(): Promise<void> {
    console.log('🔍 Running Auth-spine System Completeness Check...\n');
    try {
      await this.checkCorePlatform();
      await this.checkEnterprisePackages();
      await this.checkSecurityFramework();
      await this.checkBusinessOperations();
      await this.checkDocumentation();
      this.generateReport();
    } catch (error) {
      console.error('❌ Completeness check failed:', error);
      this.results.overall = false;
    }
  }

  async checkCorePlatform(): Promise<void> {
    console.log('🎯 Checking core platform...');
    const category: CategoryResult = { score: 0, maxScore: 0, checks: {} };
    
    const checks = [
      { name: 'index.ts', path: 'index.ts' },
      { name: 'package.json', path: 'package.json' },
      { name: 'README.md', path: 'README.md' },
      { name: 'business-spine', path: 'apps/business-spine' },
      { name: 'enterprise', path: 'packages/enterprise' }
    ];

    for (const check of checks) {
      category.maxScore++;
      const exists = fs.existsSync(path.join(this.rootPath, check.path));
      category.checks[check.name] = { status: exists ? 'present' : 'missing' };
      if (exists) category.score++;
    }

    this.results.categories.corePlatform = category;
    console.log(`✅ Core platform: ${category.score}/${category.maxScore}\n`);
  }

  async checkEnterprisePackages(): Promise<void> {
    console.log('🏢 Checking enterprise packages...');
    const category: CategoryResult = { score: 0, maxScore: 0, checks: {} };
    const enterprisePath = path.join(this.rootPath, 'packages', 'enterprise');

    if (fs.existsSync(enterprisePath)) {
      const packages = fs.readdirSync(enterprisePath).filter(item => 
        fs.statSync(path.join(enterprisePath, item)).isDirectory()
      );
      
      category.maxScore = packages.length;
      for (const pkg of packages) {
        const indexPath = path.join(enterprisePath, pkg, 'index.ts');
        const exists = fs.existsSync(indexPath);
        category.checks[pkg] = { status: exists ? 'complete' : 'missing_index' };
        if (exists) category.score++;
      }
    }

    this.results.categories.enterprisePackages = category;
    console.log(`✅ Enterprise packages: ${category.score}/${category.maxScore}\n`);
  }

  async checkSecurityFramework(): Promise<void> {
    console.log('🔒 Checking security framework...');
    const category: CategoryResult = { score: 0, maxScore: 0, checks: {} };
    const basePath = path.join(this.rootPath, 'apps', 'business-spine', 'src');

    const securityChecks = [
      { name: 'auth', path: path.join(basePath, 'security', 'auth') },
      { name: 'mfa', path: path.join(basePath, 'security', 'mfa') },
      { name: 'rbac', path: path.join(basePath, 'security', 'rbac') },
      { name: 'sessions', path: path.join(basePath, 'security', 'sessions') },
      { name: 'audit', path: path.join(basePath, 'security', 'audit.ts') }
    ];

    for (const check of securityChecks) {
      category.maxScore++;
      const exists = fs.existsSync(check.path);
      category.checks[check.name] = { status: exists ? 'present' : 'missing' };
      if (exists) category.score++;
    }

    this.results.categories.securityFramework = category;
    console.log(`✅ Security framework: ${category.score}/${category.maxScore}\n`);
  }

  async checkBusinessOperations(): Promise<void> {
    console.log('📊 Checking business operations...');
    const category: CategoryResult = { score: 0, maxScore: 0, checks: {} };
    const basePath = path.join(this.rootPath, 'apps', 'business-spine', 'src');

    const operationsChecks = [
      { name: 'bookings', path: path.join(basePath, 'suites', 'business', 'bookings') },
      { name: 'services', path: path.join(basePath, 'suites', 'business', 'services') },
      { name: 'providers', path: path.join(basePath, 'suites', 'business', 'providers') },
      { name: 'payments', path: path.join(basePath, 'suites', 'business', 'payments') },
      { name: 'notifications', path: path.join(basePath, 'notifications') }
    ];

    for (const check of operationsChecks) {
      category.maxScore++;
      const exists = fs.existsSync(check.path);
      category.checks[check.name] = { status: exists ? 'present' : 'missing' };
      if (exists) category.score++;
    }

    this.results.categories.businessOperations = category;
    console.log(`✅ Business operations: ${category.score}/${category.maxScore}\n`);
  }

  async checkDocumentation(): Promise<void> {
    console.log('📚 Checking documentation...');
    const category: CategoryResult = { score: 0, maxScore: 0, checks: {} };

    const docs = [
      { name: 'README', path: 'README.md' },
      { name: 'INTEGRATION', path: 'INTEGRATION_COMPLETE.md' },
      { name: 'MIGRATION', path: 'TYPESCRIPT_MIGRATION_REPORT.md' },
      { name: 'UNIFICATION', path: 'REPOSITORY_UNIFICATION_COMPLETE.md' }
    ];

    for (const doc of docs) {
      category.maxScore++;
      const exists = fs.existsSync(path.join(this.rootPath, doc.path));
      category.checks[doc.name] = { status: exists ? 'present' : 'missing' };
      if (exists) category.score++;
    }

    this.results.categories.documentation = category;
    console.log(`✅ Documentation: ${category.score}/${category.maxScore}\n`);
  }

  generateReport(): void {
    console.log('📊 System Completeness Report');
    console.log('=============================\n');

    let totalScore = 0;
    let totalMaxScore = 0;

    for (const [categoryName, category] of Object.entries(this.results.categories)) {
      console.log(`${categoryName.toUpperCase()}:`);
      console.log(`  Score: ${category.score}/${category.maxScore} (${Math.round((category.score/category.maxScore)*100)}%)`);
      totalScore += category.score;
      totalMaxScore += category.maxScore;
      
      for (const [checkName, result] of Object.entries(category.checks)) {
        const icon = result.status === 'present' || result.status === 'complete' ? '✅' : '❌';
        console.log(`  ${icon} ${checkName}: ${result.status}`);
      }
      console.log('');
    }

    this.results.score = totalScore;
    this.results.maxScore = totalMaxScore;
    const percentage = Math.round((totalScore / totalMaxScore) * 100);

    console.log('📈 Overall Completeness:');
    console.log(`  Total Score: ${totalScore}/${totalMaxScore}`);
    console.log(`  Percentage: ${percentage}%`);
    console.log(`  Status: ${percentage >= 90 ? '✅ Excellent' : percentage >= 75 ? '✅ Good' : percentage >= 60 ? '⚠️ Fair' : '❌ Needs Work'}`);
    console.log(`  Timestamp: ${this.results.timestamp}`);

    this.results.overall = percentage >= 75;
    process.exit(this.results.overall ? 0 : 1);
  }
}

const checker = new SystemCompletenessChecker();
checker.runCompletenessCheck().catch(error => {
  console.error('Completeness check failed:', error);
  process.exit(1);
});

export default SystemCompletenessChecker;
