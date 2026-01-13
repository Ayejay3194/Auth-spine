/**
 * Dashboard contracts and interfaces
 */

export interface DashboardRequest {
  userId: string;
  tenantId?: string;
  permissions: string[];
  moduleId?: string;
  timeframe?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
  };
}

export interface WidgetDataRequest {
  widgetId: string;
  moduleId: string;
  filters?: Record<string, any>;
  refreshInterval?: number;
}

export interface WidgetDataResponse {
  widgetId: string;
  data: any;
  lastUpdated: Date;
  nextRefresh?: Date;
}

export interface KPIRequest {
  kpiIds: string[];
  moduleId?: string;
  timeframe?: {
    start: Date;
    end: Date;
  };
}

export interface KPIResponse {
  kpis: Array<{
    id: string;
    value: number | string;
    previousValue?: number | string;
    change?: number;
    changePercent?: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: Date;
  }>;
}

export interface AlertRequest {
  moduleId?: string;
  severity?: string;
  acknowledged?: boolean;
  limit?: number;
}

export interface AlertResponse {
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    acknowledged: boolean;
    moduleId?: string;
    actionUrl?: string;
  }>;
  total: number;
}
