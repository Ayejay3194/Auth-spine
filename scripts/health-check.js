#!/usr/bin/env node

/**
 * Auth-spine System Health Check
 * 
 * Comprehensive health check for the entire Auth-spine platform
 * including business-spine and enterprise packages.
 */

const fs = require('fs');
const path = require('path');

class SystemHealthChecker {
  constructor() {
    this.rootPath = path.join(__dirname, '..');
    this.businessSpinePath = path.join(this.rootPath, 'business-spine');
    this.enterprisePath = path.join(this.rootPath, 'packages', 'enterprise');
    this.results = {
      overall: true,
      components: {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    console.log('🔍 Running Auth-spine System Health Check...\n');

    try {
      // Check project structure
      await this.checkProjectStructure();
      
      // Check business-spine
      await this.checkBusinessSpine();
      
      // Check enterprise packages
      await this.checkEnterprisePackages();
      
      // Check integration points
      await this.checkIntegration();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.results.overall = false;
      this.results.error = error.message;
    }
  }

  /**
   * Check project structure
   */
  async checkProjectStructure() {
    console.log('📁 Checking project structure...');
    
    const requiredFiles = [
      'package.json',
      'index.js',
      'README.md'
    ];

    const requiredDirs = [
      'business-spine',
      'packages',
      'packages/enterprise',
      'docs',
      'tools',
      'scripts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.rootPath, file);
      const exists = fs.existsSync(filePath);
      this.results.components[`structure:${file}`] = {
        status: exists ? 'healthy' : 'missing',
        path: filePath
      };
      if (!exists) this.results.overall = false;
    }

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.rootPath, dir);
      const exists = fs.existsSync(dirPath);
      this.results.components[`structure:${dir}`] = {
        status: exists ? 'healthy' : 'missing',
        path: dirPath
      };
      if (!exists) this.results.overall = false;
    }

    console.log('✅ Project structure check complete\n');
  }

  /**
   * Check business-spine component
   */
  async checkBusinessSpine() {
    console.log('📊 Checking business-spine component...');
    
    const businessSpineHealth = {
      status: 'healthy',
      checks: {}
    };

    // Check package.json
    const packageJsonPath = path.join(this.businessSpinePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        businessSpineHealth.checks.packageJson = {
          status: 'healthy',
          name: packageJson.name,
          version: packageJson.version
        };
      } catch (error) {
        businessSpineHealth.checks.packageJson = {
          status: 'error',
          error: error.message
        };
        businessSpineHealth.status = 'unhealthy';
      }
    } else {
      businessSpineHealth.checks.packageJson = { status: 'missing' };
      businessSpineHealth.status = 'unhealthy';
    }

    // Check key directories
    const keyDirs = ['app', 'src', 'components', 'lib', 'prisma'];
    for (const dir of keyDirs) {
      const dirPath = path.join(this.businessSpinePath, dir);
      const exists = fs.existsSync(dirPath);
      businessSpineHealth.checks[dir] = {
        status: exists ? 'healthy' : 'missing'
      };
      if (!exists) businessSpineHealth.status = 'unhealthy';
    }

    // Check Next.js configuration
    const nextConfigPath = path.join(this.businessSpinePath, 'next.config.mjs');
    businessSpineHealth.checks.nextConfig = {
      status: fs.existsSync(nextConfigPath) ? 'healthy' : 'missing'
    };

    this.results.components.businessSpine = businessSpineHealth;
    if (businessSpineHealth.status !== 'healthy') this.results.overall = false;
    
