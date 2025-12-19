/**
 * Enterprise Validation Package
 * 
 * Comprehensive validation and auditing framework with:
 * - Data integrity validation for all business features
 * - Receipt system with complete audit trails
 * - Compliance validation and reporting
 * - Financial transaction auditing
 * - Automated compliance checks
 * - Audit report generation
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { ValidationService, DataValidator } from './service';
export { ReceiptManager, ReceiptGenerator } from './receipts';
export { ComplianceValidator } from './compliance';
export { AuditTrailManager } from './audit-trail';
export { FinancialAuditor } from './financial-auditor';
export { ReportGenerator } from './reports';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_VALIDATION_SETTINGS } from './config';
export { validateBusinessTransaction, generateAuditReceipt } from './helpers';
