/**
 * Payroll Configuration - Default configurations for payroll system
 */

import { PayrollSettings, TaxRate, DeductionType, PayFrequency } from './types';

export const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  payFrequency: PayFrequency.BIWEEKLY,
  taxYear: new Date().getFullYear(),
  federalTaxRates: [
    { min: 0, max: 11000, rate: 0.10, bracket: '10%' },
    { min: 11001, max: 44725, rate: 0.12, bracket: '12%' },
    { min: 44726, max: 95375, rate: 0.22, bracket: '22%' },
    { min: 95376, max: 182050, rate: 0.24, bracket: '24%' },
    { min: 182051, max: 231250, rate: 0.32, bracket: '32%' },
    { min: 231251, max: 578125, rate: 0.35, bracket: '35%' },
    { min: 578126, max: null, rate: 0.37, bracket: '37%' }
  ],
  stateTaxRates: [],
  deductionTypes: [
    {
      id: 'health_insurance',
      name: 'Health Insurance',
      type: 'pre_tax',
      isPercentage: false,
      defaultAmount: 200,
      description: 'Employee health insurance premium',
      isActive: true
    },
    {
      id: '401k',
      name: '401(k) Contribution',
      type: 'pre_tax',
      isPercentage: true,
      defaultAmount: 5,
      description: 'Retirement savings contribution',
      isActive: true
    },
    {
      id: 'dental_insurance',
      name: 'Dental Insurance',
      type: 'post_tax',
      isPercentage: false,
      defaultAmount: 50,
      description: 'Dental insurance premium',
      isActive: true
    }
  ],
  approvalRequired: true,
  approvers: ['admin', 'hr_manager']
};

export const DEFAULT_DEDUCTION_TYPES = {
  PRE_TAX: 'Pre-tax deductions (reduce taxable income)',
  POST_TAX: 'Post-tax deductions (deducted after taxes)'
} as const;

export const DEFAULT_PAY_FREQUENCIES = {
  WEEKLY: '52 pay periods per year',
  BIWEEKLY: '26 pay periods per year',
  SEMIMONTHLY: '24 pay periods per year',
  MONTHLY: '12 pay periods per year'
} as const;