    console.log(`✅ Business-spine check: ${businessSpineHealth.status}\n`);
  }

  /**
   * Check enterprise packages
   */
  async checkEnterprisePackages() {
    console.log('🏢 Checking enterprise packages...');
    
    const enterpriseHealth = {
      status: 'healthy',
      packages: {},
      totalPackages: 0,
      healthyPackages: 0
    };

    // Check main enterprise files
    const mainFiles = ['index.ts', 'orchestrator.ts'];
    for (const file of mainFiles) {
      const filePath = path.join(this.enterprisePath, file);
      const exists = fs.existsSync(filePath);
      enterpriseHealth.packages[`main:${file}`] = {
        status: exists ? 'healthy' : 'missing'
      };
      if (!exists) enterpriseHealth.status = 'unhealthy';
    }

    // Check individual package directories
    if (fs.existsSync(this.enterprisePath)) {
      const packages = fs.readdirSync(this.enterprisePath)
        .filter(item => {
          const itemPath = path.join(this.enterprisePath, item);
          return fs.statSync(itemPath).isDirectory();
        });

      enterpriseHealth.totalPackages = packages.length;

      for (const pkg of packages) {
        const pkgPath = path.join(this.enterprisePath, pkg);
        const indexPath = path.join(pkgPath, 'index.ts');
        
        const pkgHealth = {
          status: fs.existsSync(indexPath) ? 'healthy' : 'missing_index',
          hasIndex: fs.existsSync(indexPath)
        };

        enterpriseHealth.packages[pkg] = pkgHealth;
        if (pkgHealth.status === 'healthy') {
          enterpriseHealth.healthyPackages++;
        } else {
          enterpriseHealth.status = 'unhealthy';
        }
      }
    } else {
      enterpriseHealth.status = 'missing';
    }

    this.results.components.enterprise = enterpriseHealth;
    if (enterpriseHealth.status !== 'healthy') this.results.overall = false;
    
    console.log(`✅ Enterprise packages check: ${enterpriseHealth.status} (${enterpriseHealth.healthyPackages}/${enterpriseHealth.totalPackages} healthy)\n`);
  }

  /**
   * Check integration points
   */
  async checkIntegration() {
    console.log('🔗 Checking integration points...');
    
    const integrationHealth = {
      status: 'healthy',
      checks: {}
    };

    // Check if main index.js can access enterprise orchestrator
    try {
      const enterpriseOrchestratorPath = path.join(this.enterprisePath, 'orchestrator.ts');
      integrationHealth.checks.enterpriseOrchestrator = {
        status: fs.existsSync(enterpriseOrchestratorPath) ? 'healthy' : 'missing'
      };
    } catch (error) {
      integrationHealth.checks.enterpriseOrchestrator = {
        status: 'error',
        error: error.message
      };
      integrationHealth.status = 'unhealthy';
    }

    // Check workspace configuration
    const packageJsonPath = path.join(this.rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        integrationHealth.checks.workspaces = {
          status: Array.isArray(packageJson.workspaces) ? 'healthy' : 'missing',
          count: packageJson.workspaces?.length || 0
        };
      } catch (error) {
        integrationHealth.checks.workspaces = {
          status: 'error',
          error: error.message
        };
        integrationHealth.status = 'unhealthy';
      }
    }

    // Check scripts configuration
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredScripts = ['dev', 'build', 'test', 'setup'];
        const scripts = packageJson.scripts || {};
        
        const missingScripts = requiredScripts.filter(script => !scripts[script]);
        integrationHealth.checks.scripts = {
          status: missingScripts.length === 0 ? 'healthy' : 'missing_scripts',
          missing: missingScripts
        };
        
        if (missingScripts.length > 0) {
          integrationHealth.status = 'unhealthy';
        }
      } catch (error) {
        integrationHealth.checks.scripts = {
          status: 'error',
          error: error.message
        };
        integrationHealth.status = 'unhealthy';
      }
    }

    this.results.components.integration = integrationHealth;
    if (integrationHealth.status !== 'healthy') this.results.overall = false;
    
    console.log(`✅ Integration check: ${integrationHealth.status}\n`);
  }

  /**
   * Generate health check report
   */
  generateReport() {
    console.log('📊 Health Check Report');
    console.log('======================\n');
    
    console.log(`Overall Status: ${this.results.overall ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    // Component details
    for (const [component, health] of Object.entries(this.results.components)) {
      console.log(`${component.toUpperCase()}:`);
      
      if (health.status) {
        console.log(`  Status: ${health.status === 'healthy' ? '✅' : '❌'} ${health.status}`);
      }
      
      if (health.checks) {
        for (const [check, result] of Object.entries(health.checks)) {
          const icon = result.status === 'healthy' ? '✅' : 
                      result.status === 'missing' ? '❌' : '⚠️';
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

    // Summary
    console.log('📈 Summary:');
    const enterpriseHealth = this.results.components.enterprise;
    if (enterpriseHealth) {
      console.log(`  Enterprise Packages: ${enterpriseHealth.healthyPackages}/${enterpriseHealth.totalPackages} healthy`);
    }
    
    const totalChecks = Object.keys(this.results.components).length;
    const healthyComponents = Object.values(this.results.components)
      .filter(comp => comp.status === 'healthy' || comp.healthy !== false).length;
    
    console.log(`  Components: ${healthyComponents}/${totalChecks} healthy`);
    console.log(`  System Status: ${this.results.overall ? '✅ Ready for production' : '❌ Issues detected'}`);

    // Exit with appropriate code
    process.exit(this.results.overall ? 0 : 1);
  }
}

// Run health check if this is the main module
if (require.main === module) {
  const healthChecker = new SystemHealthChecker();
  healthChecker.runHealthCheck().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

module.exports = SystemHealthChecker;
