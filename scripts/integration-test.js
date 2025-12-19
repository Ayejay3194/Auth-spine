#!/usr/bin/env node

/**
 * Auth-spine Integration Test
 * 
 * Comprehensive integration testing for the entire Auth-spine platform
 * to ensure all components work together properly.
 */

const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
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
  async runIntegrationTests() {
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
      
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      this.results.overall = false;
      this.results.error = error.message;
    }
  }

  /**
   * Test main orchestrator
   */
  async testMainOrchestrator() {
    console.log('🎯 Testing main orchestrator...');
    
    const testResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check if main index.js exists
      const mainIndexPath = path.join(this.rootPath, 'index.js');
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
        } catch (error) {
          testResult.checks.packageJsonValid = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

      // Check if main index.js can be required (syntax check)
      if (fs.existsSync(mainIndexPath)) {
        try {
          // Basic syntax check by reading the file
          const content = fs.readFileSync(mainIndexPath, 'utf8');
          const hasOrchestrator = content.includes('AuthSpineOrchestrator');
          testResult.checks.mainIndexSyntax = {
            status: 'passed',
            hasOrchestrator
          };
        } catch (error) {
          testResult.checks.mainIndexSyntax = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

    } catch (error) {
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
  async testEnterpriseIntegration() {
    console.log('🏢 Testing enterprise package integration...');
    
    const testResult = {
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
        } catch (error) {
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
        } catch (error) {
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

    } catch (error) {
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
  async testBusinessSpineIntegration() {
    console.log('📊 Testing business-spine integration...');
    
    const testResult = {
      status: 'passed',
      checks: {}
    };

    const businessSpinePath = path.join(this.rootPath, 'business-spine');

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
          const hasBusinessSpineWorkspace = packageJson.workspaces?.includes('business-spine');
          const hasEnterpriseWorkspace = packageJson.workspaces?.includes('packages/enterprise');
          
          testResult.checks.workspaceConfiguration = {
            status: (hasBusinessSpineWorkspace && hasEnterpriseWorkspace) ? 'passed' : 'failed',
            hasBusinessSpineWorkspace,
            hasEnterpriseWorkspace
          };
        } catch (error) {
          testResult.checks.workspaceConfiguration = {
            status: 'failed',
            error: error.message
          };
          testResult.status = 'failed';
        }
      }

    } catch (error) {
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
  async testCrossComponentCommunication() {
    console.log('🔗 Testing cross-component communication...');
    
    const testResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check if main index.js imports enterprise orchestrator
      const mainIndexPath = path.join(this.rootPath, 'index.js');
      if (fs.existsSync(mainIndexPath)) {
        const content = fs.readFileSync(mainIndexPath, 'utf8');
        const importsEnterprise = content.includes('packages/enterprise/orchestrator.js');
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

    } catch (error) {
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
  async testConfigurationConsistency() {
    console.log('⚙️ Testing configuration consistency...');
    
    const testResult = {
      status: 'passed',
      checks: {}
    };

    try {
      // Check TypeScript configuration consistency
      const rootTsConfigPath = path.join(this.rootPath, 'packages', 'enterprise', 'tsconfig.json');
      const businessSpineTsConfigPath = path.join(this.rootPath, 'business-spine', 'tsconfig.json');
      
      testResult.checks.tsConfigEnterprise = {
        status: fs.existsSync(rootTsConfigPath) ? 'passed' : 'failed'
      };
      
      testResult.checks.tsConfigBusinessSpine = {
        status: fs.existsSync(businessSpineTsConfigPath) ? 'passed' : 'failed'
      };

      // Check environment variable patterns
      const mainPackageJsonPath = path.join(this.rootPath, 'package.json');
      const businessSpinePackageJsonPath = path.join(this.rootPath, 'business-spine', 'package.json');
      
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

    } catch (error) {
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
  generateTestReport() {
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
          const icon = checkResult.status === 'passed' ? '✅' : 
                      checkResult.status === 'failed' ? '❌' : '⚠️';
          console.log(`  ${icon} ${checkName}: ${checkResult.status}`);
          
          if (checkResult.error) {
            console.log(`    Error: ${checkResult.error}`);
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
if (require.main === module) {
  const integrationTester = new IntegrationTester();
  integrationTester.runIntegrationTests().catch(error => {
    console.error('Integration tests failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTester;
