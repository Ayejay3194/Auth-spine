/**
 * Type definitions for Ops Dashboard Spine Kit
 */

export type ModuleType = 
  | 'executive'
  | 'finance' 
  | 'pos'
  | 'payroll'
  | 'scheduling'
  | 'inventory'
  | 'vendors'
  | 'compliance'
  | 'reports';

export type FlagKey = 
  | "module.executive"
  | "module.finance"
  | "module.pos"
  | "module.payroll"
  | "module.scheduling"
  | "module.inventory"
  | "module.vendors"
  | "module.compliance"
  | "module.reports";

export interface FeatureFlag {
  key: FlagKey;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, any>;
}

export interface DashboardModule {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  path: string;
  enabled: boolean;
  requiredPermissions?: string[];
  components?: {
    overview?: string;
    details?: string;
    reports?: string;
    settings?: string;
  };
}

export interface DashboardConfig {
  enabledModules: ModuleType[];
  theme: 'default' | 'dark' | 'compact';
  layout: 'sidebar' | 'top' | 'grid';
  refreshInterval: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  enableRealTimeUpdates: boolean;
  customModules?: DashboardModule[];
}

export interface KPIData {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
  lastUpdated: Date;
}

export interface AlertData {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  moduleId?: ModuleType;
  actionUrl?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'alert' | 'custom';
  title: string;
  moduleId: ModuleType;
  data: any;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UserPermissions {
  canView: ModuleType[];
  canEdit: ModuleType[];
  canDelete: ModuleType[];
  canAdmin: boolean;
}

export interface DashboardContext {
  tenantId?: string;
  userId: string;
  permissions: UserPermissions;
  flags: Record<FlagKey, boolean>;
  config: DashboardConfig;
}

// Module-specific types
export interface FinanceModule {
  revenue: {
    total: number;
    mrr: number;
    arr: number;
    growth: number;
  };
  expenses: {
    total: number;
    categories: Record<string, number>;
    trend: number;
  };
  profitLoss: {
    gross: number;
    net: number;
    margin: number;
  };
}

export interface POSModule {
  transactions: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  refunds: {
    count: number;
    amount: number;
    rate: number;
  };
  settlement: {
    pending: number;
    completed: number;
    failed: number;
  };
}

export interface PayrollModule {
  runs: {
    scheduled: number;
    processing: number;
    completed: number;
    failed: number;
  };
  compensation: {
    totalPayroll: number;
    averageSalary: number;
    commissionTotal: number;
  };
  compliance: {
    taxFilings: number;
    w2sGenerated: number;
    i9sCurrent: number;
  };
}

export interface SchedulingModule {
  utilization: {
    rate: number;
    target: number;
    trend: number;
  };
  capacity: {
    scheduled: number;
    available: number;
    overtime: number;
  };
  noShows: {
    count: number;
    rate: number;
    cost: number;
  };
}

export interface InventoryModule {
  items: {
    total: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  value: {
    total: number;
    cost: number;
    retail: number;
  };
  turnover: {
    rate: number;
    days: number;
    trend: number;
  };
}

export interface VendorsModule {
  contracts: {
    active: number;
    expiring: number;
    expired: number;
  };
  subscriptions: {
    active: number;
    monthlyCost: number;
    annualCost: number;
  };
  spend: {
    total: number;
    thisMonth: number;
    ytd: number;
  };
}

export interface ComplianceModule {
  audits: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  violations: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  certifications: {
    valid: number;
    expiring: number;
    expired: number;
  };
}

export interface ReportsModule {
  reports: {
    scheduled: number;
    generated: number;
    failed: number;
  };
  exports: {
    csv: number;
    pdf: number;
    excel: number;
  };
  analytics: {
    queries: number;
    dashboards: number;
    alerts: number;
  };
}
