/**
 * Payroll Utils - Utility functions for payroll operations
 */

import { Employee, PayrollRun, TaxInfo } from './types';

export class PayrollUtils {
  /**
   * Calculate overtime hours
   */
  static calculateOvertime(hoursWorked: number, overtimeThreshold: number = 40): number {
    return Math.max(0, hoursWorked - overtimeThreshold);
  }

  /**
   * Calculate overtime pay
   */
  static calculateOvertimePay(regularPay: number, overtimeHours: number, overtimeRate: number = 1.5): number {
    return regularPay * overtimeHours * overtimeRate;
  }

  /**
   * Validate employee data
   */
  static validateEmployee(employee: Partial<Employee>): string[] {
    const errors: string[] = [];

    if (!employee.firstName || employee.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!employee.lastName || employee.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!employee.email || employee.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (employee.salary !== undefined && employee.salary < 0) {
      errors.push('Salary cannot be negative');
    }

    return errors;
  }

  /**
   * Validate tax info
   */
  static validateTaxInfo(taxInfo: Partial<TaxInfo>): string[] {
    const errors: string[] = [];

    if (!taxInfo.federalFilingStatus) {
      errors.push('Federal filing status is required');
    }

    if (taxInfo.federalAllowances !== undefined && taxInfo.federalAllowances < 0) {
      errors.push('Federal allowances cannot be negative');
    }

    if (taxInfo.additionalWithholding !== undefined && taxInfo.additionalWithholding < 0) {
      errors.push('Additional withholding cannot be negative');
    }

    return errors;
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Calculate pay period dates
   */
  static calculatePayPeriodDates(frequency: string, startDate: Date): Array<{
    startDate: Date;
    endDate: Date;
    payDate: Date;
  }> {
    // Mock implementation
    return [{
      startDate,
      endDate: new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000)),
      payDate: new Date(startDate.getTime() + (16 * 24 * 60 * 60 * 1000))
    }];
  }

  /**
   * Generate payroll run ID
   */
  static generatePayrollRunId(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `PR-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Check if payroll run is within processing window
   */
  static isWithinProcessingWindow(payDate: Date, processingDays: number = 2): boolean {
    const now = new Date();
    const processingDeadline = new Date(payDate.getTime() - (processingDays * 24 * 60 * 60 * 1000));
    return now <= processingDeadline;
  }
}
