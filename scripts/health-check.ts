#!/usr/bin/env node

/**
 * Auth-spine System Health Check
 *
 * Comprehensive health check for the entire Auth-spine platform
 * including business-spine and enterprise packages.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface HealthCheckResult {
  overall: boolean;
  components: Record<string, any>;
  timestamp: string;
  error?: string;
}

interface ComponentHealth {
  status: string;
  checks?: Record<string, any>;
  packages?: Record<string, any>;
  totalPackages?: number;
  healthyPackages?: number;
}

class SystemHealthChecker {
  private rootPath: string;
  private businessSpinePath: string;
  private enterprisePath: string;
  private results: HealthCheckResult;

  constructor() {
    this.rootPath = path.join(__dirname, '..');
    this.businessSpinePath = path.join(this.rootPath, 'apps', 'business-spine');
    this.enterprisePath = path.join(this.rootPath, 'packages', 'enterprise');
    this.results = {
      overall: true,
      components: {},
      timestamp: new Date().toISOString()
    };
  }

  async runHealthCheck(): Promise<void> {
    console.log('🔍 Running Auth-spine System Health Check...\n');
    try {
      await this.checkProjectStructure();
      await this.checkBusinessSpine();
      await this.checkEnterprisePackages();
      await this.checkIntegration();
      this.generateReport();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.results.overall = false;
      this.results.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  async checkProjectStructure(): Promise<void> {
    console.log('📁 Checking project structure...');
    const requiredFiles = ['package.json', 'index.ts', 'README.md'];
    const requiredDirs = ['apps/business-spine', 'packages', 'packages/enterprise', 'docs', 'tools', 'scripts'];

    for (const file of requiredFiles) {
      const filePath = path.join(this.rootPath, file);
      const exists = fs.existsSync(filePath);
      this.results.components[`structure:${file}`] = { status: exists ? 'healthy' : 'missing', path: filePath };
      if (!exists) this.results.overall = false;
    }

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.rootPath, dir);
      const exists = fs.existsSync(dirPath);
      this.results.components[`structure:${dir}`] = { status: exists ? 'healthy' : 'missing', path: dirPath };
      if (!exists) this.results.overall = false;
    }
    console.log('✅ Project structure check complete\n');
  }

  async checkBusinessSpine(): Promise<void> {
    console.log('📊 Checking business-spine component...');
    const businessSpineHealth: ComponentHealth = { status: 'healthy', checks: {} };
    const packageJsonPath = path.join(this.businessSpinePath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        businessSpineHealth.checks!.packageJson = { status: 'healthy', name: packageJson.name, version: packageJson.version };
      } catch (error) {
        businessSpineHealth.checks!.packageJson = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
        businessSpineHealth.status = 'unhealthy';
      }
    } else {
      businessSpineHealth.checks!.packageJson = { status: 'missing' };
      businessSpineHealth.status = 'unhealthy';
    }

    const keyDirs = ['app', 'src', 'components', 'lib', 'prisma'];
    for (const dir of keyDirs) {
      const dirPath = path.join(this.businessSpinePath, dir);
      const exists = fs.existsSync(dirPath);
      businessSpineHealth.checks![dir] = { status: exists ? 'healthy' : 'missing' };
      if (!exists) businessSpineHealth.status = 'unhealthy';
    }

    const nextConfigPath = path.join(this.businessSpinePath, 'next.config.mjs');
    businessSpineHealth.checks!.nextConfig = { status: fs.existsSync(nextConfigPath) ? 'healthy' : 'missing' };

    this.results.components.businessSpine = businessSpineHealth;
    if (businessSpineHealth.status !== 'healthy') this.results.overall = false;
    console.log(`✅ Business-spine check: ${businessSpineHealth.status}\n`);
  }

  async checkEnterprisePackages(): Promise<void> {
    console.log('🏢 Checking enterprise packages...');
    const enterpriseHealth: ComponentHealth = { status: 'healthy', packages: {}, totalPackages: 0, healthyPackages: 0 };
    const mainFiles = ['index.ts', 'orchestrator.ts'];
    
    for (const file of mainFiles) {
      const filePath = path.join(this.enterprisePath, file);
      const exists = fs.existsSync(filePath);
      enterpriseHealth.packages![`main:${file}`] = { status: exists ? 'healthy' : 'missing' };
      if (!exists) enterpriseHealth.status = 'unhealthy';
    }

    if (fs.existsSync(this.enterprisePath)) {
      const packages = fs.readdirSync(this.enterprisePath).filter(item => {
        const itemPath = path.join(this.enterprisePath, item);
        return fs.statSync(itemPath).isDirectory();
      });

      enterpriseHealth.totalPackages = packages.length;

      for (const pkg of packages) {
        const pkgPath = path.join(this.enterprisePath, pkg);
        const indexPath = path.join(pkgPath, 'index.ts');
        const pkgHealth = { status: fs.existsSync(indexPath) ? 'healthy' : 'missing_index', hasIndex: fs.existsSync(indexPath) };
        enterpriseHealth.packages![pkg] = pkgHealth;
        if (pkgHealth.status === 'healthy') enterpriseHealth.healthyPackages!++;
        else enterpriseHealth.status = 'unhealthy';
      }
    } else {
      enterpriseHealth.status = 'missing';
    }

    this.results.components.enterprise = enterpriseHealth;
    if (enterpriseHealth.status !== 'healthy') this.results.overall = false;
    console.log(`✅ Enterprise packages check: ${enterpriseHealth.status} (${enterpriseHealth.healthyPackages}/${enterpriseHealth.totalPackages} healthy)\n`);
  }

  async checkIntegration(): Promise<void> {
    console.log('🔗 Checking integration points...');
    const integrationHealth: ComponentHealth = { status: 'healthy', checks: {} };

    try {
      const enterpriseOrchestratorPath = path.join(this.enterprisePath, 'orchestrator.ts');
      integrationHealth.checks!.enterpriseOrchestrator = { status: fs.existsSync(enterpriseOrchestratorPath) ? 'healthy' : 'missing' };
    } catch (error) {
      integrationHealth.checks!.enterpriseOrchestrator = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
      integrationHealth.status = 'unhealthy';
    }

    const packageJsonPath = path.join(this.rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        integrationHealth.checks!.workspaces = { status: Array.isArray(packageJson.workspaces) ? 'healthy' : 'missing', count: packageJson.workspaces?.length || 0 };
      } catch (error) {
        integrationHealth.checks!.workspaces = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
        integrationHealth.status = 'unhealthy';
      }
    }

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredScripts = ['dev', 'build', 'test', 'setup'];
        const scripts = packageJson.scripts || {};
        const missingScripts = requiredScripts.filter(script => !scripts[script]);
        integrationHealth.checks!.scripts = { status: missingScripts.length === 0 ? 'healthy' : 'missing_scripts', missing: missingScripts };
        if (missingScripts.length > 0) integrationHealth.status = 'unhealthy';
      } catch (error) {
        integrationHealth.checks!.scripts = { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
        integrationHealth.status = 'unhealthy';
      }
    }

    this.results.components.integration = integrationHealth;
    if (integrationHealth.status !== 'healthy') this.results.overall = false;
    console.log(`✅ Integration check: ${integrationHealth.status}\n`);
  }

  generateReport(): void {
    console.log('📊 Health Check Report');
    console.log('======================\n');
    console.log(`Overall Status: ${this.results.overall ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    for (const [component, health] of Object.entries(this.results.components)) {
      console.log(`${component.toUpperCase()}:`);
      if (health.status) console.log(`  Status: ${health.status === 'healthy' ? '✅' : '❌'} ${health.status}`);
      if (health.checks) {
        for (const [check, result] of Object.entries(health.checks)) {
          const icon = result.status === 'healthy' ? '✅' : result.status === 'missing' ? '❌' : '⚠️';
          console.log(`  ${icon} ${check}: ${result.status}`);
        }
      }
      if (health.packages) {
        for (const [pkg, result] of Object.entries(health.packages)) {
          const icon = result.status === 'healthy' ? '✅' : '❌';
          console.log(`  ${icon} ${pkg}: ${result.status}`);
        }
      }
      console.log('');
    }

    console.log('📈 Summary:');
    const enterpriseHealth = this.results.components.enterprise;
    if (enterpriseHealth) console.log(`  Enterprise Packages: ${enterpriseHealth.healthyPackages}/${enterpriseHealth.totalPackages} healthy`);
    
    const totalChecks = Object.keys(this.results.components).length;
    const healthyComponents = Object.values(this.results.components).filter(comp => comp.status === 'healthy' || comp.healthy !== false).length;
    console.log(`  Components: ${healthyComponents}/${totalChecks} healthy`);
    console.log(`  System Status: ${this.results.overall ? '✅ Ready for production' : '❌ Issues detected'}`);
    process.exit(this.results.overall ? 0 : 1);
  }
}

const healthChecker = new SystemHealthChecker();
healthChecker.runHealthCheck().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});

export default SystemHealthChecker;
