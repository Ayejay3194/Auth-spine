/**
 * Payroll Service - Core payroll management functionality
 */

import { Employee, PayrollRun, PayrollPeriod, PayrollSettings, PayStub } from './types';
import { PayrollCalculator } from './calculator';
import { DirectDepositManager } from './direct-deposit';

export class PayrollService {
  private calculator: PayrollCalculator;
  private directDepositManager: DirectDepositManager;

  constructor(private settings: PayrollSettings) {
    this.calculator = new PayrollCalculator(settings);
    this.directDepositManager = new DirectDepositManager();
  }

  /**
   * Get all employees
   */
  async getEmployees(): Promise<Employee[]> {
    // Mock implementation - would fetch from database
    return [];
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<Employee | null> {
    // Mock implementation
    return null;
  }

  /**
   * Create new employee
   */
  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: this.generateId()
    };
    
    // Mock implementation - would save to database
    return newEmployee;
  }

  /**
   * Update employee
   */
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    // Mock implementation
    throw new Error('Not implemented');
  }

  /**
   * Get payroll periods
   */
  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    // Mock implementation
    return [];
  }

  /**
   * Create payroll period
   */
  async createPayrollPeriod(period: Omit<PayrollPeriod, 'id'>): Promise<PayrollPeriod> {
    const newPeriod: PayrollPeriod = {
      ...period,
      id: this.generateId()
    };
    
    return newPeriod;
  }

  /**
   * Process payroll for a period
   */
  async processPayroll(periodId: string): Promise<PayrollRun[]> {
    const employees = await this.getEmployees();
    const period = await this.getPayrollPeriod(periodId);
    
    if (!period) {
      throw new Error('Payroll period not found');
    }

    const payrollRuns: PayrollRun[] = [];

    for (const employee of employees) {
      if (employee.status !== 'active') continue;

      const payrollRun = await this.calculateEmployeePayroll(employee, period);
      payrollRuns.push(payrollRun);
    }

    return payrollRuns;
  }

  /**
   * Calculate payroll for a single employee
   */
  async calculateEmployeePayroll(employee: Employee, period: PayrollPeriod): Promise<PayrollRun> {
    const calculation = await this.calculator.calculatePayroll(employee, period);
    
    const payrollRun: PayrollRun = {
      id: this.generateId(),
      periodId: period.id,
      employeeId: employee.id,
      grossPay: calculation.grossPay,
      netPay: calculation.netPay,
      taxes: calculation.taxes,
      deductions: calculation.deductions,
      payDate: period.payDate,
      status: 'pending'
    };

    return payrollRun;
  }

  /**
   * Generate pay stub for payroll run
   */
  async generatePayStub(payrollRunId: string): Promise<PayStub> {
    // Mock implementation
    throw new Error('Not implemented');
  }

  /**
   * Process direct deposits
   */
  async processDirectDeposits(payrollRuns: PayrollRun[]): Promise<void> {
    await this.directDepositManager.processDeposits(payrollRuns);
  }

  /**
   * Get payroll runs for employee
   */
  async getEmployeePayrollRuns(employeeId: string): Promise<PayrollRun[]> {
    // Mock implementation
    return [];
  }

  /**
   * Get payroll runs for period
   */
  async getPeriodPayrollRuns(periodId: string): Promise<PayrollRun[]> {
    // Mock implementation
    return [];
  }

  /**
   * Approve payroll run
   */
  async approvePayrollRun(payrollRunId: string, approverId: string): Promise<void> {
    // Mock implementation - would update status and log approval
  }

  /**
   * Get payroll settings
   */
  async getSettings(): Promise<PayrollSettings> {
    return this.settings;
  }

  /**
   * Update payroll settings
   */
  async updateSettings(updates: Partial<PayrollSettings>): Promise<PayrollSettings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  private generateId(): string {
    return `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export class PayrollProcessor {
  /**
   * Process payroll with error handling and validation
   */
  static async processPayrollBatch(periodId: string): Promise<{
    success: PayrollRun[];
    errors: Array<{ employeeId: string; error: string }>;
  }> {
    const service = new PayrollService({} as PayrollSettings);
    const success: PayrollRun[] = [];
    const errors: Array<{ employeeId: string; error: string }> = [];

    try {
      const payrollRuns = await service.processPayroll(periodId);
      
      for (const run of payrollRuns) {
        try {
          // Validate payroll run
          await this.validatePayrollRun(run);
          success.push(run);
        } catch (error) {
          errors.push({
            employeeId: run.employeeId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      throw new Error(`Payroll processing failed: ${error}`);
    }

    return { success, errors };
  }

  /**
   * Validate payroll run
   */
  private static async validatePayrollRun(payrollRun: PayrollRun): Promise<void> {
    if (payrollRun.grossPay < 0) {
      throw new Error('Gross pay cannot be negative');
    }
    
    if (payrollRun.netPay < 0) {
      throw new Error('Net pay cannot be negative');
    }
    
    if (payrollRun.netPay > payrollRun.grossPay) {
      throw new Error('Net pay cannot exceed gross pay');
    }
  }
}
