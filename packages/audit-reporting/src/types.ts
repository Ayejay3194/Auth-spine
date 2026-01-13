export type AuditEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILED'
  | 'MFA_REQUIRED'
  | 'MFA_FAILED'
  | 'REFRESH_SUCCESS'
  | 'REFRESH_FAILED'
  | 'SESSION_REVOKED'
  | 'PERMISSIONS_UPDATED'
  | 'OAUTH_PASSWORD_SUCCESS'
  | 'OAUTH_REFRESH_SUCCESS'
  | 'API_CALL'
  | 'ERROR'
  | 'PERFORMANCE_WARNING'
  | 'SECURITY_ALERT'
  | 'DATA_ACCESS'
  | 'CONFIGURATION_CHANGE'
  | 'USER_ACTION';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'session'
  | 'api'
  | 'security'
  | 'performance'
  | 'data'
  | 'configuration'
  | 'user';

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  userId?: string;
  clientId?: string;
  sessionId?: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  context?: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
  };
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  userId?: string;
  clientId?: string;
  sessionId?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditMetrics {
  totalEvents: number;
  successRate: number;
  failureRate: number;
  averageDuration?: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topClients: Array<{ clientId: string; count: number }>;
  timeSeriesData: Array<{
    timestamp: number;
    count: number;
    successCount: number;
    failureCount: number;
  }>;
}

export interface ConsolidatedReport {
  id: string;
  title: string;
  description?: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  filters: AuditFilter;
  metrics: AuditMetrics;
  events: AuditEvent[];
  insights: ReportInsight[];
  recommendations: string[];
}

export interface ReportInsight {
  type: 'trend' | 'anomaly' | 'pattern' | 'alert';
  severity: AuditSeverity;
  title: string;
  description: string;
  data?: any;
}

export interface GroupedAuditData {
  groupBy: 'eventType' | 'category' | 'severity' | 'user' | 'client' | 'hour' | 'day';
  groups: Array<{
    key: string;
    count: number;
    successCount: number;
    failureCount: number;
    events: AuditEvent[];
    metrics: Partial<AuditMetrics>;
  }>;
}

export interface AuditReportConfig {
  name: string;
  description?: string;
  schedule?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  filters: AuditFilter;
  includeInsights?: boolean;
  includeRecommendations?: boolean;
  recipients?: string[];
  format?: 'json' | 'html' | 'pdf' | 'csv';
}
