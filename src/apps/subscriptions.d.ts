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
export declare function initializeDefaultPlans(): void;
export declare function getPlan(planId: string): SubscriptionPlan | undefined;
export declare function listPlans(): SubscriptionPlan[];
export declare function createSubscription(subscription: Subscription): void;
export declare function getSubscription(subscriptionId: string): Subscription | undefined;
export declare function getTenantSubscription(tenantId: string): Subscription | undefined;
export declare function updateSubscription(subscriptionId: string, updates: Partial<Subscription>): void;
export declare function cancelSubscription(subscriptionId: string): void;
export declare function createInvoice(invoice: Invoice): void;
export declare function getInvoice(invoiceId: string): Invoice | undefined;
export declare function getTenantInvoices(tenantId: string): Invoice[];
export declare function markInvoiceAsPaid(invoiceId: string, paidDate?: Date): void;
//# sourceMappingURL=subscriptions.d.ts.map