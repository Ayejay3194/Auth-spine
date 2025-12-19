/**
 * Validation Service - Core validation and auditing functionality
 */

import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  ValidationMetadata,
  ValidationRule,
  ValidationType,
  ErrorSeverity,
  ErrorCategory,
  ComplianceLevel
} from './types';

export class DataValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validate any business entity with comprehensive checks
   */
  async validateEntity(
    entityType: string, 
    data: any, 
    context: string = 'default'
  ): Promise<ValidationResult> {
    const rules = this.rules.get(entityType) || [];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      if (!rule.isActive) continue;

      try {
        const ruleResult = await this.executeRule(rule, data, context);
        errors.push(...ruleResult.errors);
        warnings.push(...ruleResult.warnings);
      } catch (error) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `Rule execution failed: ${error}`,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.DATA_VALIDATION,
          fixable: false,
          suggestion: 'Contact system administrator'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        validationType: ValidationType.DATA_INTEGRITY,
        businessContext: context,
        complianceLevel: ComplianceLevel.STANDARD,
        auditRequired: errors.some(e => e.severity === ErrorSeverity.CRITICAL),
        autoCorrectable: errors.some(e => e.fixable)
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Validate financial transaction with enhanced security
   */
  async validateFinancialTransaction(transaction: any): Promise<ValidationResult> {
    const baseValidation = await this.validateEntity('financial_transaction', transaction, 'financial');
    
    // Add financial-specific validations
    const financialErrors: ValidationError[] = [];
    const financialWarnings: ValidationWarning[] = [];

    // Amount validation
    if (transaction.amount <= 0) {
      financialErrors.push({
        code: 'INVALID_AMOUNT',
        message: 'Transaction amount must be positive',
        field: 'amount',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: false
      });
    }

    // Currency validation
    if (!transaction.currency || transaction.currency.length !== 3) {
      financialErrors.push({
        code: 'INVALID_CURRENCY',
        message: 'Valid currency code required (3-letter ISO code)',
        field: 'currency',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATA_VALIDATION,
        fixable: true,
        suggestion: 'Use standard currency codes like USD, EUR, GBP'
      });
    }

    return {
      isValid: baseValidation.errors.length === 0 && financialErrors.length === 0,
      errors: [...baseValidation.errors, ...financialErrors],
      warnings: [...baseValidation.warnings, ...financialWarnings],
      metadata: {
        ...baseValidation.metadata,
        validationType: ValidationType.FINANCIAL,
        complianceLevel: ComplianceLevel.ENHANCED,
        auditRequired: true,
        autoCorrectable: false
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Validate payroll calculation with compliance checks
   */
  async validatePayrollCalculation(payrollData: any): Promise<ValidationResult> {
    const baseValidation = await this.validateEntity('payroll', payrollData, 'payroll');
    
    const payrollErrors: ValidationError[] = [];
    const payrollWarnings: ValidationWarning[] = [];

    // Salary validation
    if (payrollData.salary < 0) {
      payrollErrors.push({
        code: 'NEGATIVE_SALARY',
        message: 'Salary cannot be negative',
        field: 'salary',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: false
      });
    }

    // Tax calculation validation
    if (payrollData.taxes && payrollData.taxes.federal < 0) {
      payrollErrors.push({
        code: 'INVALID_TAX_CALCULATION',
        message: 'Federal tax cannot be negative',
        field: 'taxes.federal',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: true,
        suggestion: 'Review tax calculation parameters'
      });
    }

    // Net pay validation
    const calculatedNetPay = payrollData.grossPay - payrollData.taxes.total - 
      payrollData.deductions.reduce((sum: number, d: any) => sum + d.amount, 0);
    
    if (Math.abs(calculatedNetPay - payrollData.netPay) > 0.01) {
      payrollErrors.push({
        code: 'NET_PAY_MISMATCH',
        message: 'Net pay calculation does not match expected value',
        field: 'netPay',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATA_VALIDATION,
        fixable: true,
        suggestion: 'Recalculate net pay from gross pay, taxes, and deductions'
      });
    }

    return {
      isValid: baseValidation.errors.length === 0 && payrollErrors.length === 0,
      errors: [...baseValidation.errors, ...payrollErrors],
      warnings: [...baseValidation.warnings, ...payrollWarnings],
      metadata: {
        ...baseValidation.metadata,
        validationType: ValidationType.COMPLIANCE,
        complianceLevel: ComplianceLevel.COMPREHENSIVE,
        auditRequired: true,
        autoCorrectable: payrollErrors.some(e => e.fixable)
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Validate booking with business rules
   */
  async validateBooking(bookingData: any): Promise<ValidationResult> {
    const baseValidation = await this.validateEntity('booking', bookingData, 'booking');
    
    const bookingErrors: ValidationError[] = [];
    const bookingWarnings: ValidationWarning[] = [];

    // Time validation
    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);
    
    if (startTime >= endTime) {
      bookingErrors.push({
        code: 'INVALID_TIME_RANGE',
        message: 'Start time must be before end time',
        field: 'startTime',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: false
      });
    }

    // Past booking validation
    if (startTime < new Date()) {
      bookingWarnings.push({
        code: 'PAST_BOOKING',
        message: 'Booking time is in the past',
        field: 'startTime',
        category: 'best_practice' as any,
        recommendation: 'Verify if this past booking is intentional'
      });
    }

    return {
      isValid: baseValidation.errors.length === 0 && bookingErrors.length === 0,
      errors: [...baseValidation.errors, ...bookingErrors],
      warnings: [...baseValidation.warnings, ...bookingWarnings],
      metadata: {
        ...baseValidation.metadata,
        validationType: ValidationType.BUSINESS_RULE,
        complianceLevel: ComplianceLevel.STANDARD,
        auditRequired: false,
        autoCorrectable: false
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Validate inventory transaction
   */
  async validateInventoryTransaction(transaction: any): Promise<ValidationResult> {
    const baseValidation = await this.validateEntity('inventory', transaction, 'inventory');
    
    const inventoryErrors: ValidationError[] = [];
    const inventoryWarnings: ValidationWarning[] = [];

    // Stock validation
    if (transaction.quantity < 0) {
      inventoryErrors.push({
        code: 'NEGATIVE_QUANTITY',
        message: 'Transaction quantity cannot be negative',
        field: 'quantity',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: false
      });
    }

    // Stock availability validation
    if (transaction.type === 'out' && transaction.currentStock < transaction.quantity) {
      inventoryErrors.push({
        code: 'INSUFFICIENT_STOCK',
        message: 'Insufficient stock for this transaction',
        field: 'quantity',
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.BUSINESS_LOGIC,
        fixable: false
      });
    }

    return {
      isValid: baseValidation.errors.length === 0 && inventoryErrors.length === 0,
      errors: [...baseValidation.errors, ...inventoryErrors],
      warnings: [...baseValidation.warnings, ...inventoryWarnings],
      metadata: {
        ...baseValidation.metadata,
        validationType: ValidationType.OPERATIONAL,
        complianceLevel: ComplianceLevel.STANDARD,
        auditRequired: transaction.type === 'out',
        autoCorrectable: false
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Add custom validation rule
   */
  addRule(entityType: string, rule: ValidationRule): void {
    if (!this.rules.has(entityType)) {
      this.rules.set(entityType, []);
    }
    this.rules.get(entityType)!.push(rule);
  }

  /**
   * Execute validation rule
   */
  private async executeRule(
    rule: ValidationRule, 
    data: any, 
    context: string
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const condition of rule.conditions) {
      const field = this.getFieldValue(data, condition.field);
      const isValid = this.evaluateCondition(field, condition.operator, condition.value);

      if (!isValid && condition.required) {
        errors.push({
          code: `RULE_${rule.id}_FAILED`,
          message: `Validation rule '${rule.name}' failed for field '${condition.field}'`,
          field: condition.field,
          severity: ErrorSeverity.MEDIUM,
          category: ErrorCategory.DATA_VALIDATION,
          fixable: rule.actions.some(a => a.type === 'auto_correct'),
          suggestion: rule.description
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Get nested field value
   */
  private getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals': return value === expected;
      case 'not_equals': return value !== expected;
      case 'greater_than': return value > expected;
      case 'less_than': return value < expected;
      case 'greater_equal': return value >= expected;
      case 'less_equal': return value <= expected;
      case 'contains': return String(value).includes(expected);
      case 'in': return expected.includes(value);
      case 'not_in': return !expected.includes(value);
      default: return true;
    }
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Financial transaction rules
    this.addRule('financial_transaction', {
      id: 'ft_001',
      name: 'Required Fields',
      description: 'All financial transactions must have required fields',
      type: ValidationType.DATA_INTEGRITY,
      entityType: 'financial_transaction',
      conditions: [
        { field: 'amount', operator: 'greater_than', value: 0, required: true },
        { field: 'currency', operator: 'not_equals', value: null, required: true },
        { field: 'description', operator: 'not_equals', value: null, required: true }
      ],
      actions: [],
      isActive: true,
      priority: 1
    });

    // Payroll rules
    this.addRule('payroll', {
      id: 'pr_001',
      name: 'Employee Validation',
      description: 'Payroll must have valid employee information',
      type: ValidationType.DATA_INTEGRITY,
      entityType: 'payroll',
      conditions: [
        { field: 'employeeId', operator: 'not_equals', value: null, required: true },
        { field: 'payPeriod', operator: 'not_equals', value: null, required: true }
      ],
      actions: [],
      isActive: true,
      priority: 1
    });
  }
}

export class ValidationService {
  private dataValidator: DataValidator;

  constructor() {
    this.dataValidator = new DataValidator();
  }

  /**
   * Comprehensive validation service
   */
  async validate(
    entityType: string, 
    data: any, 
    context: string = 'default'
  ): Promise<ValidationResult> {
    switch (entityType) {
      case 'financial_transaction':
        return await this.dataValidator.validateFinancialTransaction(data);
      case 'payroll':
        return await this.dataValidator.validatePayrollCalculation(data);
      case 'booking':
        return await this.dataValidator.validateBooking(data);
      case 'inventory':
        return await this.dataValidator.validateInventoryTransaction(data);
      default:
        return await this.dataValidator.validateEntity(entityType, data, context);
    }
  }

  /**
   * Batch validation for multiple entities
   */
  async validateBatch(
    entityType: string, 
    entities: any[], 
    context: string = 'batch'
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const entity of entities) {
      const result = await this.validate(entityType, entity, context);
      results.push(result);
    }

    return results;
  }

  /**
   * Get validation statistics
   */
  getValidationStatistics(results: ValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
    criticalErrors: number;
  } {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const invalid = total - valid;
    const withWarnings = results.filter(r => r.warnings.length > 0).length;
    const criticalErrors = results.reduce((sum, r) => 
      sum + r.errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length, 0
    );

    return { total, valid, invalid, withWarnings, criticalErrors };
  }
}
