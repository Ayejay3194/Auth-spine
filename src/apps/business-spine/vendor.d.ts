export interface Vendor {
    id: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    logo: string;
    website: string;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    commissionRate: number;
    bankAccount: {
        accountHolder: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
    };
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    lastPayoutDate: Date;
    nextPayoutDate: Date;
    totalEarnings: number;
    totalPayouts: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Commission {
    id: string;
    vendorId: string;
    transactionId: string;
    amount: number;
    rate: number;
    status: 'pending' | 'calculated' | 'paid';
    createdAt: Date;
    paidAt?: Date;
}
export interface Payout {
    id: string;
    vendorId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    bankAccount: Vendor['bankAccount'];
    transactionId?: string;
    createdAt: Date;
    completedAt?: Date;
}
export interface VendorTransaction {
    id: string;
    vendorId: string;
    bookingId: string;
    amount: number;
    commissionAmount: number;
    status: 'completed' | 'refunded' | 'disputed';
    createdAt: Date;
}
export declare function createVendor(vendor: Vendor): void;
export declare function getVendor(vendorId: string): Vendor | undefined;
export declare function listVendors(): Vendor[];
export declare function updateVendor(vendorId: string, updates: Partial<Vendor>): void;
export declare function calculateCommission(vendorId: string, transactionAmount: number): number;
export declare function createCommission(commission: Commission): void;
export declare function getVendorCommissions(vendorId: string): Commission[];
export declare function getVendorEarnings(vendorId: string): number;
export declare function createTransaction(transaction: VendorTransaction): void;
export declare function createPayout(payout: Payout): void;
export declare function getVendorPayouts(vendorId: string): Payout[];
export declare function processPayout(payoutId: string): void;
export declare function completePayout(payoutId: string, transactionId: string): void;
export declare function calculateNextPayoutDate(schedule: string): Date;
export declare function getVendorBalance(vendorId: string): number;
//# sourceMappingURL=vendor.d.ts.map