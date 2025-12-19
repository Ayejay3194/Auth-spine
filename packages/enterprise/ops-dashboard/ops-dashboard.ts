/**
 * Main Ops Dashboard Class
 * 
 * The central interface for the Ops Dashboard Spine Kit.
 * Provides a comprehensive operations dashboard with modules
 * for finance, payroll, POS, scheduling, inventory, vendors,
 * compliance, and reporting.
 */

import { 
  DashboardConfig, 
  DashboardContext, 
  ModuleType, 
  UserPermissions,
  KPIData,
  AlertData,
  DashboardWidget
} from './types.js';
import { featureFlagManager } from './feature-flags.js';
import { dashboardCore } from './dashboard-core.js';
import { moduleRegistry } from './modules/module-registry.js';
import { adapterRegistry } from './adapters/adapter-registry.js';

export class OpsDashboard {
  private config: DashboardConfig;
  private initialized = false;

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = {
      enabledModules: [
        'executive',
        'finance', 
        'pos',
        'payroll',
        'scheduling',
        'inventory',
        'vendors',
        'compliance',
        'reports'
      ],
      theme: 'default',
      layout: 'sidebar',
      refreshInterval: 30000,
      enableNotifications: true,
      enableAuditLog: true,
      enableRealTimeUpdates: true,
      ...config
    };
  }

  /**
   * Initialize the dashboard for a specific user/tenant
   */
  async initialize(context: DashboardContext): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize core dashboard
      await dashboardCore.initialize(context);

      // Initialize modules
      await moduleRegistry.initializeAll();

      // Initialize adapters
      await adapterRegistry.initializeAll();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Ops Dashboard:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary for user
   */
  async getSummary(context: DashboardContext): Promise<{
    kpis: KPIData[];
    alerts: AlertData[];
    widgets: DashboardWidget[];
    modules: ModuleType[];
    health: Record<string, boolean>;
  }> {
    const summary = await dashboardCore.getSummary(context);
    const health = await adapterRegistry.checkHealth();

    return {
      ...summary,
      health
    };
  }

  /**
   * Get available modules for user
   */
  async getAvailableModules(context: DashboardContext): Promise<ModuleType[]> {
    const available: ModuleType[] = [];

    for (const moduleId of this.config.enabledModules) {
      const flagKey = `module.${moduleId}` as const;
      const isEnabled = await featureFlagManager.isEnabled(flagKey, context.tenantId);
      
      if (isEnabled && this.canUserAccessModule(moduleId, context.permissions)) {
        available.push(moduleId);
      }
    }

    return available;
  }

  /**
   * Get module data
   */
  async getModuleData(moduleId: ModuleType, context: DashboardContext): Promise<any> {
    if (!this.canUserAccessModule(moduleId, context.permissions)) {
      throw new Error(`User does not have access to module: ${moduleId}`);
    }

    return await moduleRegistry.getModuleData(moduleId, context);
  }

  /**
   * Get module KPIs
   */
  async getModuleKPIs(moduleId: ModuleType, context: DashboardContext): Promise<KPIData[]> {
    if (!this.canUserAccessModule(moduleId, context.permissions)) {
      throw new Error(`User does not have access to module: ${moduleId}`);
    }

    return await moduleRegistry.getModuleKPIs(moduleId, context);
  }

  /**
   * Get module alerts
   */
  async getModuleAlerts(moduleId: ModuleType, context: DashboardContext): Promise<AlertData[]> {
    if (!this.canUserAccessModule(moduleId, context.permissions)) {
      throw new Error(`User does not have access to module: ${moduleId}`);
    }

    return await moduleRegistry.getModuleAlerts(moduleId, context);
  }

  /**
   * Add custom widget
   */
  addWidget(widget: DashboardWidget): void {
    dashboardCore.setWidget(widget);
  }

  /**
   * Remove widget
   */
  removeWidget(widgetId: string): void {
    dashboardCore.removeWidget(widgetId);
  }

  /**
   * Add alert
   */
  addAlert(alert: AlertData): void {
    dashboardCore.addAlert(alert);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    dashboardCore.acknowledgeAlert(alertId);
  }

  /**
   * Refresh dashboard data
   */
  async refresh(context: DashboardContext): Promise<void> {
    await dashboardCore.refresh(context);
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...updates };
    dashboardCore.updateConfig(updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.config };
  }

  /**
   * Export dashboard configuration
   */
  exportConfiguration(): {
    config: DashboardConfig;
    widgets: DashboardWidget[];
    alerts: AlertData[];
  } {
    return dashboardCore.exportConfiguration();
  }

  /**
   * Import dashboard configuration
   */
  importConfiguration(config: {
    config?: Partial<DashboardConfig>;
    widgets?: DashboardWidget[];
    alerts?: AlertData[];
  }): void {
    if (config.config) {
      this.updateConfig(config.config);
    }

    dashboardCore.importConfiguration(config);
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<{
    dashboard: boolean;
    modules: Record<string, boolean>;
    adapters: Record<string, boolean>;
    overall: boolean;
  }> {
    const adapters = await adapterRegistry.checkHealth();
    
    // Check module health
    const modules: Record<string, boolean> = {};
    for (const moduleId of this.config.enabledModules) {
      try {
        const registration = moduleRegistry.get(moduleId);
        modules[moduleId] = !!registration;
      } catch (error) {
        modules[moduleId] = false;
      }
    }

    const allHealthy = this.initialized && 
      Object.values(modules).every(healthy => healthy) &&
      Object.values(adapters).every(healthy => healthy);

    return {
      dashboard: this.initialized,
      modules,
      adapters,
      overall: allHealthy
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await moduleRegistry.cleanupAll();
    await adapterRegistry.disconnectAll();
    this.initialized = false;
  }

  private canUserAccessModule(moduleId: ModuleType, permissions: UserPermissions): boolean {
    return permissions.canView.includes(moduleId) || permissions.canAdmin;
  }
}

// Export default instance
export const opsDashboard = new OpsDashboard();
