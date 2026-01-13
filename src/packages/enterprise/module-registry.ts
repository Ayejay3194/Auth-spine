/**
 * Module Registry for Ops Dashboard
 * 
 * Central registry for all dashboard modules with their
 * configurations, permissions, and handlers.
 */

import { 
  ModuleType, 
  DashboardModule, 
  FinanceModule, 
  POSModule, 
  PayrollModule,
  SchedulingModule,
  InventoryModule,
  VendorsModule,
  ComplianceModule,
  ReportsModule
} from '../types.js';

export interface ModuleHandler {
  initialize?(): Promise<void>;
  getData?(context: any): Promise<any>;
  getKPIs?(context: any): Promise<any[]>;
  getAlerts?(context: any): Promise<any[]>;
  cleanup?(): Promise<void>;
}

export interface ModuleRegistration {
  module: DashboardModule;
  handler: ModuleHandler;
}

export class ModuleRegistry {
  private modules: Map<ModuleType, ModuleRegistration> = new Map();

  constructor() {
    this.registerDefaultModules();
  }

  /**
   * Register a module
   */
  register(moduleType: ModuleType, registration: ModuleRegistration): void {
    this.modules.set(moduleType, registration);
  }

  /**
   * Get module registration
   */
  get(moduleType: ModuleType): ModuleRegistration | undefined {
    return this.modules.get(moduleType);
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleRegistration[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get enabled modules for user
   */
  getEnabledForUser(userPermissions: any): ModuleRegistration[] {
    return Array.from(this.modules.values()).filter(reg => 
      this.canUserAccessModule(reg.module, userPermissions)
    );
  }

  /**
   * Initialize all modules
   */
  async initializeAll(): Promise<void> {
    for (const registration of this.modules.values()) {
      if (registration.handler.initialize) {
        await registration.handler.initialize();
      }
    }
  }

  /**
   * Initialize specific module
   */
  async initializeModule(moduleType: ModuleType): Promise<void> {
    const registration = this.modules.get(moduleType);
    if (registration?.handler.initialize) {
      await registration.handler.initialize();
    }
  }

  /**
   * Get module data
   */
  async getModuleData(moduleType: ModuleType, context: any): Promise<any> {
    const registration = this.modules.get(moduleType);
    if (registration?.handler.getData) {
      return registration.handler.getData(context);
    }
    return null;
  }

  /**
   * Get module KPIs
   */
  async getModuleKPIs(moduleType: ModuleType, context: any): Promise<any[]> {
    const registration = this.modules.get(moduleType);
    if (registration?.handler.getKPIs) {
      return registration.handler.getKPIs(context);
    }
    return [];
  }

  /**
   * Get module alerts
   */
  async getModuleAlerts(moduleType: ModuleType, context: any): Promise<any[]> {
    const registration = this.modules.get(moduleType);
    if (registration?.handler.getAlerts) {
      return registration.handler.getAlerts(context);
    }
    return [];
  }

  /**
   * Cleanup all modules
   */
  async cleanupAll(): Promise<void> {
    for (const registration of this.modules.values()) {
      if (registration.handler.cleanup) {
        await registration.handler.cleanup();
      }
    }
  }

  private canUserAccessModule(module: DashboardModule, permissions: any): boolean {
    if (!module.requiredPermissions || module.requiredPermissions.length === 0) {
      return true;
    }
    
    return module.requiredPermissions.some(permission => 
      permissions[permission] || permissions.canAdmin
    );
  }

  private registerDefaultModules(): void {
    // Register all default modules with their handlers
    this.register('executive', {
      module: {
        id: 'executive',
        name: 'Executive Dashboard',
        description: 'High-level overview and KPIs for executives',
        icon: 'bar-chart-3',
        path: '/admin/executive',
        enabled: true,
        requiredPermissions: ['view.executive'],
        components: {
          overview: 'ExecutiveOverview',
          details: 'ExecutiveDetails',
          reports: 'ExecutiveReports'
        }
      },
      handler: new ExecutiveModuleHandler()
    });

    this.register('finance', {
      module: {
        id: 'finance',
        name: 'Finance',
        description: 'Revenue, expenses, and financial reporting',
        icon: 'dollar-sign',
        path: '/admin/finance',
        enabled: true,
        requiredPermissions: ['view.finance'],
        components: {
          overview: 'FinanceOverview',
          details: 'FinanceDetails',
          reports: 'FinanceReports'
        }
      },
      handler: new FinanceModuleHandler()
    });

    this.register('pos', {
      module: {
        id: 'pos',
        name: 'POS & Payments',
        description: 'Point of sale and payment processing',
        icon: 'credit-card',
        path: '/admin/pos',
        enabled: true,
        requiredPermissions: ['view.pos'],
        components: {
          overview: 'POSOverview',
          details: 'POSDetails',
          reports: 'POSReports'
        }
      },
      handler: new POSModuleHandler()
    });

    this.register('payroll', {
      module: {
        id: 'payroll',
        name: 'Payroll & Compensation',
        description: 'Payroll runs and compensation management',
        icon: 'users',
        path: '/admin/payroll',
        enabled: true,
        requiredPermissions: ['view.payroll'],
        components: {
          overview: 'PayrollOverview',
          details: 'PayrollDetails',
          reports: 'PayrollReports'
        }
      },
      handler: new PayrollModuleHandler()
    });

    this.register('scheduling', {
      module: {
        id: 'scheduling',
        name: 'Scheduling & Labor',
        description: 'Employee scheduling and labor management',
        icon: 'calendar',
        path: '/admin/scheduling',
        enabled: true,
        requiredPermissions: ['view.scheduling'],
        components: {
          overview: 'SchedulingOverview',
          details: 'SchedulingDetails',
          reports: 'SchedulingReports'
        }
      },
      handler: new SchedulingModuleHandler()
    });

    this.register('inventory', {
      module: {
        id: 'inventory',
        name: 'Inventory',
        description: 'Inventory management and tracking',
        icon: 'package',
        path: '/admin/inventory',
        enabled: true,
        requiredPermissions: ['view.inventory'],
        components: {
          overview: 'InventoryOverview',
          details: 'InventoryDetails',
          reports: 'InventoryReports'
        }
      },
      handler: new InventoryModuleHandler()
    });

    this.register('vendors', {
      module: {
        id: 'vendors',
        name: 'Vendors & Subscriptions',
        description: 'Vendor management and subscription tracking',
        icon: 'truck',
        path: '/admin/vendors',
        enabled: true,
        requiredPermissions: ['view.vendors'],
        components: {
          overview: 'VendorsOverview',
          details: 'VendorsDetails',
          reports: 'VendorsReports'
        }
      },
      handler: new VendorsModuleHandler()
    });

    this.register('compliance', {
      module: {
        id: 'compliance',
        name: 'Compliance',
        description: 'Audit logs and compliance management',
        icon: 'shield',
        path: '/admin/compliance',
        enabled: true,
        requiredPermissions: ['view.compliance'],
        components: {
          overview: 'ComplianceOverview',
          details: 'ComplianceDetails',
          reports: 'ComplianceReports'
        }
      },
      handler: new ComplianceModuleHandler()
    });

    this.register('reports', {
      module: {
        id: 'reports',
        name: 'Reports & Exports',
        description: 'Report generation and data exports',
        icon: 'file-text',
        path: '/admin/reports',
        enabled: true,
        requiredPermissions: ['view.reports'],
        components: {
          overview: 'ReportsOverview',
          details: 'ReportsDetails',
          reports: 'ReportsCustom'
        }
      },
      handler: new ReportsModuleHandler()
    });
  }
}

// Module Handler Implementations
class ExecutiveModuleHandler implements ModuleHandler {
  async initialize(): Promise<void> {
    // Initialize executive module
  }

  async getData(context: any): Promise<any> {
    return {
      healthScore: 85,
      totalRevenue: 1250000,
      activeUsers: 1500,
      systemUptime: 99.9
    };
  }

  async getKPIs(context: any): Promise<any[]> {
    return [
      {
        id: 'health-score',
        title: 'Health Score',
        value: 85,
        trend: 'up'
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: 1250000,
        format: 'currency',
        trend: 'up'
      }
    ];
  }
}

class FinanceModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<FinanceModule> {
    return {
      revenue: {
        total: 1250000,
        mrr: 125000,
        arr: 1500000,
        growth: 5.2
      },
      expenses: {
        total: 850000,
        categories: {
          'Salaries': 500000,
          'Operations': 200000,
          'Marketing': 100000,
          'Other': 50000
        },
        trend: 2.1
      },
      profitLoss: {
        gross: 400000,
        net: 350000,
        margin: 28.0
      }
    };
  }

  async getKPIs(context: any): Promise<any[]> {
    return [
      {
        id: 'monthly-revenue',
        title: 'Monthly Revenue',
        value: 125000,
        format: 'currency',
        trend: 'up'
      },
      {
        id: 'profit-margin',
        title: 'Profit Margin',
        value: 28.0,
        format: 'percentage',
        trend: 'stable'
      }
    ];
  }
}

class POSModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<POSModule> {
    return {
      transactions: {
        total: 15420,
        today: 342,
        week: 2105,
        month: 8941
      },
      refunds: {
        count: 47,
        amount: 2340,
        rate: 0.3
      },
      settlement: {
        pending: 1250,
        completed: 14170,
        failed: 12
      }
    };
  }
}

class PayrollModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<PayrollModule> {
    return {
      runs: {
        scheduled: 2,
        processing: 1,
        completed: 24,
        failed: 0
      },
      compensation: {
        totalPayroll: 850000,
        averageSalary: 65000,
        commissionTotal: 45000
      },
      compliance: {
        taxFilings: 12,
        w2sGenerated: 45,
        i9sCurrent: 43
      }
    };
  }
}

class SchedulingModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<SchedulingModule> {
    return {
      utilization: {
        rate: 78.5,
        target: 85.0,
        trend: -2.1
      },
      capacity: {
        scheduled: 320,
        available: 85,
        overtime: 15
      },
      noShows: {
        count: 8,
        rate: 2.5,
        cost: 1200
      }
    };
  }
}

class InventoryModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<InventoryModule> {
    return {
      items: {
        total: 1250,
        inStock: 1180,
        outOfStock: 25,
        lowStock: 45
      },
      value: {
        total: 125000,
        cost: 75000,
        retail: 125000
      },
      turnover: {
        rate: 4.2,
        days: 87,
        trend: 0.8
      }
    };
  }
}

class VendorsModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<VendorsModule> {
    return {
      contracts: {
        active: 18,
        expiring: 3,
        expired: 2
      },
      subscriptions: {
        active: 12,
        monthlyCost: 2500,
        annualCost: 30000
      },
      spend: {
        total: 450000,
        thisMonth: 38000,
        ytd: 285000
      }
    };
  }
}

class ComplianceModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<ComplianceModule> {
    return {
      audits: {
        pending: 2,
        inProgress: 1,
        completed: 24
      },
      violations: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 7
      },
      certifications: {
        valid: 8,
        expiring: 2,
        expired: 1
      }
    };
  }
}

class ReportsModuleHandler implements ModuleHandler {
  async getData(context: any): Promise<ReportsModule> {
    return {
      reports: {
        scheduled: 8,
        generated: 156,
        failed: 2
      },
      exports: {
        csv: 89,
        pdf: 45,
        excel: 22
      },
      analytics: {
        queries: 1250,
        dashboards: 12,
        alerts: 8
      }
    };
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
