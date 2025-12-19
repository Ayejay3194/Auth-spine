export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    users: number;
    bookings: number;
    storage: number;
    apiCalls: number;
  };
  createdAt: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentMethodId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const plans = new Map<string, SubscriptionPlan>();
const subscriptions = new Map<string, Subscription>();
const invoices = new Map<string, Invoice>();

// Default plans
export function initializeDefaultPlans(): void {
  const freePlan: SubscriptionPlan = {
    id: 'plan_free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly',
    features: ['Basic booking', 'Email notifications', 'Basic reporting'],
    limits: { users: 1, bookings: 100, storage: 1000, apiCalls: 1000 },
    createdAt: new Date(),
  };

  const proPlan: SubscriptionPlan = {
    id: 'plan_pro',
    name: 'Pro',
    description: 'For growing businesses',
    price: 99,
    currency: 'USD',
    billingCycle: 'monthly',
    features: [
      'Unlimited bookings',
      'Email & SMS notifications',
      'Advanced reporting',
      'Staff management',
      'Payment processing',
    ],
    limits: { users: 5, bookings: 10000, storage: 50000, apiCalls: 100000 },
    createdAt: new Date(),
  };

  const enterprisePlan: SubscriptionPlan = {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 499,
    currency: 'USD',
    billingCycle: 'yearly',
    features: [
      'Everything in Pro',
      'Multi-tenancy',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    limits: { users: 999, bookings: 999999, storage: 999999, apiCalls: 999999 },
    createdAt: new Date(),
  };

  plans.set(freePlan.id, freePlan);
  plans.set(proPlan.id, proPlan);
  plans.set(enterprisePlan.id, enterprisePlan);
}

export function getPlan(planId: string): SubscriptionPlan | undefined {
  return plans.get(planId);
}

export function listPlans(): SubscriptionPlan[] {
  return Array.from(plans.values());
}

export function createSubscription(subscription: Subscription): void {
  subscriptions.set(subscription.id, subscription);
}

export function getSubscription(subscriptionId: string): Subscription | undefined {
  return subscriptions.get(subscriptionId);
}

export function getTenantSubscription(tenantId: string): Subscription | undefined {
  for (const sub of subscriptions.values()) {
    if (sub.tenantId === tenantId && sub.status === 'active') {
      return sub;
    }
  }
  return undefined;
}

export function updateSubscription(subscriptionId: string, updates: Partial<Subscription>): void {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    Object.assign(sub, updates, { updatedAt: new Date() });
  }
}

export function cancelSubscription(subscriptionId: string): void {
  const sub = subscriptions.get(subscriptionId);
  if (sub) {
    sub.status = 'cancelled';
    sub.updatedAt = new Date();
  }
}

export function createInvoice(invoice: Invoice): void {
  invoices.set(invoice.id, invoice);
}

export function getInvoice(invoiceId: string): Invoice | undefined {
  return invoices.get(invoiceId);
}

export function getTenantInvoices(tenantId: string): Invoice[] {
  return Array.from(invoices.values()).filter(inv => inv.tenantId === tenantId);
}

export function markInvoiceAsPaid(invoiceId: string, paidDate: Date = new Date()): void {
  const invoice = invoices.get(invoiceId);
  if (invoice) {
    invoice.status = 'paid';
    invoice.paidDate = paidDate;
    invoice.updatedAt = new Date();
  }
}
