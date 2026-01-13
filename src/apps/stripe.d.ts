import Stripe from 'stripe';
export interface PaymentIntentInput {
    amount: number;
    currency: string;
    customerId?: string;
    description?: string;
    metadata?: Record<string, string>;
}
export interface PaymentMethodInput {
    type: 'card' | 'bank_account';
    customerId: string;
    paymentMethodId: string;
}
export declare const createPaymentIntent: (input: PaymentIntentInput) => Promise<{
    ok: boolean;
    data: any;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    data?: undefined;
}>;
export declare const confirmPayment: (paymentIntentId: string, paymentMethodId: string) => Promise<{
    ok: boolean;
    data: any;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    data?: undefined;
}>;
export declare const createCustomer: (email: string, name?: string) => Promise<{
    ok: boolean;
    data: any;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    data?: undefined;
}>;
export declare const attachPaymentMethod: (paymentMethodId: string, customerId: string) => Promise<{
    ok: boolean;
    data: any;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    data?: undefined;
}>;
export declare const createSubscription: (customerId: string, priceId: string, metadata?: Record<string, string>) => Promise<{
    ok: boolean;
    data: any;
    error?: undefined;
} | {
    ok: boolean;
    error: string;
    data?: undefined;
}>;
export declare const handleWebhook: (event: Stripe.Event) => Promise<{
    ok: boolean;
}>;
//# sourceMappingURL=stripe.d.ts.map