/**
 * Payroll Calculator - Payroll calculations and tax computations
 */

import { Employee, PayrollPeriod, PayrollRun, TaxBreakdown, DeductionBreakdown } from './types';

export class PayrollCalculator {
  constructor(private settings: any) {}

  /**
   * Calculate payroll for an employee
   */
  async calculatePayroll(employee: Employee, period: PayrollPeriod): Promise<{
    grossPay: number;
    netPay: number;
    taxes: TaxBreakdown;
    deductions: DeductionBreakdown[];
  }> {
    // Calculate gross pay
    const grossPay = this.calculateGrossPay(employee, period);
    
    // Calculate taxes
    const taxes = this.calculateTaxes(grossPay, employee.taxInfo);
    
    // Calculate deductions
    const deductions = this.calculateDeductions(employee, grossPay);
    
    // Calculate net pay
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netPay = grossPay - taxes.total - totalDeductions;

    return {
      grossPay,
      netPay,
      taxes,
      deductions
    };
  }

  /**
   * Calculate gross pay
   */
  private calculateGrossPay(employee: Employee, period: PayrollPeriod): number {
    // Mock calculation based on pay frequency
    switch (employee.payFrequency) {
      case 'weekly':
        return employee.salary / 52;
      case 'biweekly':
        return employee.salary / 26;
      case 'semimonthly':
        return employee.salary / 24;
      case 'monthly':
        return employee.salary / 12;
      default:
        return employee.salary;
    }
  }

  /**
   * Calculate taxes
   */
  private calculateTaxes(grossPay: number, taxInfo: any): TaxBreakdown {
    // Mock tax calculations
    const federal = Math.round(grossPay * 0.15);
    const state = Math.round(grossPay * 0.05);
    const local = Math.round(grossPay * 0.01);
    const socialSecurity = Math.round(grossPay * 0.062);
    const medicare = Math.round(grossPay * 0.0145);
    const unemployment = Math.round(grossPay * 0.006);
    
    const total = federal + state + local + socialSecurity + medicare + unemployment;

    return {
      federal,
      state,
      local,
      socialSecurity,
      medicare,
      unemployment,
      total
    };
  }

  /**
   * Calculate deductions
   */
  private calculateDeductions(employee: Employee, grossPay: number): DeductionBreakdown[] {
    return employee.deductions.map(deduction => ({
      deductionId: deduction.id,
      name: deduction.name,
      amount: deduction.isPercentage ? Math.round(grossPay * (deduction.amount / 100)) : deduction.amount,
      type: deduction.type
    }));
  }

  /**
   * Calculate year-to-date totals
   */
  async calculateYearToDate(employeeId: string, payrollRunId: string): Promise<any> {
    // Mock implementation
    return {
      grossPay: 0,
      netPay: 0,
      taxes: this.calculateTaxes(0, {}),
      deductions: 0
    };
  }
}
