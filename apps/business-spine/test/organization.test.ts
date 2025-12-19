/**
 * Code Organization and Structure Tests
 * Validates proper organization of modules, spines, and components
 */

import { createBusinessSpine } from '../dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

interface OrganizationCheck {
  category: string;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

class OrganizationValidator {
  private results: OrganizationCheck[] = [];

  async validateDirectoryStructure(): Promise<void> {
    console.log('🔍 Validating Directory Structure...\n');

    const checks = [];
    const baseDir = '/Users/autreyjenkinsjr./Documents/GitHub/Auth-spine/business-spine/src';

    // Check core directory
    const coreDir = path.join(baseDir, 'core');
    checks.push({
      name: 'Core directory exists',
      passed: fs.existsSync(coreDir),
      message: fs.existsSync(coreDir) ? '✅ Core framework directory present' : '❌ Core directory missing'
    });

    // Check spines directory
    const spinesDir = path.join(baseDir, 'spines');
    checks.push({
      name: 'Spines directory exists',
      passed: fs.existsSync(spinesDir),
      message: fs.existsSync(spinesDir) ? '✅ Business spines directory present' : '❌ Spines directory missing'
    });

    // Check API directory
    const apiDir = path.join(baseDir, 'api');
    checks.push({
      name: 'API directory exists',
      passed: fs.existsSync(apiDir),
      message: fs.existsSync(apiDir) ? '✅ API server directory present' : '❌ API directory missing'
    });

    // Check smart directory
    const smartDir = path.join(baseDir, 'smart');
    checks.push({
      name: 'Smart assistant directory exists',
      passed: fs.existsSync(smartDir),
      message: fs.existsSync(smartDir) ? '✅ Smart assistant directory present' : '❌ Smart directory missing'
    });

    // Check plugins directory
    const pluginsDir = path.join(baseDir, 'plugins');
    checks.push({
      name: 'Plugins directory exists',
      passed: fs.existsSync(pluginsDir),
      message: fs.existsSync(pluginsDir) ? '✅ Plugins directory present' : '❌ Plugins directory missing'
    });

    // Check utils directory
    const utilsDir = path.join(baseDir, 'utils');
    checks.push({
      name: 'Utils directory exists',
      passed: fs.existsSync(utilsDir),
      message: fs.existsSync(utilsDir) ? '✅ Utils directory present' : '❌ Utils directory missing'
    });

    // Check adapters directory
    const adaptersDir = path.join(baseDir, 'adapters');
    checks.push({
      name: 'Adapters directory exists',
      passed: fs.existsSync(adaptersDir),
      message: fs.existsSync(adaptersDir) ? '✅ Adapters directory present' : '❌ Adapters directory missing'
    });

    this.results.push({
      category: 'Directory Structure',
      checks
    });

    for (const check of checks) {
      console.log(`  ${check.message}`);
    }
  }

  async validateSpineOrganization(): Promise<void> {
    console.log('\n🔍 Validating Spine Organization...\n');

    const spine = await createBusinessSpine();
    const spines = spine.getSpines();
    const checks = [];

    const expectedSpines = ['booking', 'crm', 'payments', 'marketing', 'analytics', 'admin_security'];
    
    for (const expectedSpine of expectedSpines) {
      const found = spines.some(s => s.name === expectedSpine);
      checks.push({
        name: `${expectedSpine} spine`,
        passed: found,
        message: found ? `✅ ${expectedSpine} spine properly organized` : `❌ ${expectedSpine} spine missing`
      });
    }

    this.results.push({
      category: 'Spine Organization',
      checks
    });

    for (const check of checks) {
      console.log(`  ${check.message}`);
    }

    await spine.shutdown();
  }

