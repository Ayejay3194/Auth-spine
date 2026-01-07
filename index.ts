/**
 * Auth-spine - Complete Enterprise Authentication and Authorization Platform
 *
 * Main entry point for the entire Auth-spine system.
 * This file orchestrates the business-spine and enterprise packages.
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ComponentInfo {
  name: string;
  path: string;
}

interface HealthStatus {
  overall: boolean;
  components: {
    enterprise: any;
    businessSpine: any;
  };
}

interface Metrics {
  enterprise: any;
  businessSpine: {
    status: string;
    path: string;
    components: ComponentCount;
  };
  timestamp: string;
}

interface ComponentCount {
  directories: number;
  files: number;
  error?: string;
}

interface SystemReport {
  summary: {
    platform: string;
    version: string;
    initialized: boolean;
    overallHealth: boolean;
    timestamp: string;
  };
  health: HealthStatus;
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

export class AuthSpineOrchestrator {
  private businessSpinePath: string;
  private enterprisePath: string;
  private initialized: boolean;
  private enterpriseOrchestrator: any;

  constructor() {
    this.businessSpinePath = path.join(__dirname, 'apps', 'business-spine');
    this.enterprisePath = path.join(__dirname, 'packages', 'enterprise');
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🚀 Auth-spine already initialized');
      return;
    }

    console.log('🚀 Initializing Auth-spine Complete Enterprise Platform...');

    try {
      this.verifyComponents();
      await this.initializeEnterprise();
      await this.initializeBusinessSpine();
      this.initialized = true;
      console.log('✅ Auth-spine platform successfully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Auth-spine platform:', error);
      throw error;
    }
  }

  private verifyComponents(): void {
    const components: ComponentInfo[] = [
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

  private async initializeEnterprise(): Promise<void> {
    console.log('🔧 Initializing enterprise packages...');

    try {
      const orchestratorPath = path.join(this.enterprisePath, 'orchestrator.js');
      if (fs.existsSync(orchestratorPath)) {
        const { EnterpriseOrchestrator } = await import(orchestratorPath);
        this.enterpriseOrchestrator = new EnterpriseOrchestrator();
        await this.enterpriseOrchestrator.initialize();
        console.log('✅ Enterprise packages initialized');
      } else {
        console.log('⚠️ Enterprise orchestrator not found, skipping...');
      }
    } catch (error) {
      console.error('❌ Failed to initialize enterprise packages:', error);
      throw error;
    }
  }

  private async initializeBusinessSpine(): Promise<void> {
    console.log('🔧 Initializing business-spine...');

    try {
      const businessSpineIndex = path.join(this.businessSpinePath, 'package.json');
      if (fs.existsSync(businessSpineIndex)) {
        console.log('✅ Business-spine package found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize business-spine:', error);
      throw error;
    }
  }

  async getHealthStatus(): Promise<HealthStatus> {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const healthStatus: HealthStatus = {
      overall: true,
      components: {
        enterprise: null,
        businessSpine: null
      }
    };

    try {
      if (this.enterpriseOrchestrator) {
        healthStatus.components.enterprise = await this.enterpriseOrchestrator.getHealthStatus();
      }

      healthStatus.components.businessSpine = {
        healthy: fs.existsSync(this.businessSpinePath),
        message: fs.existsSync(this.businessSpinePath) ? 'Business-spine directory exists' : 'Business-spine directory missing'
      };

      healthStatus.overall = Object.values(healthStatus.components).every(
        component => component === null || component.healthy !== false
      );
    } catch (error) {
      console.error('❌ Failed to get health status:', error);
      healthStatus.overall = false;
    }

    return healthStatus;
  }

  async getMetrics(): Promise<Metrics> {
    if (!this.initialized) {
      throw new Error('Auth-spine platform not initialized. Call initialize() first.');
    }

    const metrics: Metrics = {
      enterprise: null,
      businessSpine: {
        status: 'active',
        path: this.businessSpinePath,
        components: { directories: 0, files: 0 }
      },
      timestamp: new Date().toISOString()
    };

    try {
      if (this.enterpriseOrchestrator) {
        metrics.enterprise = await this.enterpriseOrchestrator.getMetrics();
      }
      metrics.businessSpine.components = this.countBusinessSpineComponents();
    } catch (error) {
      console.error('❌ Failed to get metrics:', error);
    }

    return metrics;
  }

  private countBusinessSpineComponents(): ComponentCount {
    try {
      const components: ComponentCount = {
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

  async cleanup(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      console.log('🧹 Cleaning up Auth-spine platform...');
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

export const authSpineOrchestrator = new AuthSpineOrchestrator();
export default authSpineOrchestrator;

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await authSpineOrchestrator.initialize();
      const report = await authSpineOrchestrator.generateSystemReport();
      console.log('\n📊 Auth-spine System Report:');
      console.log(JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('❌ Failed to start Auth-spine platform:', error);
      process.exit(1);
    }
  })();
}
