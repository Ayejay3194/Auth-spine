// Payments Suite - Payment Processing
// Exports payment-related functionality

// Payment Components
export { default as PaymentForm } from './components/PaymentForm';
export { default as PaymentHistory } from './components/PaymentHistory';
export { default as PaymentMethods } from './components/PaymentMethods';

// Integrated Payment Components from zips
// export * from './admin'; // Payment admin tools
// export * from './ops'; // Payment operations
// export * from './instant-payouts-direct-deposit'; // Direct deposit and payouts

// Payment Hooks
export { default as usePayments } from './hooks/usePayments';
export { default as usePaymentMethods } from './hooks/usePaymentMethods';

// Payment Services
export { default as paymentService } from './services/paymentService';

// Payment Types
export interface PaymentProvider {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'square' | 'adyen' | 'custom';
  isActive: boolean;
  configuration: Record<string, any>;
  supportedCurrencies: string[];
  features: string[];
}

export interface PaymentTransaction {
  id: string;
  providerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  customerId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  provider: string;
  isDefault: boolean;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Payment Constants
export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  SQUARE: 'square',
  ADYEN: 'adyen',
  CUSTOM: 'custom'
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;
