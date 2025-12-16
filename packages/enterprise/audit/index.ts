/**
 * Enterprise Audit Logging Package
 * 
 * Comprehensive audit trail system with:
 * - Event logging and tracking
 * - Advanced filtering and search
 * - Export functionality (CSV, JSON)
 * - Compliance reporting
 * - Real-time monitoring
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { AuditLogger, AuditService } from './logger';
export { AuditQuery } from './query';
export { AuditExporter } from './exporter';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_AUDIT_CONFIG } from './config';
export { createAuditLog } from './factory';
