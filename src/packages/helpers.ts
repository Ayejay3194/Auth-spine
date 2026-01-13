/**
 * Validation Helpers - Helper functions for validation operations
 */

import { 
  ValidationResult, 
  Receipt, 
  TransactionType,
  ValidationType,
  ComplianceLevel
} from './types';
import { ValidationService } from './service';
import { ReceiptGenerator } from './receipts';

/**
 * Validate any business transaction with comprehensive checks
 */
export async function validateBusinessTransaction(
  entityType: string,
  data: any,
  context: string = 'default'
): Promise<ValidationResult> {
  const validationService = new ValidationService();
  return await validationService.validate(entityType, data, context);
}

/**
 * Generate audit receipt for any transaction
 */
export async function generateAuditReceipt(
  transactionId: string,
  transactionType: TransactionType,
  transactionData: any,
  businessContext: string = 'default'
): Promise<Receipt> {
  const receiptGenerator = new ReceiptGenerator();
  return await receiptGenerator.generateReceipt(transactionId, transactionType, transactionData, businessContext);
}

/**
 * Quick validation for common business entities
 */
export class QuickValidator {
  /**
   * Validate customer data
   */
  static async validateCustomer(customerData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('customer', customerData, 'customer_management');
  }

  /**
   * Validate employee data
   */
  static async validateEmployee(employeeData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('employee', employeeData, 'employee_management');
  }

  /**
   * Validate supplier data
   */
  static async validateSupplier(supplierData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('supplier', supplierData, 'supplier_management');
  }

  /**
   * Validate product data
   */
  static async validateProduct(productData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('product', productData, 'product_management');
  }

  /**
   * Validate invoice data
   */
  static async validateInvoice(invoiceData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('invoice', invoiceData, 'invoice_processing');
  }

  /**
   * Validate payment data
   */
  static async validatePayment(paymentData: any): Promise<ValidationResult> {
    const validationService = new ValidationService();
    return await validationService.validate('payment', paymentData, 'payment_processing');
  }
}

/**
 * Compliance helper functions
 */
export class ComplianceHelper {
  /**
   * Check if transaction requires enhanced compliance
   */
  static requiresEnhancedCompliance(transactionType: TransactionType, amount: number): boolean {
    const highValueThresholds = {
      [TransactionType.PAYROLL]: 100000,
      [TransactionType.PAYMENT]: 50000,
      [TransactionType.INVOICE]: 100000,
      [TransactionType.EXPENSE]: 25000,
      [TransactionType.BOOKING]: 10000,
      [TransactionType.INVENTORY]: 50000
    };

    return amount > (highValueThresholds[transactionType] || 10000);
  }

  /**
   * Determine compliance level based on transaction
   */
  static determineComplianceLevel(
    transactionType: TransactionType,
    amount: number,
    jurisdiction: string = 'US'
  ): ComplianceLevel {
    const isHighValue = this.requiresEnhancedCompliance(transactionType, amount);
    const isInternational = jurisdiction !== 'US';
    const isHighRisk = transactionType === TransactionType.PAYROLL || 
                     transactionType === TransactionType.PAYMENT;

    if (isHighValue && isInternational && isHighRisk) {
      return ComplianceLevel.COMPREHENSIVE;
    } else if (isHighValue || isInternational) {
      return ComplianceLevel.ENHANCED;
    } else if (isHighRisk) {
      return ComplianceLevel.STANDARD;
    } else {
      return ComplianceLevel.BASIC;
    }
  }

  /**
   * Get required compliance checks for transaction type
   */
  static getRequiredChecks(transactionType: TransactionType): string[] {
    const checkMap = {
      [TransactionType.PAYROLL]: [
        'irs_compliance',
        'flsa_compliance',
        'state_tax_compliance',
        'minimum_wage_compliance',
        'overtime_compliance'
      ],
      [TransactionType.PAYMENT]: [
        'sox_compliance',
        'pci_compliance',
        'aml_compliance',
        'sanctions_compliance'
      ],
      [TransactionType.INVOICE]: [
        'sox_compliance',
        'tax_compliance',
        'revenue_recognition'
      ],
      [TransactionType.BOOKING]: [
        'business_rule_compliance',
        'pricing_compliance',
        'customer_data_compliance'
      ],
      [TransactionType.INVENTORY]: [
        'cost_accounting_compliance',
        'asset_tracking_compliance',
        'valuation_compliance'
      ]
    };

    return checkMap[transactionType] || ['basic_compliance'];
  }
}

