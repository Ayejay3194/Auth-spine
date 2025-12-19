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

const vendors = new Map<string, Vendor>();
const commissions = new Map<string, Commission>();
const payouts = new Map<string, Payout>();
const transactions = new Map<string, VendorTransaction>();

export function createVendor(vendor: Vendor): void {
  vendors.set(vendor.id, vendor);
}

export function getVendor(vendorId: string): Vendor | undefined {
  return vendors.get(vendorId);
}

export function listVendors(): Vendor[] {
  return Array.from(vendors.values());
}

export function updateVendor(vendorId: string, updates: Partial<Vendor>): void {
  const vendor = vendors.get(vendorId);
  if (vendor) {
    Object.assign(vendor, updates, { updatedAt: new Date() });
  }
}

export function calculateCommission(vendorId: string, transactionAmount: number): number {
  const vendor = getVendor(vendorId);
  if (!vendor) return 0;
  return (transactionAmount * vendor.commissionRate) / 100;
}

export function createCommission(commission: Commission): void {
  commissions.set(commission.id, commission);
}

export function getVendorCommissions(vendorId: string): Commission[] {
  return Array.from(commissions.values()).filter(c => c.vendorId === vendorId);
}

export function getVendorEarnings(vendorId: string): number {
  const vendorCommissions = getVendorCommissions(vendorId);
  return vendorCommissions.reduce((total, c) => total + c.amount, 0);
}

export function createTransaction(transaction: VendorTransaction): void {
  transactions.set(transaction.id, transaction);

  // Auto-create commission
  const commission: Commission = {
    id: `commission_${Date.now()}`,
    vendorId: transaction.vendorId,
    transactionId: transaction.id,
    amount: transaction.commissionAmount,
    rate: (transaction.commissionAmount / transaction.amount) * 100,
    status: 'pending',
    createdAt: new Date(),
  };

  createCommission(commission);

  // Update vendor earnings
  const vendor = getVendor(transaction.vendorId);
  if (vendor) {
    vendor.totalEarnings += transaction.commissionAmount;
  }
}

export function createPayout(payout: Payout): void {
  payouts.set(payout.id, payout);
}

export function getVendorPayouts(vendorId: string): Payout[] {
  return Array.from(payouts.values()).filter(p => p.vendorId === vendorId);
}

export function processPayout(payoutId: string): void {
  const payout = payouts.get(payoutId);
  if (payout) {
    payout.status = 'processing';
  }
}

export function completePayout(payoutId: string, transactionId: string): void {
  const payout = payouts.get(payoutId);
  if (payout) {
    payout.status = 'completed';
    payout.transactionId = transactionId;
    payout.completedAt = new Date();

    // Update vendor
    const vendor = getVendor(payout.vendorId);
    if (vendor) {
      vendor.totalPayouts += payout.amount;
      vendor.lastPayoutDate = new Date();
      vendor.nextPayoutDate = calculateNextPayoutDate(vendor.payoutSchedule);
    }
  }
}

export function calculateNextPayoutDate(schedule: string): Date {
  const date = new Date();
  switch (schedule) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }
  return date;
}

export function getVendorBalance(vendorId: string): number {
  const earnings = getVendorEarnings(vendorId);
  const payouts = getVendorPayouts(vendorId).reduce((total, p) => {
    if (p.status === 'completed') {
      return total + p.amount;
    }
    return total;
  }, 0);
  return earnings - payouts;
}
