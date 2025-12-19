/**
 * Payroll System Type Definitions
 * 
 * Comprehensive type definitions for the enterprise payroll system
 * with strict typing for maximum type safety and compliance.
 */

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  position: string;
  hireDate: Date;
  salary: number;
  payFrequency: PayFrequency;
  bankAccount?: BankAccount;
  taxInfo: TaxInfo;
  deductions: Deduction[];
  status: 'active' | 'inactive' | 'terminated';
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
}

export interface TaxInfo {
  federalFilingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  federalAllowances: number;
  stateFilingStatus: string;
  stateAllowances: number;
  additionalWithholding: number;
}

export interface Deduction {
  id: string;
  name: string;
  type: 'pre_tax' | 'post_tax';
  amount: number;
  isPercentage: boolean;
  calculation: 'fixed' | 'percentage';
}

export interface PayrollPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: PayFrequency;
}

export interface PayrollRun {
  id: string;
  periodId: string;
  employeeId: string;
  grossPay: number;
  netPay: number;
  taxes: TaxBreakdown;
  deductions: DeductionBreakdown[];
  payDate: Date;
  status: 'pending' | 'processed' | 'paid' | 'failed';
  payStubId?: string;
}

export interface TaxBreakdown {
  federal: number;
  state: number;
  local: number;
  socialSecurity: number;
  medicare: number;
  unemployment: number;
  total: number;
}

export interface DeductionBreakdown {
  deductionId: string;
  name: string;
  amount: number;
  type: 'pre_tax' | 'post_tax';
}

export interface PayStub {
  id: string;
  employeeId: string;
  payrollRunId: string;
  payPeriod: PayrollPeriod;
  grossPay: number;
  netPay: number;
  taxes: TaxBreakdown;
  deductions: DeductionBreakdown[];
  yearToDate: YearToDateTotals;
  generatedAt: Date;
}

export interface YearToDateTotals {
  grossPay: number;
  netPay: number;
  taxes: TaxBreakdown;
  deductions: number;
}

export interface PayrollReport {
  id: string;
  type: 'payroll_summary' | 'tax_liability' | 'deduction_report' | 'cost_analysis';
  period: PayrollPeriod;
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface PayrollSettings {
  payFrequency: PayFrequency;
  taxYear: number;
  federalTaxRates: TaxRate[];
  stateTaxRates: TaxRate[];
  deductionTypes: DeductionType[];
  approvalRequired: boolean;
  approvers: string[];
}

export interface TaxRate {
  min: number;
  max: number | null;
  rate: number;
  bracket: string;
}

export interface DeductionType {
  id: string;
  name: string;
  type: 'pre_tax' | 'post_tax';
  isPercentage: boolean;
  defaultAmount?: number;
  description: string;
  isActive: boolean;
}

export enum PayFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  SEMIMONTHLY = 'semimonthly',
  MONTHLY = 'monthly'
}

export interface DirectDeposit {
  id: string;
  employeeId: string;
  bankAccount: BankAccount;
  amount: number;
  isSplitDeposit: boolean;
  splitDeposits?: SplitDeposit[];
  status: 'active' | 'inactive';
}

export interface SplitDeposit {
  bankAccount: BankAccount;
  amount: number;
  isPercentage: boolean;
}

export interface PayrollAnalytics {
  totalPayrollCost: number;
  averageSalary: number;
  taxBurden: number;
  deductionRate: number;
  departmentBreakdown: Array<{
    department: string;
    totalCost: number;
    employeeCount: number;
    averageSalary: number;
  }>;
  employeeCount: number;
  overtimeCost: number;
  benefitsCost: number;
}