/**
 * Risk assessment helper functions
 */
export class RiskHelper {
  /**
   * Calculate transaction risk score
   */
  static calculateRiskScore(transaction: {
    type: TransactionType;
    amount: number;
    isNewCustomer: boolean;
    isInternational: boolean;
    isHighRiskCountry: boolean;
    isUnusualTime: boolean;
    isHighFrequency: boolean;
  }): number {
    let riskScore = 0;

    // Amount-based risk (0-30 points)
    if (transaction.amount > 1000000) riskScore += 30;
    else if (transaction.amount > 100000) riskScore += 20;
    else if (transaction.amount > 10000) riskScore += 10;

    // Customer-based risk (0-20 points)
    if (transaction.isNewCustomer) riskScore += 20;
    else if (transaction.amount > 50000) riskScore += 10;

    // Geographic risk (0-15 points)
    if (transaction.isInternational) riskScore += 10;
    if (transaction.isHighRiskCountry) riskScore += 15;

    // Time-based risk (0-10 points)
    if (transaction.isUnusualTime) riskScore += 10;

    // Frequency risk (0-15 points)
    if (transaction.isHighFrequency) riskScore += 15;

    // Transaction type risk (0-10 points)
    if (transaction.type === TransactionType.REFUND) riskScore += 10;
    else if (transaction.type === TransactionType.PAYMENT) riskScore += 5;

    return Math.min(riskScore, 100);
  }

  /**
   * Get risk level from score
   */
  static getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Get risk mitigation recommendations
   */
  static getMitigationRecommendations(riskScore: number, riskFactors: string[]): string[] {
    const recommendations: string[] = [];

    if (riskScore >= 80) {
      recommendations.push('Require senior management approval');
      recommendations.push('Implement enhanced monitoring');
      recommendations.push('Consider blocking transaction');
    } else if (riskScore >= 60) {
      recommendations.push('Require additional documentation');
      recommendations.push('Implement manual review process');
      recommendations.push('Enhanced audit trail required');
    } else if (riskScore >= 30) {
      recommendations.push('Require standard approval workflow');
      recommendations.push('Additional verification recommended');
    }

    // Specific recommendations based on risk factors
    if (riskFactors.includes('high_amount')) {
      recommendations.push('Verify transaction purpose and authorization');
    }

    if (riskFactors.includes('new_customer')) {
      recommendations.push('Enhanced customer verification required');
    }

    if (riskFactors.includes('international')) {
      recommendations.push('Compliance with international regulations required');
    }

    if (riskFactors.includes('unusual_time')) {
      recommendations.push('Verify transaction legitimacy');
    }

    return recommendations;
  }
}

/**
 * Audit trail helper functions
 */
export class AuditHelper {
  /**
   * Create standardized audit entry
   */
  static createAuditEntry(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    changes?: any,
    metadata?: any
  ) {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action: action as any,
      entityType,
      entityId,
      changes: changes || [],
      metadata: metadata || {},
      ipAddress: '127.0.0.1', // Would get actual IP
      userAgent: 'Auth-spine Audit System' // Would get actual user agent
    };
  }

  /**
   * Format audit entry for display
   */
  static formatAuditEntry(entry: any): string {
    const timestamp = entry.timestamp.toLocaleString();
    const action = entry.action.toUpperCase();
    const entity = `${entry.entityType}:${entry.entityId}`;
    const user = entry.userId;
    
    return `[${timestamp}] ${action} on ${entity} by ${user}`;
  }

  /**
   * Check if audit entry is suspicious
   */
  static isSuspicious(entry: any): boolean {
    const hour = entry.timestamp.getHours();
    const isUnusualTime = hour < 6 || hour > 22;
    const hasSensitiveChanges = entry.changes.some((change: any) => 
      change.field.toLowerCase().includes('password') ||
      change.field.toLowerCase().includes('ssn') ||
      change.field.toLowerCase().includes('credit')
    );
    
    return isUnusualTime || hasSensitiveChanges;
  }
}

/**
 * Receipt validation helper functions
 */
