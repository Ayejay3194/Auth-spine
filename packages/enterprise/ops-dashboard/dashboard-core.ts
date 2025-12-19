/**
 * Core Dashboard functionality for Ops Dashboard
 * 
 * Provides the main dashboard engine, widget management,
 * and data orchestration for all modules.
 */

import { 
  DashboardConfig, 
  DashboardContext, 
  DashboardWidget, 
  KPIData, 
  AlertData,
  ModuleType,
  UserPermissions
} from './types.js';
import { featureFlagManager } from './feature-flags.js';

export class DashboardCore {
  private config: DashboardConfig;
  private widgets: Map<string, DashboardWidget> = new Map();
  private alerts: Map<string, AlertData> = new Map();
  private kpis: Map<string, KPIData> = new Map();

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
   * Initialize dashboard for a specific user/tenant
   */
  async initialize(context: DashboardContext): Promise<void> {
    // Load user-specific configuration
    await this.loadUserConfiguration(context);
    
    // Initialize enabled modules
    for (const moduleId of this.config.enabledModules) {
      const flagKey = `module.${moduleId}` as const;
      const isEnabled = await featureFlagManager.isEnabled(flagKey, context.tenantId);
      
      if (isEnabled && this.canUserAccessModule(moduleId, context.permissions)) {
        await this.initializeModule(moduleId, context);
      }
    }

    // Start real-time updates if enabled
    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates(context);
    }
  }

  /**
   * Get dashboard configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.config };
  }

  /**
   * Update dashboard configuration
   */
  updateConfig(updates: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get all widgets for user
   */
  getWidgets(context: DashboardContext): DashboardWidget[] {
    return Array.from(this.widgets.values())
      .filter(widget => this.canUserAccessModule(widget.moduleId, context.permissions))
      .sort((a, b) => {
        const aPos = a.position;
        const bPos = b.position;
        return aPos.y - bPos.y || aPos.x - bPos.x;
      });
  }

  /**
   * Add or update widget
   */
  setWidget(widget: DashboardWidget): void {
    this.widgets.set(widget.id, widget);
  }

  /**
   * Remove widget
   */
  removeWidget(widgetId: string): void {
    this.widgets.delete(widgetId);
  }

  /**
   * Get KPIs for modules
   */
  getKPIs(context: DashboardContext, moduleIds?: ModuleType[]): KPIData[] {
    const kpis = Array.from(this.kpis.values());
    
    return kpis.filter(kpi => {
      const hasAccess = this.canUserAccessModule(kpi.id as ModuleType, context.permissions);
      const inModules = !moduleIds || moduleIds.includes(kpi.id as ModuleType);
      return hasAccess && inModules;
    });
  }

  /**
   * Update KPI data
   */
  setKPI(kpi: KPIData): void {
    this.kpis.set(kpi.id, kpi);
  }

  /**
   * Get alerts for user
   */
  getAlerts(context: DashboardContext, includeAcknowledged = false): AlertData[] {
    return Array.from(this.alerts.values())
      .filter(alert => {
        const hasAccess = !alert.moduleId || 
          this.canUserAccessModule(alert.moduleId, context.permissions);
        const shouldInclude = includeAcknowledged || !alert.acknowledged;
        return hasAccess && shouldInclude;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Add alert
   */
  addAlert(alert: AlertData): void {
    this.alerts.set(alert.id, alert);
    
    // Trigger notification if enabled
    if (this.config.enableNotifications) {
      this.triggerNotification(alert);
    }
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
    }
  }

  /**
   * Get dashboard summary
   */
  async getSummary(context: DashboardContext): Promise<{
    kpis: KPIData[];
    alerts: AlertData[];
    widgets: DashboardWidget[];
    modules: ModuleType[];
  }> {
    const kpis = this.getKPIs(context);
    const alerts = this.getAlerts(context);
    const widgets = this.getWidgets(context);
    const modules = this.config.enabledModules.filter(moduleId => 
      this.canUserAccessModule(moduleId, context.permissions)
    );

    return {
      kpis,
      alerts,
      widgets,
      modules
    };
  }

  /**
   * Refresh dashboard data
   */
  async refresh(context: DashboardContext): Promise<void> {
    // Refresh KPIs
    for (const moduleId of this.config.enabledModules) {
      if (this.canUserAccessModule(moduleId, context.permissions)) {
        await this.refreshModuleData(moduleId, context);
      }
    }

    // Refresh widgets
    for (const widget of this.widgets.values()) {
      if (this.canUserAccessModule(widget.moduleId, context.permissions)) {
        await this.refreshWidgetData(widget.id, context);
      }
    }
  }

  /**
   * Export dashboard configuration
   */
  exportConfiguration(): {
    config: DashboardConfig;
    widgets: DashboardWidget[];
    alerts: AlertData[];
  } {
    return {
      config: this.config,
      widgets: Array.from(this.widgets.values()),
      alerts: Array.from(this.alerts.values())
    };
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

    if (config.widgets) {
      config.widgets.forEach(widget => this.setWidget(widget));
    }

    if (config.alerts) {
      config.alerts.forEach(alert => this.addAlert(alert));
    }
  }

  private async loadUserConfiguration(context: DashboardContext): Promise<void> {
    // In a real implementation, this would load from database
    // For now, use default configuration
  }

  private canUserAccessModule(moduleId: ModuleType, permissions: UserPermissions): boolean {
    return permissions.canView.includes(moduleId) || permissions.canAdmin;
  }

  private async initializeModule(moduleId: ModuleType, context: DashboardContext): Promise<void> {
    // Initialize module-specific widgets and KPIs
    await this.createDefaultWidgets(moduleId, context);
    await this.createDefaultKPIs(moduleId, context);
  }

  private async createDefaultWidgets(moduleId: ModuleType, context: DashboardContext): Promise<void> {
    // Create default widgets for each module
    const defaultWidgets = this.getDefaultWidgets(moduleId);
    defaultWidgets.forEach(widget => this.setWidget(widget));
  }

  private async createDefaultKPIs(moduleId: ModuleType, context: DashboardContext): Promise<void> {
    // Create default KPIs for each module
    const defaultKPIs = this.getDefaultKPIs(moduleId);
    defaultKPIs.forEach(kpi => this.setKPI(kpi));
  }

  private getDefaultWidgets(moduleId: ModuleType): DashboardWidget[] {
    // Return default widgets for each module type
    switch (moduleId) {
      case 'executive':
        return [
          {
            id: 'exec-overview',
            type: 'kpi',
            title: 'Executive Overview',
            moduleId: 'executive',
            data: {},
            config: {},
            position: { x: 0, y: 0, width: 4, height: 2 }
          }
        ];
      case 'finance':
        return [
          {
            id: 'finance-summary',
            type: 'kpi',
            title: 'Financial Summary',
            moduleId: 'finance',
            data: {},
            config: {},
            position: { x: 0, y: 0, width: 4, height: 2 }
          }
        ];
      default:
        return [];
    }
  }

  private getDefaultKPIs(moduleId: ModuleType): KPIData[] {
    const now = new Date();
    
    switch (moduleId) {
      case 'executive':
        return [
          {
            id: 'executive',
            title: 'Overall Health Score',
            value: 85,
            previousValue: 82,
            change: 3,
            changePercent: 3.7,
            trend: 'up',
            unit: '%',
            format: 'percentage',
            lastUpdated: now
          }
        ];
      case 'finance':
        return [
          {
            id: 'revenue',
            title: 'Monthly Revenue',
            value: 125000,
            previousValue: 118000,
            change: 7000,
            changePercent: 5.9,
            trend: 'up',
            unit: '$',
            format: 'currency',
            lastUpdated: now
          }
        ];
      default:
        return [];
    }
  }

  private startRealTimeUpdates(context: DashboardContext): void {
    setInterval(() => {
      this.refresh(context);
    }, this.config.refreshInterval);
  }

  private async refreshModuleData(moduleId: ModuleType, context: DashboardContext): Promise<void> {
    // Refresh module-specific data
    // In a real implementation, this would fetch from data sources
  }

  private async refreshWidgetData(widgetId: string, context: DashboardContext): Promise<void> {
    // Refresh widget-specific data
    // In a real implementation, this would fetch from data sources
  }

  private triggerNotification(alert: AlertData): void {
    // Send notification (email, webhook, etc.)
    console.log(`Alert triggered: ${alert.title} - ${alert.message}`);
  }
}

// Export singleton instance
export const dashboardCore = new DashboardCore();
