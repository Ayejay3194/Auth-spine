/**
 * Adapter Registry for Ops Dashboard
 * 
 * Central registry for all external system adapters
 * with plugin-like architecture for easy integration.
 */

export interface AdapterConfig {
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface Adapter {
  name: string;
  type: string;
  initialize(config: Record<string, any>): Promise<void>;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isHealthy(): Promise<boolean>;
  getData?(query: any): Promise<any>;
  sendData?(data: any): Promise<any>;
}

export class AdapterRegistry {
  private adapters: Map<string, Adapter> = new Map();
  private configs: Map<string, AdapterConfig> = new Map();

  /**
   * Register an adapter
   */
  register(adapter: Adapter, config: AdapterConfig): void {
    this.adapters.set(adapter.name, adapter);
    this.configs.set(adapter.name, config);
  }

  /**
   * Get adapter by name
   */
  get(name: string): Adapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all adapters
   */
  getAll(): Adapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Get adapters by type
   */
  getByType(type: string): Adapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.type === type);
  }

  /**
   * Get enabled adapters
   */
  getEnabled(): Adapter[] {
    return Array.from(this.adapters.values()).filter(adapter => {
      const config = this.configs.get(adapter.name);
      return config?.enabled;
    });
  }

  /**
   * Initialize all adapters
   */
  async initializeAll(): Promise<void> {
    for (const [name, adapter] of this.adapters) {
      const config = this.configs.get(name);
      if (config?.enabled) {
        try {
          await adapter.initialize(config.config);
          await adapter.connect();
        } catch (error) {
          console.error(`Failed to initialize adapter ${name}:`, error);
        }
      }
    }
  }

  /**
   * Initialize specific adapter
   */
  async initialize(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    const config = this.configs.get(name);
    
    if (adapter && config?.enabled) {
      await adapter.initialize(config.config);
      await adapter.connect();
    }
  }

  /**
   * Check health of all adapters
   */
  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [name, adapter] of this.adapters) {
      try {
        health[name] = await adapter.isHealthy();
      } catch (error) {
        health[name] = false;
      }
    }
    
    return health;
  }

  /**
   * Disconnect all adapters
   */
  async disconnectAll(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      try {
        await adapter.disconnect();
      } catch (error) {
        console.error(`Failed to disconnect adapter:`, error);
      }
    }
  }

  /**
   * Update adapter configuration
   */
  updateConfig(name: string, config: Partial<AdapterConfig>): void {
    const existing = this.configs.get(name);
    if (existing) {
      this.configs.set(name, { ...existing, ...config });
    }
  }

  /**
   * Get adapter configuration
   */
  getConfig(name: string): AdapterConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * Remove adapter
   */
  remove(name: string): void {
    const adapter = this.adapters.get(name);
    if (adapter) {
      adapter.disconnect();
      this.adapters.delete(name);
      this.configs.delete(name);
    }
  }
}

// Export singleton instance
export const adapterRegistry = new AdapterRegistry();