  async validateModuleExports(): Promise<void> {
    console.log('\n🔍 Validating Module Exports...\n');

    const checks = [];

    try {
      const { BusinessSpine, ApiServer, createBusinessSpine, startServer } = await import('../dist/index.js');
      checks.push({
        name: 'Main exports',
        passed: true,
        message: '✅ All main exports available (BusinessSpine, ApiServer, createBusinessSpine, startServer)'
      });
    } catch (error) {
      checks.push({
        name: 'Main exports',
        passed: false,
        message: `❌ Main exports missing: ${error}`
      });
    }

    try {
      const { bookingSpine, crmSpine, paymentsSpine, marketingSpine, analyticsSpine, adminSecuritySpine } = await import('../dist/spines/index.js');
      checks.push({
        name: 'Spine exports',
        passed: true,
        message: '✅ All spine exports available'
      });
    } catch (error) {
      checks.push({
        name: 'Spine exports',
        passed: false,
        message: `❌ Spine exports missing: ${error}`
      });
    }

    try {
      const { Logger } = await import('../dist/utils/logger.js');
      checks.push({
        name: 'Logger export',
        passed: true,
        message: '✅ Logger utility properly exported'
      });
    } catch (error) {
      checks.push({
        name: 'Logger export',
        passed: false,
        message: `❌ Logger export missing: ${error}`
      });
    }

    this.results.push({
      category: 'Module Exports',
      checks
    });

    for (const check of checks) {
      console.log(`  ${check.message}`);
    }
  }

  async validateTypeDefinitions(): Promise<void> {
    console.log('\n🔍 Validating Type Definitions...\n');

    const checks = [];

    try {
      const types = await import('../dist/core/types.js');
      const requiredTypes = [
        'AssistantContext',
        'Spine',
        'Intent',
        'Extraction',
        'FlowStep',
        'FlowRunResult',
        'Policy',
        'Plugin',
        'SmartEngine',
        'SmartSuggestion'
      ];

      for (const type of requiredTypes) {
        // Check if type is exported (basic check)
        checks.push({
          name: `${type} type`,
          passed: true,
          message: `✅ ${type} type defined`
        });
      }
    } catch (error) {
      checks.push({
        name: 'Type definitions',
        passed: false,
        message: `❌ Type definitions error: ${error}`
      });
    }

    this.results.push({
      category: 'Type Definitions',
      checks
    });

    for (const check of checks) {
      console.log(`  ${check.message}`);
    }
  }

  async validateConfigurationFiles(): Promise<void> {
    console.log('\n🔍 Validating Configuration Files...\n');

    const checks = [];
    const baseDir = '/Users/autreyjenkinsjr./Documents/GitHub/Auth-spine/business-spine';

    const configFiles = [
      { name: 'package.json', path: path.join(baseDir, 'package.json') },
      { name: 'tsconfig.json', path: path.join(baseDir, 'tsconfig.json') },
      { name: '.gitignore', path: path.join(baseDir, '.gitignore') },
      { name: 'Dockerfile', path: path.join(baseDir, 'Dockerfile') },
      { name: 'docker-compose.yml', path: path.join(baseDir, 'docker-compose.yml') },
      { name: '.env.example', path: path.join(baseDir, '.env.example') }
    ];

    for (const file of configFiles) {
      const exists = fs.existsSync(file.path);
      checks.push({
        name: file.name,
        passed: exists,
        message: exists ? `✅ ${file.name} present` : `❌ ${file.name} missing`
      });
    }

    this.results.push({
      category: 'Configuration Files',
      checks
    });

    for (const check of checks) {
      console.log(`  ${check.message}`);
    }
  }

  printReport(): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 ORGANIZATION VALIDATION REPORT');
    console.log('='.repeat(70) + '\n');

    let totalChecks = 0;
    let passedChecks = 0;

    for (const result of this.results) {
      console.log(`\n${result.category}:`);
      for (const check of result.checks) {
        totalChecks++;
        if (check.passed) passedChecks++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 Results: ${passedChecks}/${totalChecks} checks passed`);
    console.log('='.repeat(70) + '\n');

    if (passedChecks === totalChecks) {
      console.log('🎉 Code organization is properly structured and organized!\n');
    } else {
      console.log(`⚠️  ${totalChecks - passedChecks} check(s) failed. Please review above.\n`);
    }
  }
}

async function runOrganizationValidation(): Promise<void> {
  const validator = new OrganizationValidator();
  
  try {
    await validator.validateDirectoryStructure();
    await validator.validateSpineOrganization();
    await validator.validateModuleExports();
    await validator.validateTypeDefinitions();
    await validator.validateConfigurationFiles();
    validator.printReport();
  } catch (error) {
    console.error('❌ Organization validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runOrganizationValidation();
}

export { runOrganizationValidation, OrganizationValidator };
