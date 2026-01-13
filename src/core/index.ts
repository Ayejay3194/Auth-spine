/**
 * Core System Module
 * Optimized, performance-focused core system
 */

// Re-export all core modules
export * from "@core/auth";
export * from "@core/monitoring";
export * from "@core/logging";
export * from "@core/telemetry";

// Core system configuration
export interface CoreSystemConfig {
  auth: {
    enabled: boolean;
    providers: string[];
    sessionTimeout: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    healthCheckInterval: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
  };
  telemetry: {
    enabled: boolean;
    tracing: boolean;
    sampling: number;
  };
}

// Default core configuration
export const defaultCoreConfig: CoreSystemConfig = {
  auth: {
    enabled: true,
    providers: ['oauth', 'credentials'],
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  monitoring: {
    enabled: true,
    metricsInterval: 60000, // 1 minute
    healthCheckInterval: 30000, // 30 seconds
  },
  logging: {
    enabled: true,
    level: 'info',
    structured: true
  },
  telemetry: {
    enabled: true,
    tracing: true,
    sampling: 1.0
  }
};

// Core system manager
export class CoreSystem {
  private config: CoreSystemConfig;
  private components: Map<string, any> = new Map();
  private initialized = false;

  constructor(config: Partial<CoreSystemConfig> = {}) {
    this.config = this.mergeConfig(defaultCoreConfig, config);
  }

  private mergeConfig(defaultConfig: CoreSystemConfig, userConfig: Partial<CoreSystemConfig>): CoreSystemConfig {
    return {
      auth: { ...defaultConfig.auth, ...userConfig.auth },
      monitoring: { ...defaultConfig.monitoring, ...userConfig.monitoring },
      logging: { ...defaultConfig.logging, ...userConfig.logging },
      telemetry: { ...defaultConfig.telemetry, ...userConfig.telemetry }
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize auth
      if (this.config.auth.enabled) {
        const { AuthManager, defaultAuthConfig } = await import('./auth');
        const authManager = new AuthManager({
          providers: [],
          debug: this.config.logging.level === 'debug'
        });
        this.components.set('auth', authManager);
      }

      // Initialize monitoring
      if (this.config.monitoring.enabled) {
        const { MetricsCollector, defaultMonitoringConfig } = await import('./monitoring');
        const metricsCollector = new MetricsCollector({
          enabled: true,
          flushInterval: this.config.monitoring.metricsInterval,
          debug: this.config.logging.level === 'debug'
        });
        this.components.set('monitoring', metricsCollector);
      }

      // Initialize logging
      if (this.config.logging.enabled) {
        const { Logger, defaultLoggingConfig } = await import('./logging');
        const logger = new Logger({
          level: this.config.logging.level,
          structured: this.config.logging.structured
        });
        this.components.set('logging', logger);
      }

      // Initialize telemetry
      if (this.config.telemetry.enabled) {
        const { Tracer, defaultTelemetryConfig } = await import('./telemetry');
        const tracer = new Tracer('auth-spine-core', {
          enabled: true,
          environment: 'development',
          sampling: this.config.telemetry.sampling
        });
        this.components.set('telemetry', tracer);
      }

      this.initialized = true;
      console.log('[CoreSystem] Initialized successfully');
    } catch (error) {
      console.error('[CoreSystem] Initialization failed:', error);
      throw error;
    }
  }

  getComponent(name: string) {
    return this.components.get(name);
  }

  getConfig(): CoreSystemConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async shutdown(): Promise<void> {
    // Cleanup all components
    for (const [name, component] of this.components.entries()) {
      try {
        if (component && typeof component.shutdown === 'function') {
          await component.shutdown();
        }
      } catch (error) {
        console.error(`[CoreSystem] Error shutting down ${name}:`, error);
      }
    }
    
    this.components.clear();
    this.initialized = false;
    console.log('[CoreSystem] Shutdown complete');
  }
}

// Factory function
export function createCoreSystem(config?: Partial<CoreSystemConfig>): CoreSystem {
  return new CoreSystem(config);
}

// Re-exports
export { CoreSystem, createCoreSystem, defaultCoreConfig };
export type { CoreSystemConfig };
