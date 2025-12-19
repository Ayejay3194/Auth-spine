/**
 * Validation Utils - Utility functions for validation and auditing
 */

import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ComplianceCheck,
  AuditEntry,
  Receipt,
  RiskLevel,
  ErrorSeverity
} from './types';

export class ValidationUtils {
  /**
   * Deep clone object for validation
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => ValidationUtils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = ValidationUtils.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        if (typeof value === 'string') {
          sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = ValidationUtils.sanitizeInput(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validate currency amount
   */
  static isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           amount >= 0 && 
           amount <= Number.MAX_SAFE_INTEGER &&
           Number.isFinite(amount);
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate instanceof Date && 
           endDate instanceof Date && 
           startDate < endDate &&
           startDate.getTime() > 0 &&
           endDate.getTime() > 0;
  }

  /**
   * Calculate checksum for data integrity
   */
  static calculateChecksum(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate unique identifier
   */
  static generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }

  /**
   * Mask sensitive data
   */
  static maskSensitiveData(data: any, sensitiveFields: string[]): any {
    const masked = ValidationUtils.deepClone(data);
    
    for (const field of sensitiveFields) {
      if (ValidationUtils.hasNestedProperty(masked, field)) {
        ValidationUtils.setNestedProperty(masked, field, '***MASKED***');
      }
    }
    
    return masked;
  }

  /**
   * Check if object has nested property
   */
  static hasNestedProperty(obj: any, path: string): boolean {
    return path.split('.').every(key => obj && typeof obj === 'object' && key in obj);
  }

  /**
   * Set nested property
   */
  static setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey) return;
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  /**
   * Get nested property
   */
  static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date
   */
  static formatDate(date: Date, format: string = 'ISO'): string {
    switch (format) {
      case 'ISO':
        return date.toISOString();
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'EU':
        return date.toLocaleDateString('en-GB');
      case 'readable':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return date.toISOString();
    }
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate tax ID (SSN format)
   */
  static isValidTaxID(taxId: string): boolean {
    // Remove any non-digit characters
    const cleanTaxId = taxId.replace(/\D/g, '');
    
    // Check if it's 9 digits
    if (cleanTaxId.length !== 9) return false;
    
    // Check for invalid patterns
    const invalidPatterns = [
      '000000000',
      '111111111',
      '222222222',
      '333333333',
      '444444444',
      '555555555',
      '666666666',
      '777777777',
      '888888888',
      '999999999',
      '123456789'
    ];
    
    return !invalidPatterns.includes(cleanTaxId);
  }

  /**
   * Validate routing number
   */
  static isValidRoutingNumber(routingNumber: string): boolean {
    // Remove any non-digit characters
    const cleanRouting = routingNumber.replace(/\D/g, '');
    
    // Check if it's 9 digits
    if (cleanRouting.length !== 9) return false;
    
    // Calculate checksum using the standard algorithm
    const digits = cleanRouting.split('').map(Number);
    const checksum = 
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      (digits[2] + digits[5] + digits[8]);
    
    return checksum % 10 === 0;
  }

  /**
   * Validate credit card number
   */
  static isValidCreditCard(cardNumber: string): boolean {
    // Remove any non-digit characters
    const cleanCard = cardNumber.replace(/\D/g, '');
    
    // Check length (typically 13-19 digits)
    if (cleanCard.length < 13 || cleanCard.length > 19) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanCard.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanCard[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Encrypt sensitive data (mock implementation)
   */
  static encryptData(data: string, key: string): string {
    // In production, use proper encryption like AES-256
    return btoa(data + key); // This is NOT secure, just for demo
  }

  /**
   * Decrypt sensitive data (mock implementation)
   */
  static decryptData(encryptedData: string, key: string): string {
    // In production, use proper decryption
    const decrypted = atob(encryptedData);
    return decrypted.replace(key, ''); // This is NOT secure, just for demo
  }

  /**
   * Calculate risk score
   */
  static calculateRiskScore(factors: Array<{ factor: string; weight: number; score: number }>): number {
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * Determine risk level from score
   */
  static getRiskLevel(score: number): RiskLevel {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  /**
   * Merge validation results
   */
  static mergeValidationResults(results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    let isValid = true;
    
    for (const result of results) {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      if (!result.isValid) {
        isValid = false;
      }
    }
    
    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      metadata: {
        validationType: 'merged',
        businessContext: 'multiple',
        complianceLevel: 'standard',
        auditRequired: allErrors.some(e => e.severity === ErrorSeverity.CRITICAL),
        autoCorrectable: allErrors.some(e => e.fixable)
      },
      timestamp: new Date(),
      validatedBy: 'system'
    };
  }

  /**
   * Filter validation errors by severity
   */
  static filterErrorsBySeverity(errors: ValidationError[], severity: ErrorSeverity): ValidationError[] {
    return errors.filter(error => error.severity === severity);
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(results: ValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
    criticalErrors: number;
    highErrors: number;
    mediumErrors: number;
    lowErrors: number;
  } {
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const invalid = total - valid;
    const withWarnings = results.filter(r => r.warnings.length > 0).length;
    
    const allErrors = results.flatMap(r => r.errors);
    const criticalErrors = allErrors.filter(e => e.severity === ErrorSeverity.CRITICAL).length;
    const highErrors = allErrors.filter(e => e.severity === ErrorSeverity.HIGH).length;
    const mediumErrors = allErrors.filter(e => e.severity === ErrorSeverity.MEDIUM).length;
    const lowErrors = allErrors.filter(e => e.severity === ErrorSeverity.LOW).length;
    
    return {
      total,
      valid,
      invalid,
      withWarnings,
      criticalErrors,
      highErrors,
      mediumErrors,
      lowErrors
    };
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

export class AuditUtils {
  /**
   * Create audit entry
   */
  static createAuditEntry(
    entityId: string,
    entityType: string,
    action: string,
    userId: string,
    changes: any[] = [],
    metadata: any = {}
  ): AuditEntry {
    return {
      id: ValidationUtils.generateId('audit'),
      timestamp: new Date(),
      userId,
      action: action as any,
      entityType,
      entityId,
      changes,
      metadata,
      ipAddress: '127.0.0.1', // Would get actual IP
      userAgent: 'Auth-spine Audit System' // Would get actual user agent
    };
  }

  /**
   * Serialize audit entry for storage
   */
  static serializeAuditEntry(entry: AuditEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
      serializedAt: new Date().toISOString()
    });
  }

  /**
   * Deserialize audit entry from storage
   */
  static deserializeAuditEntry(serialized: string): AuditEntry {
    const data = JSON.parse(serialized);
    return {
      ...data,
      timestamp: new Date(data.timestamp)
    };
  }

  /**
   * Calculate audit hash for integrity verification
   */
  static calculateAuditHash(entry: AuditEntry): string {
    const auditData = {
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      changes: entry.changes
    };
    return ValidationUtils.calculateChecksum(auditData);
  }

  /**
   * Verify audit entry integrity
   */
  static verifyAuditIntegrity(entry: AuditEntry, expectedHash: string): boolean {
    const actualHash = this.calculateAuditHash(entry);
    return actualHash === expectedHash;
  }
}

export class ComplianceUtils {
  /**
   * Calculate compliance score
   */
  static calculateComplianceScore(checks: ComplianceCheck[]): number {
    if (checks.length === 0) return 100;
    
    const compliantChecks = checks.filter(check => check.status === 'compliant').length;
    return Math.round((compliantChecks / checks.length) * 100);
  }

  /**
   * Get compliance status
   */
  static getComplianceStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 50) return 'poor';
    return 'critical';
  }

  /**
   * Check if compliance check is overdue
   */
  static isOverdue(check: ComplianceCheck): boolean {
    return new Date() > check.nextReviewDate;
  }

  /**
   * Get days until next review
   */
  static getDaysUntilReview(check: ComplianceCheck): number {
    const now = new Date();
    const nextReview = check.nextReviewDate;
    const diffTime = nextReview.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Prioritize compliance checks
   */
  static prioritizeChecks(checks: ComplianceCheck[]): ComplianceCheck[] {
    return checks.sort((a, b) => {
      // First by overdue status
      const aOverdue = ComplianceUtils.isOverdue(a);
      const bOverdue = ComplianceUtils.isOverdue(b);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Then by next review date
      return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
    });
  }
}
