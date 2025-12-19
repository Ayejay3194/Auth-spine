/**
 * Registry Manager for Legal & Compliance Disaster Kit
 * 
 * Central management for all compliance registries including
 * vendors, subprocessors, OSS licenses, ROPA, and DPIA.
 */

import { ComplianceRegistry, ComplianceFramework } from '../types.js';

export class RegistryManager {
  private registries: Map<string, ComplianceRegistry> = new Map();

  /**
   * Initialize registry manager
   */
  async initialize(): Promise<void> {
    // Load default registry templates
  }

  /**
   * Add registry
   */
  addRegistry(registry: ComplianceRegistry): void {
    this.registries.set(registry.id, registry);
  }

  /**
   * Get registry by ID
   */
  getRegistry(id: string): ComplianceRegistry | undefined {
    return this.registries.get(id);
  }

  /**
   * Get all registries
   */
  getAllRegistries(): ComplianceRegistry[] {
    return Array.from(this.registries.values());
  }

  /**
   * Get registries by type
   */
  getRegistriesByType(type: ComplianceRegistry['type']): ComplianceRegistry[] {
    return Array.from(this.registries.values()).filter(registry => registry.type === type);
  }

  /**
   * Update registry
   */
  updateRegistry(id: string, updates: Partial<ComplianceRegistry>): void {
    const registry = this.registries.get(id);
    if (registry) {
      Object.assign(registry, updates, { updatedAt: new Date() });
    }
  }

  /**
   * Delete registry
   */
  deleteRegistry(id: string): boolean {
    return this.registries.delete(id);
  }
}

// Export singleton instance
export const registryManager = new RegistryManager();
