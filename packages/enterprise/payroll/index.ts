/**
 * Enterprise Payroll Package
 * 
 * Comprehensive payroll management system with:
 * - Employee salary management
 * - Automated payroll processing
 * - Tax calculations and compliance
 * - Pay stub generation
 * - Direct deposit management
 * - Payroll reporting and analytics
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { PayrollService, PayrollProcessor } from './service';
export { PayrollCalculator } from './calculator';
export { PayrollReporter } from './reporter';
export { DirectDepositManager } from './direct-deposit';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_PAYROLL_SETTINGS } from './config';
export { generatePayrollReport } from './generator';
