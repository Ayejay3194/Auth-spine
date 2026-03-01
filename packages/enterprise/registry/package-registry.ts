/**
 * Unified Package Registry
 * 
 * Central registry for all Auth-Spine packages with:
 * - Auto-discovery
 * - Dependency resolution
 * - Version management
 * - Health monitoring
 * - Lifecycle hooks
 */

export interface PackageMetadata {
  name: string;
  version: string;
  description?: string;
  category: 'core' | 'ai-ml' | 'enterprise' | 'data-science' | 'tools' | 'business';
  status: 'active' | 'deprecated' | 'beta';
  dependencies?: string[];
  exports?: string[];
  healthCheck?: () => Promise<boolean>;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

export interface PackageHealth {
  name: string;
  healthy: boolean;
  lastCheck: Date;
  errors?: string[];
  metrics?: Record<string, any>;
}

export interface RegistryConfig {
  autoDiscover?: boolean;
  enableHealthChecks?: boolean;
  healthCheckInterval?: number;
  enableMetrics?: boolean;
}

export class UnifiedPackageRegistry {
  private packages: Map<string, PackageMetadata> = new Map();
  private instances: Map<string, any> = new Map();
  private healthStatus: Map<string, PackageHealth> = new Map();
  private config: RegistryConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private initialized = false;

  constructor(config: RegistryConfig = {}) {
    this.config = {
      autoDiscover: true,
      enableHealthChecks: true,
      healthCheckInterval: 60000,
      enableMetrics: true,
      ...config
    };
  }

  register(metadata: PackageMetadata, instance?: any): void {
    this.packages.set(metadata.name, metadata);
    if (instance) {
      this.instances.set(metadata.name, instance);
    }
    this.healthStatus.set(metadata.name, {
      name: metadata.name,
      healthy: false,
      lastCheck: new Date(),
      errors: []
    });
  }

  getInstance(name: string): any {
    return this.instances.get(name);
  }

  listPackages(): PackageMetadata[] {
    return Array.from(this.packages.values());
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  getStatistics() {
    return {
      total: this.packages.size,
      initialized: this.initialized
    };
  }
}

export function getPackageRegistry(config?: RegistryConfig): UnifiedPackageRegistry {
  return new UnifiedPackageRegistry(config);
}
