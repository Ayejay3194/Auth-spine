/**
 * Auth-spine - Complete Enterprise Authentication and Authorization Platform
 * 
 * Main entry point for the entire Auth-spine system.
 * This file orchestrates the business-spine and enterprise packages.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

interface HealthStatus {
  healthy: boolean;
  message: string;
}

interface ComponentHealth {
  overall: boolean;
  components: {
    enterprise: HealthStatus | null;
    businessSpine: HealthStatus;
  };
}

interface ComponentMetrics {
  directories: number;
  files: number;
  error?: string;
}

interface Metrics {
  enterprise: any;
  businessSpine: {
    status: string;
    path: string;
    components: ComponentMetrics;
  };
  timestamp: string;
}

interface SystemReport {
  summary: {
    platform: string;
    version: string;
    initialized: boolean;
    overallHealth: boolean;
    timestamp: string;
  };
  health: ComponentHealth;
  metrics: Metrics;
  components: {
    enterprise: {
      path: string;
      status: string;
    };
    businessSpine: {
      path: string;
      status: string;
    };
  };
}

class AuthSpineOrchestrator {
  private businessSpinePath: string;
  private enterprisePath: string;
  private initialized: boolean = false;
  private enterpriseOrchestrator: any;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    this.businessSpinePath = path.join(__dirname, 'apps', 'business-spine');
    this.enterprisePath = path.join(__dirname, 'packages', 'enterprise');
  }

  /**
   * Initialize the entire Auth-spine system
   */
  async initialize(): Promise<void> {
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
  private verifyComponents(): void {
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
  private async initializeEnterprise(): Promise<void> {
    console.log('🔧 Initializing enterprise packages...');
    
    try {
      // Import and initialize enterprise orchestrator
      const orchestratorPath = path.join(this.enterprisePath, 'orchestrator.ts');
      
      if (fs.existsSync(orchestratorPath)) {
        const { EnterpriseOrchestrator } = await import(orchestratorPath);
        this.enterpriseOrchestrator = new EnterpriseOrchestrator();
        
        await this.enterpriseOrchestrator.initialize();
        console.log('✅ Enterprise packages initialized');
      } else {
        console.log('⚠️ Enterprise orchestrator not found');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize enterprise packages:', error);
      throw error;
    }
  }

  /**
   * Initialize business-spine
   */
  private async initializeBusinessSpine(): Promise<void> {
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
  async getHealthStatus(): Promise<ComponentHealth> {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const healthStatus: ComponentHealth = {
      overall: true,
      components: {
        enterprise: null,
        businessSpine: {
          healthy: fs.existsSync(this.businessSpinePath),
          message: fs.existsSync(this.businessSpinePath) ? 'Business-spine directory exists' : 'Business-spine directory missing'
        }
      }
    };

    try {
      // Get enterprise health
      if (this.enterpriseOrchestrator) {
        healthStatus.components.enterprise = await this.enterpriseOrchestrator.getHealthStatus();
      }

      // Determine overall health
      healthStatus.overall = Object.values(healthStatus.components).every(
        (component: any) => component === null || component.healthy !== false
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
  async getMetrics(): Promise<Metrics> {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const metrics: Metrics = {
      enterprise: null,
      businessSpine: {
        status: 'active',
        path: this.businessSpinePath,
        components: this.countBusinessSpineComponents()
      },
      timestamp: new Date().toISOString()
    };

    try {
      // Get enterprise metrics
      if (this.enterpriseOrchestrator) {
        metrics.enterprise = await this.enterpriseOrchestrator.getMetrics();
      }

    } catch (error) {
      console.error('❌ Failed to get metrics:', error);
    }

    return metrics;
  }

  /**
   * Count business-spine components
   */
  private countBusinessSpineComponents(): ComponentMetrics {
    try {
      const components: ComponentMetrics = {
        directories: 0,
        files: 0
      };

      const countItems = (dir: string): void => {
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
    } catch (error: any) {
      return { directories: 0, files: 0, error: error.message };
    }
  }

  /**
   * Generate comprehensive system report
   */
  async generateSystemReport(): Promise<SystemReport> {
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
  async cleanup(): Promise<void> {
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
export { AuthSpineOrchestrator };

// Create and export default instance
const authSpineOrchestrator = new AuthSpineOrchestrator();
export default authSpineOrchestrator;

// Auto-initialize if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
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
