/**
 * Auth-spine - Complete Enterprise Authentication and Authorization Platform
 * 
 * Main entry point for the entire Auth-spine system.
 * This file orchestrates the business-spine and enterprise packages.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class AuthSpineOrchestrator {
  constructor() {
    this.businessSpinePath = path.join(__dirname, 'business-spine');
    this.enterprisePath = path.join(__dirname, 'packages', 'enterprise');
    this.initialized = false;
  }

  /**
   * Initialize the entire Auth-spine system
   */
  async initialize() {
    if (this.initialized) {
      console.log('🚀 Auth-spine already initialized');
      return;
    }

    console.log('🚀 Initializing Auth-spine Complete Enterprise Platform...');
    
    try {
      // Verify all components exist
      this.verifyComponents();
      
      // Initialize enterprise packages
      await this.initializeEnterprise();
      
      // Initialize business-spine
      await this.initializeBusinessSpine();
      
      this.initialized = true;
      console.log('✅ Auth-spine platform successfully initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Auth-spine platform:', error);
      throw error;
    }
  }

  /**
   * Verify all required components exist
   */
  verifyComponents() {
    const components = [
      { name: 'business-spine', path: this.businessSpinePath },
      { name: 'enterprise packages', path: this.enterprisePath }
    ];

    for (const component of components) {
      if (!fs.existsSync(component.path)) {
        throw new Error(`Missing component: ${component.name} at ${component.path}`);
      }
    }

    console.log('✅ All required components verified');
  }

  /**
   * Initialize enterprise packages
   */
  async initializeEnterprise() {
    console.log('🔧 Initializing enterprise packages...');
    
    try {
      // Import and initialize enterprise orchestrator
      const { EnterpriseOrchestrator } = require(path.join(this.enterprisePath, 'orchestrator.js'));
      this.enterpriseOrchestrator = new EnterpriseOrchestrator();
      
      await this.enterpriseOrchestrator.initialize();
      console.log('✅ Enterprise packages initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize enterprise packages:', error);
      throw error;
    }
  }

  /**
   * Initialize business-spine
   */
  async initializeBusinessSpine() {
    console.log('🔧 Initializing business-spine...');
    
    try {
      // Check if business-spine has its own initialization
      const businessSpineIndex = path.join(this.businessSpinePath, 'package.json');
      
      if (fs.existsSync(businessSpineIndex)) {
        console.log('✅ Business-spine package found');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize business-spine:', error);
      throw error;
    }
  }

  /**
   * Get health status of all components
   */
  async getHealthStatus() {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const healthStatus = {
      overall: true,
      components: {
        enterprise: null,
        businessSpine: null
      }
    };

    try {
      // Get enterprise health
      if (this.enterpriseOrchestrator) {
        healthStatus.components.enterprise = await this.enterpriseOrchestrator.getHealthStatus();
      }

      // Check business-spine health
      healthStatus.components.businessSpine = {
        healthy: fs.existsSync(this.businessSpinePath),
        message: fs.existsSync(this.businessSpinePath) ? 'Business-spine directory exists' : 'Business-spine directory missing'
      };

      // Determine overall health
      healthStatus.overall = Object.values(healthStatus.components).every(
        component => component === null || component.healthy !== false
      );

    } catch (error) {
      console.error('❌ Failed to get health status:', error);
      healthStatus.overall = false;
    }

    return healthStatus;
  }

  /**
   * Get metrics from all components
   */
  async getMetrics() {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const metrics = {
      enterprise: null,
      businessSpine: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Get enterprise metrics
      if (this.enterpriseOrchestrator) {
        metrics.enterprise = await this.enterpriseOrchestrator.getMetrics();
      }

      // Get business-spine metrics
      metrics.businessSpine = {
        status: 'active',
        path: this.businessSpinePath,
        components: this.countBusinessSpineComponents()
      };

    } catch (error) {
      console.error('❌ Failed to get metrics:', error);
    }

    return metrics;
  }

  /**
   * Count business-spine components
   */
  countBusinessSpineComponents() {
    try {
      const components = {
        directories: 0,
        files: 0
      };

      const countItems = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            components.directories++;
            countItems(fullPath);
          } else {
            components.files++;
          }
        }
      };

      countItems(this.businessSpinePath);
      return components;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Generate comprehensive system report
   */
  async generateSystemReport() {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const health = await this.getHealthStatus();
    const metrics = await this.getMetrics();

    return {
      summary: {
        platform: 'Auth-spine',
        version: '1.0.0',
        initialized: this.initialized,
        overallHealth: health.overall,
        timestamp: new Date().toISOString()
      },
      health,
      metrics,
      components: {
        enterprise: {
          path: this.enterprisePath,
          status: 'integrated'
        },
        businessSpine: {
          path: this.businessSpinePath,
          status: 'integrated'
        }
      }
    };
  }

  /**
   * Cleanup all components
   */
  async cleanup() {
    if (!this.initialized) {
      return;
    }

    try {
      console.log('🧹 Cleaning up Auth-spine platform...');

      // Cleanup enterprise orchestrator
      if (this.enterpriseOrchestrator) {
        await this.enterpriseOrchestrator.cleanup();
      }

      this.initialized = false;
      console.log('✅ Auth-spine platform cleaned up');

    } catch (error) {
      console.error('❌ Failed to cleanup Auth-spine platform:', error);
    }
  }
}

// Export the main orchestrator
module.exports = { AuthSpineOrchestrator };

// Create and export default instance
const authSpineOrchestrator = new AuthSpineOrchestrator();
module.exports.default = authSpineOrchestrator;

// Auto-initialize if this is the main module
if (require.main === module) {
  (async () => {
    try {
      await authSpineOrchestrator.initialize();
      
      // Generate and display system report
      const report = await authSpineOrchestrator.generateSystemReport();
      console.log('\n📊 Auth-spine System Report:');
      console.log(JSON.stringify(report, null, 2));
      
    } catch (error) {
      console.error('❌ Failed to start Auth-spine platform:', error);
      process.exit(1);
    }
  })();
}
