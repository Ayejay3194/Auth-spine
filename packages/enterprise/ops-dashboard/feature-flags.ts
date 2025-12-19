/**
 * Feature Flags Management for Ops Dashboard
 * 
 * Provides feature flag functionality to enable/disable modules
 * and features based on tenant, user, or configuration.
 */

import { FlagKey, FeatureFlag } from './types.js';

export type FlagMap = Record<FlagKey, boolean>;

const GLOBAL_FLAGS: FlagMap = {
  "module.executive": true,
  "module.finance": true,
  "module.pos": true,
  "module.payroll": true,
  "module.scheduling": true,
  "module.inventory": true,
  "module.vendors": true,
  "module.compliance": true,
  "module.reports": true
};

export class FeatureFlagManager {
  private flags: Map<string, boolean> = new Map();
  private customFlags: Map<string, FeatureFlag> = new Map();

  constructor() {
    // Initialize with global flags
    Object.entries(GLOBAL_FLAGS).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
  }

  /**
   * Check if a feature flag is enabled
   */
  async isEnabled(key: FlagKey, tenantId?: string): Promise<boolean> {
    // In a real implementation, this would check database or external service
    // For now, return global flag value
    void tenantId;
    return this.flags.get(key) ?? false;
  }

  /**
   * Enable or disable a feature flag
   */
  setFlag(key: FlagKey, enabled: boolean): void {
    this.flags.set(key, enabled);
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FlagMap {
    const result: FlagMap = {} as FlagMap;
    this.flags.forEach((value, key) => {
      result[key as FlagKey] = value;
    });
    return result;
  }

  /**
   * Get enabled modules based on flags
   */
  getEnabledModules(): FlagKey[] {
    return Object.entries(GLOBAL_FLAGS)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key as FlagKey);
  }

  /**
   * Add custom feature flag
   */
  addCustomFlag(flag: FeatureFlag): void {
    this.customFlags.set(flag.key, flag);
    this.flags.set(flag.key, flag.enabled);
  }

  /**
   * Get custom flag details
   */
  getCustomFlag(key: string): FeatureFlag | undefined {
    return this.customFlags.get(key);
  }

  /**
   * Get all custom flags
   */
  getCustomFlags(): FeatureFlag[] {
    return Array.from(this.customFlags.values());
  }

  /**
   * Check if user has access to a module
   */
  async canAccessModule(
    moduleId: string, 
    userId: string, 
    tenantId?: string
  ): Promise<boolean> {
    const flagKey = `module.${moduleId}` as FlagKey;
    return this.isEnabled(flagKey, tenantId);
  }

  /**
   * Get available modules for user
   */
  async getAvailableModules(
    userId: string, 
    tenantId?: string
  ): Promise<string[]> {
    const modules = [
      'executive',
      'finance', 
      'pos',
      'payroll',
      'scheduling',
      'inventory',
      'vendors',
      'compliance',
      'reports'
    ];

    const available: string[] = [];
    for (const module of modules) {
      if (await this.canAccessModule(module, userId, tenantId)) {
        available.push(module);
      }
    }

    return available;
  }

  /**
   * Reset to default flags
   */
  resetToDefaults(): void {
    this.flags.clear();
    Object.entries(GLOBAL_FLAGS).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
  }

  /**
   * Export flags configuration
   */
  exportConfig(): {
    global: FlagMap;
    custom: FeatureFlag[];
  } {
    return {
      global: this.getAllFlags(),
      custom: this.getCustomFlags()
    };
  }

  /**
   * Import flags configuration
   */
  importConfig(config: {
    global?: Partial<FlagMap>;
    custom?: FeatureFlag[];
  }): void {
    if (config.global) {
      Object.entries(config.global).forEach(([key, value]) => {
        this.flags.set(key as FlagKey, value);
      });
    }

    if (config.custom) {
      config.custom.forEach(flag => {
        this.addCustomFlag(flag);
      });
    }
  }
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();

// Export convenience functions
export const isEnabled = (key: FlagKey, tenantId?: string) => 
  featureFlagManager.isEnabled(key, tenantId);

export const setFlag = (key: FlagKey, enabled: boolean) => 
  featureFlagManager.setFlag(key, enabled);

export const getEnabledModules = () => 
  featureFlagManager.getEnabledModules();
