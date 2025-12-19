/**
 * Type definitions for Auth-spine Analytics Suite
 * Shared types to avoid circular dependencies
 */

export interface AnalyticsConfig {
  enabled: boolean;
  retentionDays: number;
  realTimeTracking: boolean;
  batchProcessing: boolean;
  dataWarehouse: {
    enabled: boolean;
    syncInterval: 'hourly' | 'daily' | 'weekly';
  };
  privacy: {
    anonymizePII: boolean;
    retentionPolicy: 'strict' | 'standard' | 'relaxed';
  };
}

export interface AnalyticsEvent {
  id: string;
  occurredAt: Date;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  sessionId?: string;
  event: string;
  entity?: string;
  entityId?: string;
  path?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  props?: any;
  createdAt: Date;
}

export interface MetricSnapshot {
  id: string;
  asOfDate: Date;
  metric: string;
  valueNumber?: number;
  valueCents?: number;
  dims?: any;
  createdAt: Date;
}

export interface KPIData {
  metric: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule?: string;
  recipients: string[];
  metrics: string[];
  filters?: any;
  format: 'pdf' | 'excel' | 'json' | 'csv';
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  layout: any;
  widgets: any[];
  refreshInterval: number;
  permissions: string[];
}
