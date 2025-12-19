/**
 * Ops Dashboard Spine Kit
 * 
 * Portable Operations + Finance + Employee dashboard scaffold.
 * Built to plug into your existing auth/tenant spine and scale from "dad bookings" to "multi-location chaos."
 */

export * from './dashboard-core.js';
export * from './feature-flags.js';
export * from './modules/index.js';
export * from './adapters/index.js';
export * from './contracts/index.js';

// Main exports
export { OpsDashboard } from './ops-dashboard.js';
export { 
  DashboardModule, 
  DashboardConfig, 
  FeatureFlag, 
  ModuleType 
} from './types.js';

// Default configuration
export const DEFAULT_DASHBOARD_CONFIG = {
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
  refreshInterval: 30000, // 30 seconds
  enableNotifications: true,
  enableAuditLog: true,
  enableRealTimeUpdates: true
};
