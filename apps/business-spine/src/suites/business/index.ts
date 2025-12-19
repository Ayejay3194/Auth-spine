// Business Domain Suite Index
// Exports all business-related functionality
// Organized for clean imports and reduced circular dependencies

// Core Business Modules
export * from './crm';

// Integrated Business Modules (from zips)
// export * from './booking';
// export * from './payroll';
// export * from './financial';
// export * from './analytics';
// export * from './reporting';
// export * from './operations';
// export * from './customer-service';
// export * from './ultimate';
// Note: Additional business modules integrated from zips - uncomment as they're structured

// Business Types
export interface BusinessCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessBooking {
  id: string;
  customerId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  notes?: string;
}

export interface BusinessPayroll {
  id: string;
  employeeId: string;
  period: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
}

export interface BusinessTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  reference?: string;
}

export interface BusinessAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  customerCount: number;
  bookingCount: number;
  period: string;
}

export interface BusinessReport {
  id: string;
  type: 'financial' | 'customer' | 'booking' | 'performance';
  title: string;
  data: Record<string, any>;
  generatedAt: Date;
  period: string;
}

// Business Constants
export const BUSINESS_STATUS = {
  CUSTOMER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PROSPECT: 'prospect'
  },
  BOOKING: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },
  PAYROLL: {
    DRAFT: 'draft',
    APPROVED: 'approved',
    PAID: 'paid'
  },
  TRANSACTION: {
    INCOME: 'income',
    EXPENSE: 'expense'
  }
} as const;

export const BUSINESS_CATEGORIES = {
  REVENUE: [
    'services',
    'products',
    'subscriptions',
    'consulting',
    'other'
  ],
  EXPENSES: [
    'salaries',
    'rent',
    'utilities',
    'marketing',
    'software',
    'travel',
    'supplies',
    'other'
  ]
} as const;

export const BUSINESS_REPORTS = {
  FINANCIAL: 'financial',
  CUSTOMER: 'customer',
  BOOKING: 'booking',
  PERFORMANCE: 'performance'
} as const;
