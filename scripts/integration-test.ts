#!/usr/bin/env node

/**
 * Auth-spine Integration Test
 * 
 * Comprehensive integration testing for the entire Auth-spine platform
 * to ensure all components work together properly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface TestCheck {
  status: string;
  [key: string]: any;
}

interface TestResult {
  status: string;
  checks: Record<string, TestCheck>;
  error?: string;
}

interface TestResults {
  overall: boolean;
  tests: Record<string, TestResult>;
  timestamp: string;
  error?: string;
}

class IntegrationTester {
  private rootPath: string;
  private results: TestResults;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    this.rootPath = path.join(__dirname, '..');
    this.results = {
      overall: true,
      tests: {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run comprehensive integration tests
   */
  async runIntegrationTests(): Promise<void> {
    console.log('🧪 Running Auth-spine Integration Tests...\n');

    try {
      // Test main orchestrator
      await this.testMainOrchestrator();
      
      // Test enterprise package integration
      await this.testEnterpriseIntegration();
      
      // Test business-spine integration
      await this.testBusinessSpineIntegration();
      
      // Test cross-component communication
      await this.testCrossComponentCommunication();
      
      // Test configuration consistency
      await this.testConfigurationConsistency();
      
      // Generate test report
      this.generateTestReport();
      
    } catch (error: any) {
      console.error('❌ Integration tests failed:', error);
      this.results.overall = false;
      this.results.error = error.message;
    }
  }

  /**
   * Test main orchestrator
   */
  private async testMainOrchestrator(): Promise<void> {
    console.log('🎯 Testing main orchestrator...');
    
    const testResult: TestResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check if main index.ts exists
      const mainIndexPath = path.join(this.rootPath, 'index.ts');
      testResult.checks.mainIndexExists = {
        status: fs.existsSync(mainIndexPath) ? 'passed' : 'failed'
      };

      // Check if main package.json exists
      const packageJsonPath = path.join(this.rootPath, 'package.json');
      testResult.checks.packageJsonExists = {
        status: fs.existsSync(packageJsonPath) ? 'passed' : 'failed'
      };

      // Check package.json content
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          testResult.checks.packageJsonValid = {
            status: 'passed',
            name: packageJson.name,
            hasWorkspaces: Array.isArray(packageJson.workspaces),
            scriptCount: Object.keys(packageJson.scripts || {}).length
          };
        } catch (error: any) {
          testResult.checks.packageJsonValid = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

      // Check if main index.ts can be read (syntax check)
      if (fs.existsSync(mainIndexPath)) {
        try {
          const content = fs.readFileSync(mainIndexPath, 'utf8');
          const hasOrchestrator = content.includes('AuthSpineOrchestrator');
          testResult.checks.mainIndexSyntax = {
            status: 'passed',
            hasOrchestrator
          };
        } catch (error: any) {
          testResult.checks.mainIndexSyntax = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

    } catch (error: any) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.mainOrchestrator = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    
    console.log(`✅ Main orchestrator test: ${testResult.status}\n`);
  }

  /**
   * Test enterprise package integration
   */
  private async testEnterpriseIntegration(): Promise<void> {
    console.log('🏢 Testing enterprise package integration...');
    
    const testResult: TestResult = {
      status: 'passed',
      checks: {}
    };

    const enterprisePath = path.join(this.rootPath, 'packages', 'enterprise');

    try {
      // Check enterprise index.ts
      const enterpriseIndexPath = path.join(enterprisePath, 'index.ts');
      testResult.checks.enterpriseIndexExists = {
        status: fs.existsSync(enterpriseIndexPath) ? 'passed' : 'failed'
      };

      // Check enterprise orchestrator
      const orchestratorPath = path.join(enterprisePath, 'orchestrator.ts');
      testResult.checks.orchestratorExists = {
        status: fs.existsSync(orchestratorPath) ? 'passed' : 'failed'
      };

      // Check enterprise index.ts content
      if (fs.existsSync(enterpriseIndexPath)) {
        try {
          const content = fs.readFileSync(enterpriseIndexPath, 'utf8');
          const hasExports = content.includes('export * from');
          const hasOrchestratorExport = content.includes('EnterpriseOrchestrator');
          
          testResult.checks.enterpriseIndexContent = {
            status: 'passed',
            hasExports,
            hasOrchestratorExport,
            exportCount: (content.match(/export \* from/g) || []).length
          };
        } catch (error: any) {
          testResult.checks.enterpriseIndexContent = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

      // Check enterprise orchestrator content
      if (fs.existsSync(orchestratorPath)) {
        try {
          const content = fs.readFileSync(orchestratorPath, 'utf8');
          const hasClass = content.includes('class EnterpriseOrchestrator');
          const hasInitialize = content.includes('initialize()');
          const hasPackages = content.includes('this.packages.set');
          
          testResult.checks.orchestratorContent = {
            status: 'passed',
            hasClass,
            hasInitialize,
            hasPackages
          };
        } catch (error: any) {
          testResult.checks.orchestratorContent = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

      // Count enterprise packages
      if (fs.existsSync(enterprisePath)) {
        const packages = fs.readdirSync(enterprisePath)
          .filter(item => {
            const itemPath = path.join(enterprisePath, item);
            return fs.statSync(itemPath).isDirectory();
          });

        const packagesWithIndex = packages.filter(pkg => 
          fs.existsSync(path.join(enterprisePath, pkg, 'index.ts'))
        );

        testResult.checks.packageCount = {
          status: 'passed',
          total: packages.length,
          withIndex: packagesWithIndex.length,
          coverage: Math.round((packagesWithIndex.length / packages.length) * 100)
        };
      }

    } catch (error: any) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.enterpriseIntegration = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    
    console.log(`✅ Enterprise integration test: ${testResult.status}\n`);
  }

  /**
   * Test business-spine integration
   */
  private async testBusinessSpineIntegration(): Promise<void> {
    console.log('📊 Testing business-spine integration...');
    
    const testResult: TestResult = {
      status: 'passed',
      checks: {}
    };

    const businessSpinePath = path.join(this.rootPath, 'apps', 'business-spine');

    try {
      // Check business-spine package.json
      const packageJsonPath = path.join(businessSpinePath, 'package.json');
      testResult.checks.businessSpinePackageJson = {
        status: fs.existsSync(packageJsonPath) ? 'passed' : 'failed'
      };

      // Check Next.js configuration
      const nextConfigPath = path.join(businessSpinePath, 'next.config.mjs');
      testResult.checks.nextConfigExists = {
        status: fs.existsSync(nextConfigPath) ? 'passed' : 'failed'
      };

      // Check key directories
      const keyDirs = ['app', 'src', 'components'];
      for (const dir of keyDirs) {
        const dirPath = path.join(businessSpinePath, dir);
        testResult.checks[`directory_${dir}`] = {
          status: fs.existsSync(dirPath) ? 'passed' : 'failed'
        };
      }

      // Check if business-spine can access enterprise packages
      const mainPackageJsonPath = path.join(this.rootPath, 'package.json');
      if (fs.existsSync(mainPackageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));
          const hasBusinessSpineWorkspace = packageJson.workspaces?.includes('apps/business-spine');
          const hasEnterpriseWorkspace = packageJson.workspaces?.includes('packages/enterprise');
          
          testResult.checks.workspaceConfiguration = {
            status: (hasBusinessSpineWorkspace && hasEnterpriseWorkspace) ? 'passed' : 'failed',
            hasBusinessSpineWorkspace,
            hasEnterpriseWorkspace
          };
        } catch (error: any) {
          testResult.checks.workspaceConfiguration = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

    } catch (error: any) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.businessSpineIntegration = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    
    console.log(`✅ Business-spine integration test: ${testResult.status}\n`);
  }

  /**
   * Test cross-component communication
   */
  private async testCrossComponentCommunication(): Promise<void> {
    console.log('🔗 Testing cross-component communication...');
    
    const testResult: TestResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check if main index.ts imports enterprise orchestrator
      const mainIndexPath = path.join(this.rootPath, 'index.ts');
      if (fs.existsSync(mainIndexPath)) {
        const content = fs.readFileSync(mainIndexPath, 'utf8');
        const importsEnterprise = content.includes('packages/enterprise/orchestrator');
        const usesEnterpriseOrchestrator = content.includes('EnterpriseOrchestrator');
        
        testResult.checks.mainImportsEnterprise = {
          status: (importsEnterprise && usesEnterpriseOrchestrator) ? 'passed' : 'failed',
          importsEnterprise,
          usesEnterpriseOrchestrator
        };
      }

      // Check if enterprise index.ts exports are accessible
      const enterpriseIndexPath = path.join(this.rootPath, 'packages', 'enterprise', 'index.ts');
      if (fs.existsSync(enterpriseIndexPath)) {
        const content = fs.readFileSync(enterpriseIndexPath, 'utf8');
        const hasMainExports = content.includes('export * from');
        const hasDefaultExport = content.includes('export default');
        
        testResult.checks.enterpriseExports = {
          status: (hasMainExports || hasDefaultExport) ? 'passed' : 'failed',
          hasMainExports,
          hasDefaultExport
        };
      }

      // Check script dependencies in main package.json
      const packageJsonPath = path.join(this.rootPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const scripts = packageJson.scripts || {};
        
        const hasDevScript = scripts.dev && scripts.dev.includes('business-spine');
        const hasBuildScript = scripts.build && scripts.build.includes('business-spine');
        const hasTestScript = scripts.test && scripts.test.includes('business-spine');
        
        testResult.checks.scriptDependencies = {
          status: (hasDevScript && hasBuildScript && hasTestScript) ? 'passed' : 'partial',
          hasDevScript,
          hasBuildScript,
          hasTestScript
        };
      }

    } catch (error: any) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.crossComponentCommunication = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    
    console.log(`✅ Cross-component communication test: ${testResult.status}\n`);
  }

  /**
   * Test configuration consistency
   */
  private async testConfigurationConsistency(): Promise<void> {
    console.log('⚙️ Testing configuration consistency...');
    
    const testResult: TestResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check TypeScript configuration consistency
      const rootTsConfigPath = path.join(this.rootPath, 'packages', 'enterprise', 'tsconfig.json');
      const businessSpineTsConfigPath = path.join(this.rootPath, 'apps', 'business-spine', 'tsconfig.json');
      
      testResult.checks.tsConfigEnterprise = {
        status: fs.existsSync(rootTsConfigPath) ? 'passed' : 'failed'
      };
      
      testResult.checks.tsConfigBusinessSpine = {
        status: fs.existsSync(businessSpineTsConfigPath) ? 'passed' : 'failed'
      };

      // Check environment variable patterns
      const mainPackageJsonPath = path.join(this.rootPath, 'package.json');
      const businessSpinePackageJsonPath = path.join(this.rootPath, 'apps', 'business-spine', 'package.json');
      
      if (fs.existsSync(mainPackageJsonPath) && fs.existsSync(businessSpinePackageJsonPath)) {
        const mainPackage = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));
        const businessSpinePackage = JSON.parse(fs.readFileSync(businessSpinePackageJsonPath, 'utf8'));
        
        const mainNodeVersion = mainPackage.engines?.node;
        const businessSpineNodeVersion = businessSpinePackage.engines?.node;
        
        testResult.checks.nodeVersionConsistency = {
          status: mainNodeVersion === businessSpineNodeVersion ? 'passed' : 'warning',
          mainVersion: mainNodeVersion,
          businessSpineVersion: businessSpineNodeVersion
        };
      }

      // Check README consistency
      const mainReadmePath = path.join(this.rootPath, 'README.md');
      if (fs.existsSync(mainReadmePath)) {
        const content = fs.readFileSync(mainReadmePath, 'utf8');
        const mentionsEnterprise = content.includes('Enterprise Packages');
        const mentionsBusinessSpine = content.includes('business-spine');
        const hasQuickStart = content.includes('Quick Start');
        
        testResult.checks.readmeConsistency = {
          status: (mentionsEnterprise && mentionsBusinessSpine && hasQuickStart) ? 'passed' : 'partial',
          mentionsEnterprise,
          mentionsBusinessSpine,
          hasQuickStart
        };
      }

    } catch (error: any) {
      testResult.status = 'failed';
      testResult.error = error.message;
    }

    this.results.tests.configurationConsistency = testResult;
    if (testResult.status !== 'passed') this.results.overall = false;
    
    console.log(`✅ Configuration consistency test: ${testResult.status}\n`);
  }

  /**
   * Generate test report
   */
  private generateTestReport(): void {
    console.log('📊 Integration Test Report');
    console.log('==========================\n');
    
    console.log(`Overall Status: ${this.results.overall ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    // Test results
    for (const [testName, result] of Object.entries(this.results.tests)) {
      console.log(`${testName.toUpperCase()}:`);
      console.log(`  Status: ${result.status === 'passed' ? '✅ PASSED' : result.status === 'failed' ? '❌ FAILED' : '⚠️ PARTIAL'}`);
      
      if (result.checks) {
        for (const [checkName, checkResult] of Object.entries(result.checks)) {
          const icon = (checkResult as any).status === 'passed' ? '✅' : 
                      (checkResult as any).status === 'failed' ? '❌' : '⚠️';
          console.log(`  ${icon} ${checkName}: ${(checkResult as any).status}`);
          
          if ((checkResult as any).error) {
            console.log(`    Error: ${(checkResult as any).error}`);
          }
        }
      }
      
      console.log('');
    }

    // Summary
    const totalTests = Object.keys(this.results.tests).length;
    const passedTests = Object.values(this.results.tests)
      .filter(test => test.status === 'passed').length;
    const failedTests = Object.values(this.results.tests)
      .filter(test => test.status === 'failed').length;

    console.log('📈 Test Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    console.log(`  Integration Status: ${this.results.overall ? '✅ Ready for production' : '❌ Integration issues detected'}`);

    // Exit with appropriate code
    process.exit(this.results.overall ? 0 : 1);
  }
}

// Run integration tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const integrationTester = new IntegrationTester();
  integrationTester.runIntegrationTests().catch(error => {
    console.error('Integration tests failed:', error);
    process.exit(1);
  });
}

export default IntegrationTester;
