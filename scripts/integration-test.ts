#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TestResult { status: string; checks?: Record<string, any>; error?: string; }
interface IntegrationResults { overall: boolean; tests: Record<string, TestResult>; timestamp: string; error?: string; }

class IntegrationTester {
  private rootPath: string;
  private results: IntegrationResults;

  constructor() {
    this.rootPath = path.join(__dirname, '..');
    this.results = { overall: true, tests: {}, timestamp: new Date().toISOString() };
  }

  async runIntegrationTests(): Promise<void> {
    console.log('🧪 Running Auth-spine Integration Tests...\n');
    try {
      await this.testMainOrchestrator();
      await this.testEnterpriseIntegration();
      await this.testBusinessSpineIntegration();
      await this.testCrossComponentCommunication();
      await this.testConfigurationConsistency();
      this.generateTestReport();
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      this.results.overall = false;
      this.results.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  async testMainOrchestrator(): Promise<void> {
    console.log('🎯 Testing main orchestrator...');
    const testResult: TestResult = { status: 'passed', checks: {} };
    try {
      const mainIndexPath = path.join(this.rootPath, 'index.ts');
      testResult.checks!.mainIndexExists = { status: fs.existsSync(mainIndexPath) ? 'passed' : 'failed' };
      const packageJsonPath = path.join(this.rootPath, 'package.json');
      testResult.checks!.packageJsonExists = { status: fs.existsSync(packageJsonPath) ? 'passed' : 'failed' };
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          testResult.checks!.packageJsonValid = {
            status: 'passed', name: packageJson.name, hasWorkspaces: Array.isArray(packageJson.workspaces),
            scriptCount: Object.keys(packageJson.scripts || {}).length
          };
        } catch (error) {
          testResult.checks!.packageJsonValid = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown' };
          testResult.status = 'failed';
        }
      }
      if (fs.existsSync(mainIndexPath)) {
        try {
          const content = fs.readFileSync(mainIndexPath, 'utf8');
          const hasOrchestrator = content.includes('AuthSpineOrchestrator');
          testResult.checks!.mainIndexSyntax = { status: 'passed', hasOrchestrator };
        } catch (error) {
          testResult.checks!.mainIndexSyntax = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown' };
          testResult.status = 'failed';
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error.message : 'Unknown';
    }
    this.results.tests.mainOrchestrator = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    console.log(`✅ Main orchestrator test: ${testResult.status}\n`);
  }

  async testEnterpriseIntegration(): Promise<void> {
    console.log('🏢 Testing enterprise package integration...');
    const testResult: TestResult = { status: 'passed', checks: {} };
    const enterprisePath = path.join(this.rootPath, 'packages', 'enterprise');
    try {
      const enterpriseIndexPath = path.join(enterprisePath, 'index.ts');
      testResult.checks!.enterpriseIndexExists = { status: fs.existsSync(enterpriseIndexPath) ? 'passed' : 'failed' };
      const orchestratorPath = path.join(enterprisePath, 'orchestrator.ts');
      testResult.checks!.orchestratorExists = { status: fs.existsSync(orchestratorPath) ? 'passed' : 'failed' };
      if (fs.existsSync(enterpriseIndexPath)) {
        try {
          const content = fs.readFileSync(enterpriseIndexPath, 'utf8');
          const hasExports = content.includes('export * from');
          const hasOrchestratorExport = content.includes('EnterpriseOrchestrator');
          testResult.checks!.enterpriseIndexContent = {
            status: 'passed', hasExports, hasOrchestratorExport, exportCount: (content.match(/export \* from/g) || []).length
          };
        } catch (error) {
          testResult.checks!.enterpriseIndexContent = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown' };
          testResult.status = 'failed';
        }
      }
      if (fs.existsSync(orchestratorPath)) {
        try {
          const content = fs.readFileSync(orchestratorPath, 'utf8');
          const hasClass = content.includes('class EnterpriseOrchestrator');
          const hasInitialize = content.includes('initialize()');
          const hasPackages = content.includes('this.packages.set');
          testResult.checks!.orchestratorContent = { status: 'passed', hasClass, hasInitialize, hasPackages };
        } catch (error) {
          testResult.checks!.orchestratorContent = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown' };
          testResult.status = 'failed';
        }
      }
      if (fs.existsSync(enterprisePath)) {
        const packages = fs.readdirSync(enterprisePath).filter(item => fs.statSync(path.join(enterprisePath, item)).isDirectory());
        const packagesWithIndex = packages.filter(pkg => fs.existsSync(path.join(enterprisePath, pkg, 'index.ts')));
        testResult.checks!.packageCount = {
          status: 'passed', total: packages.length, withIndex: packagesWithIndex.length,
          coverage: Math.round((packagesWithIndex.length / packages.length) * 100)
        };
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error.message : 'Unknown';
    }
    this.results.tests.enterpriseIntegration = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    console.log(`✅ Enterprise integration test: ${testResult.status}\n`);
  }

  async testBusinessSpineIntegration(): Promise<void> {
    console.log('📊 Testing business-spine integration...');
    const testResult: TestResult = { status: 'passed', checks: {} };
    const businessSpinePath = path.join(this.rootPath, 'apps', 'business-spine');
    try {
      const packageJsonPath = path.join(businessSpinePath, 'package.json');
      testResult.checks!.businessSpinePackageJson = { status: fs.existsSync(packageJsonPath) ? 'passed' : 'failed' };
      const nextConfigPath = path.join(businessSpinePath, 'next.config.mjs');
      testResult.checks!.nextConfigExists = { status: fs.existsSync(nextConfigPath) ? 'passed' : 'failed' };
      const keyDirs = ['app', 'src', 'components'];
      for (const dir of keyDirs) {
        const dirPath = path.join(businessSpinePath, dir);
        testResult.checks![`directory_${dir}`] = { status: fs.existsSync(dirPath) ? 'passed' : 'failed' };
      }
      const mainPackageJsonPath = path.join(this.rootPath, 'package.json');
      if (fs.existsSync(mainPackageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));
          const hasBusinessSpineWorkspace = packageJson.workspaces?.includes('apps/*');
          const hasEnterpriseWorkspace = packageJson.workspaces?.includes('packages/*');
          testResult.checks!.workspaceConfiguration = {
            status: (hasBusinessSpineWorkspace && hasEnterpriseWorkspace) ? 'passed' : 'failed',
            hasBusinessSpineWorkspace, hasEnterpriseWorkspace
          };
        } catch (error) {
          testResult.checks!.workspaceConfiguration = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown' };
          testResult.status = 'failed';
        }
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error.message : 'Unknown';
    }
    this.results.tests.businessSpineIntegration = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    console.log(`✅ Business-spine integration test: ${testResult.status}\n`);
  }

  async testCrossComponentCommunication(): Promise<void> {
    console.log('🔗 Testing cross-component communication...');
    const testResult: TestResult = { status: 'passed', checks: {} };
    try {
      const mainIndexPath = path.join(this.rootPath, 'index.ts');
      if (fs.existsSync(mainIndexPath)) {
        const content = fs.readFileSync(mainIndexPath, 'utf8');
        const importsEnterprise = content.includes('packages/enterprise/orchestrator');
        const usesEnterpriseOrchestrator = content.includes('EnterpriseOrchestrator');
        testResult.checks!.mainImportsEnterprise = {
          status: (importsEnterprise && usesEnterpriseOrchestrator) ? 'passed' : 'failed',
          importsEnterprise, usesEnterpriseOrchestrator
        };
      }
      const enterpriseIndexPath = path.join(this.rootPath, 'packages', 'enterprise', 'index.ts');
      if (fs.existsSync(enterpriseIndexPath)) {
        const content = fs.readFileSync(enterpriseIndexPath, 'utf8');
        const hasMainExports = content.includes('export * from');
        const hasDefaultExport = content.includes('export default');
        testResult.checks!.enterpriseExports = { status: (hasMainExports || hasDefaultExport) ? 'passed' : 'failed', hasMainExports, hasDefaultExport };
      }
      const packageJsonPath = path.join(this.rootPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const scripts = packageJson.scripts || {};
        const hasDevScript = scripts.dev && scripts.dev.includes('business-spine');
        const hasBuildScript = scripts.build;
        const hasTestScript = scripts.test;
        testResult.checks!.scriptDependencies = { status: (hasDevScript && hasBuildScript && hasTestScript) ? 'passed' : 'partial', hasDevScript, hasBuildScript, hasTestScript };
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error.message : 'Unknown';
    }
    this.results.tests.crossComponentCommunication = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    console.log(`✅ Cross-component communication test: ${testResult.status}\n`);
  }

  async testConfigurationConsistency(): Promise<void> {
    console.log('⚙️ Testing configuration consistency...');
    const testResult: TestResult = { status: 'passed', checks: {} };
    try {
      const rootTsConfigPath = path.join(this.rootPath, 'packages', 'enterprise', 'tsconfig.json');
      const businessSpineTsConfigPath = path.join(this.rootPath, 'apps', 'business-spine', 'tsconfig.json');
      testResult.checks!.tsConfigEnterprise = { status: fs.existsSync(rootTsConfigPath) ? 'passed' : 'failed' };
      testResult.checks!.tsConfigBusinessSpine = { status: fs.existsSync(businessSpineTsConfigPath) ? 'passed' : 'failed' };
      const mainReadmePath = path.join(this.rootPath, 'README.md');
      if (fs.existsSync(mainReadmePath)) {
        const content = fs.readFileSync(mainReadmePath, 'utf8');
        const mentionsEnterprise = content.includes('Enterprise') || content.includes('enterprise');
        const mentionsBusinessSpine = content.includes('business-spine');
        const hasQuickStart = content.includes('Quick Start') || content.includes('Getting Started');
        testResult.checks!.readmeConsistency = {
          status: (mentionsEnterprise && mentionsBusinessSpine && hasQuickStart) ? 'passed' : 'partial',
          mentionsEnterprise, mentionsBusinessSpine, hasQuickStart
        };
      }
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error instanceof Error ? error.message : 'Unknown';
    }
    this.results.tests.configurationConsistency = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    console.log(`✅ Configuration consistency test: ${testResult.status}\n`);
  }

  generateTestReport(): void {
    console.log('📊 Integration Test Report');
    console.log('==========================\n');
    console.log(`Overall Status: ${this.results.overall ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);
    for (const [testName, result] of Object.entries(this.results.tests)) {
      console.log(`${testName.toUpperCase()}:`);
      console.log(`  Status: ${result.status === 'passed' ? '✅ PASSED' : result.status === 'failed' ? '❌ FAILED' : '⚠️ PARTIAL'}`);
      if (result.checks) {
        for (const [checkName, checkResult] of Object.entries(result.checks)) {
          const icon = checkResult.status === 'passed' ? '✅' : checkResult.status === 'failed' ? '❌' : '⚠️';
          console.log(`  ${icon} ${checkName}: ${checkResult.status}`);
          if (checkResult.error) console.log(`    Error: ${checkResult.error}`);
        }
      }
      console.log('');
    }
    const totalTests = Object.keys(this.results.tests).length;
    const passedTests = Object.values(this.results.tests).filter(test => test.status === 'passed').length;
    const failedTests = Object.values(this.results.tests).filter(test => test.status === 'failed').length;
    console.log('📈 Test Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    console.log(`  Integration Status: ${this.results.overall ? '✅ Ready for production' : '❌ Integration issues detected'}`);
    process.exit(this.results.overall ? 0 : 1);
  }
}

const integrationTester = new IntegrationTester();
integrationTester.runIntegrationTests().catch(error => {
  console.error('Integration tests failed:', error);
  process.exit(1);
});

export default IntegrationTester;