export class ReceiptHelper {
  /**
   * Validate receipt integrity
   */
  static async validateReceipt(receipt: Receipt): Promise<{
    isValid: boolean;
    issues: string[];
    checksum: string;
  }> {
    const issues: string[] = [];

    // Check required fields
    if (!receipt.id) issues.push('Receipt ID is required');
    if (!receipt.transactionId) issues.push('Transaction ID is required');
    if (!receipt.transactionType) issues.push('Transaction type is required');
    if (!receipt.digitalSignature) issues.push('Digital signature is required');

    // Check validation results
    if (!receipt.validationResults) {
      issues.push('Validation results are required');
    } else if (!receipt.validationResults.isValid) {
      issues.push('Receipt has validation errors');
    }

    // Check compliance
    const nonCompliantChecks = receipt.complianceChecks.filter(c => c.status !== 'compliant');
    if (nonCompliantChecks.length > 0) {
      issues.push(`${nonCompliantChecks.length} compliance checks failed`);
    }

    // Calculate checksum
    const checksum = this.calculateReceiptChecksum(receipt);

    return {
      isValid: issues.length === 0,
      issues,
      checksum
    };
  }

  /**
   * Calculate receipt checksum
   */
  static calculateReceiptChecksum(receipt: Receipt): string {
    const receiptData = {
      id: receipt.id,
      transactionId: receipt.transactionId,
      transactionType: receipt.transactionType,
      amount: receipt.amount,
      currency: receipt.currency,
      timestamp: receipt.timestamp.toISOString(),
      status: receipt.status
    };
    
    // Simple checksum calculation
    let hash = 0;
    const dataString = JSON.stringify(receiptData);
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate receipt summary
   */
  static generateSummary(receipt: Receipt): {
    id: string;
    type: string;
    amount: string;
    status: string;
    complianceScore: number;
    hasErrors: boolean;
    hasWarnings: boolean;
  } {
    const complianceScore = this.calculateComplianceScore(receipt.complianceChecks);
    const hasErrors = receipt.validationResults.errors.length > 0;
    const hasWarnings = receipt.validationResults.warnings.length > 0;

    return {
      id: receipt.id,
      type: receipt.transactionType,
      amount: `${receipt.currency} ${receipt.amount.toFixed(2)}`,
      status: receipt.status,
      complianceScore,
      hasErrors,
      hasWarnings
    };
  }

  /**
   * Calculate compliance score from checks
   */
  static calculateComplianceScore(checks: any[]): number {
    if (checks.length === 0) return 100;
    
    const compliantChecks = checks.filter(check => check.status === 'compliant').length;
    return Math.round((compliantChecks / checks.length) * 100);
  }
}

/**
 * Validation workflow helper functions
 */
export class WorkflowHelper {
  /**
   * Create validation workflow
   */
  static createWorkflow(steps: ValidationStep[]): ValidationWorkflow {
    return {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      steps,
      currentStep: 0,
      status: 'pending',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      results: [],
      errors: []
    };
  }

  /**
   * Execute validation workflow
   */
  static async executeWorkflow(workflow: ValidationWorkflow): Promise<{
    success: boolean;
    results: any[];
    errors: any[];
    completedAt: Date;
  }> {
    workflow.status = 'running';
    workflow.startedAt = new Date();

    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      workflow.currentStep = i;

      try {
        const result = await this.executeStep(step);
        results.push(result);
        
        if (!result.success && step.required) {
          throw new Error(`Required step failed: ${step.name}`);
        }
      } catch (error) {
        errors.push({
          step: step.name,
          error: error.message,
          timestamp: new Date()
        });
        
        if (step.required) {
          workflow.status = 'failed';
          break;
        }
      }
    }

    workflow.status = errors.length === 0 ? 'completed' : 'completed_with_errors';
    workflow.completedAt = new Date();
    workflow.results = results;
    workflow.errors = errors;

    return {
      success: errors.length === 0,
      results,
      errors,
      completedAt: workflow.completedAt
    };
  }

  /**
   * Execute individual validation step
   */
  private static async executeStep(step: ValidationStep): Promise<any> {
    // Mock implementation - would execute actual validation step
    return {
      step: step.name,
      success: true,
      result: 'Step completed successfully',
      timestamp: new Date()
    };
  }
}

// Supporting interfaces
interface ValidationStep {
  name: string;
  type: ValidationType;
  required: boolean;
  parameters: any;
  timeout?: number;
}

interface ValidationWorkflow {
  id: string;
  steps: ValidationStep[];
  currentStep: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'completed_with_errors';
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  results: any[];
  errors: any[];
}
