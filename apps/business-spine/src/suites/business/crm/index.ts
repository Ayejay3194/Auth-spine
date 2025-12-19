// CRM Suite - Customer Relationship Management
// Moved from packages/enterprise/customer-crm-system/

// CRM Components
export { default as CustomerList } from './components/CustomerList';
export { default as CustomerCard } from './components/CustomerCard';
export { default as CustomerForm } from './components/CustomerForm';
export { default as CustomerDetails } from './components/CustomerDetails';
export { default as CustomerSearch } from './components/CustomerSearch';

// CRM Hooks
export { default as useCustomers } from './hooks/useCustomers';
export { default as useCustomer } from './hooks/useCustomer';
export { default as useCustomerSearch } from './hooks/useCustomerSearch';

// CRM Services
export { default as customerService } from './services/customerService';
export { default as crmAnalytics } from './services/crmAnalytics';

// CRM Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
  totalValue: number;
  dealCount: number;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string;
  date: Date;
  duration?: number;
  outcome?: string;
  nextAction?: string;
  createdAt: Date;
}

export interface CustomerDeal {
  id: string;
  customerId: string;
  title: string;
  value: number;
  status: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  topPerformers: Customer[];
  recentActivity: CustomerInteraction[];
}

// CRM Constants
export const CRM_STATUS = {
  CUSTOMER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PROSPECT: 'prospect'
  },
  DEAL: {
    PROSPECT: 'prospect',
    QUALIFIED: 'qualified',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    CLOSED_WON: 'closed-won',
    CLOSED_LOST: 'closed-lost'
  },
  INTERACTION: {
    CALL: 'call',
    EMAIL: 'email',
    MEETING: 'meeting',
    NOTE: 'note'
  }
} as const;

export const CRM_FILTERS = {
  STATUS: ['active', 'inactive', 'prospect'],
  TAGS: ['vip', 'enterprise', 'small-business', 'startup'],
  VALUE_RANGE: {
    LOW: 1000,
    MEDIUM: 10000,
    HIGH: 100000
  }
} as const;
