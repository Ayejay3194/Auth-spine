/**
 * Audit Types - Type definitions for audit logging system
 */

export interface AuditLog {
  id: string;
  eventType: string;
  userId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface AuditQuery {
  eventType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditFilter {
  search?: string;
  eventTypes?: string[];
  users?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  filters?: AuditFilter;
  includeHeaders?: boolean;
}
