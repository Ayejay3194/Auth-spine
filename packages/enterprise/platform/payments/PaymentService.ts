import type { PaymentIntent, ID, Money, Booking } from "../core/types.js";
import { MemoryKV } from "../core/store.js";
import { id } from "../core/ids.js";
import { AppError } from "../core/errors.js";

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet";
  provider: string;
  metadata: Record<string, any>;
}

export interface RefundRequest {
  paymentIntentId: ID;
  amount?: Money;
  reason: string;
}

export interface Refund {
  id: ID;
  paymentIntentId: ID;
  amount: Money;
  reason: string;
  status: "pending" | "processed" | "failed";
  createdAtUtc: string;
  processedAtUtc?: string;
}

export class PaymentService {
  private kv = new MemoryKV<PaymentIntent>();
  private refunds = new MemoryKV<Refund>();
  private paymentMethods = new Map<ID, PaymentMethod[]>();

  async createIntent(
    bookingId: ID,
    amount: Money,
    paymentMethodId?: string
  ): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: id("payment"),
      bookingId,
      amount,
      status: "pending",
      paymentMethodId,
      createdAtUtc: new Date().toISOString(),
    };

    this.kv.set(intent);
    return intent;
  }

  async processPayment(
    paymentIntentId: ID,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    const intent = this.kv.get(paymentIntentId);
    if (!intent) {
      throw new AppError("Payment intent not found", "NOT_FOUND", 404);
    }
    if (intent.status !== "pending") {
      throw new AppError("Payment cannot be processed", "INVALID_STATE", 400);
    }

    // Mock payment processing - in real implementation, integrate with Stripe/PayPal
    intent.status = "processing";
    this.kv.set(intent);

    // Simulate async processing
    setTimeout(() => {
      intent.status = "completed";
      intent.processedAtUtc = new Date().toISOString();
      this.kv.set(intent);
    }, 1000);

    return intent;
  }

  async refundPayment(request: RefundRequest): Promise<Refund> {
    const paymentIntent = this.kv.get(request.paymentIntentId);
    if (!paymentIntent) {
      throw new AppError("Payment intent not found", "NOT_FOUND", 404);
    }
    if (paymentIntent.status !== "completed") {
      throw new AppError("Cannot refund incomplete payment", "INVALID_STATE", 400);
    }

    const refundAmount = request.amount || paymentIntent.amount;
    
    const refund: Refund = {
      id: id("refund"),
      paymentIntentId: request.paymentIntentId,
      amount: refundAmount,
      reason: request.reason,
      status: "pending",
      createdAtUtc: new Date().toISOString(),
    };

    this.refunds.set(refund);

    // Simulate async refund processing
    setTimeout(() => {
      refund.status = "processed";
      refund.processedAtUtc = new Date().toISOString();
      this.refunds.set(refund);
    }, 2000);

    return refund;
  }

  getPaymentIntent(id: ID): PaymentIntent | undefined {
    return this.kv.get(id);
  }

  getRefund(id: ID): Refund | undefined {
    return this.refunds.get(id);
  }

  getPaymentsByBooking(bookingId: ID): PaymentIntent[] {
    return this.kv.values().filter(p => p.bookingId === bookingId);
  }

  getRefundsByPayment(paymentIntentId: ID): Refund[] {
    return this.refunds.values().filter(r => r.paymentIntentId === paymentIntentId);
  }

  async addPaymentMethod(userId: ID, paymentMethod: PaymentMethod): Promise<void> {
    const methods = this.paymentMethods.get(userId) || [];
    methods.push(paymentMethod);
    this.paymentMethods.set(userId, methods);
  }

  getPaymentMethods(userId: ID): PaymentMethod[] {
    return this.paymentMethods.get(userId) || [];
  }

  removePaymentMethod(userId: ID, paymentMethodId: string): boolean {
    const methods = this.paymentMethods.get(userId) || [];
    const index = methods.findIndex(m => m.id === paymentMethodId);
    if (index > -1) {
      methods.splice(index, 1);
      this.paymentMethods.set(userId, methods);
      return true;
    }
    return false;
  }

  // Mock payment validation
  validatePaymentMethod(paymentMethod: PaymentMethod): boolean {
    // Basic validation - in real implementation, validate with payment provider
    return !!(paymentMethod.id && paymentMethod.type && paymentMethod.provider);
  }

  // Calculate processing fees
  calculateProcessingFee(amount: Money, paymentMethodType: PaymentMethod["type"]): Money {
    let feePercent = 0.029; // Default 2.9%
    let fixedFee = 30; // $0.30 in cents

    switch (paymentMethodType) {
      case "card":
        feePercent = 0.029;
        fixedFee = 30;
        break;
      case "bank":
        feePercent = 0.008; // 0.8% for ACH
        fixedFee = 0;
        break;
      case "wallet":
        feePercent = 0.025; // 2.5% for digital wallets
        fixedFee = 10;
        break;
    }

    const feeAmount = Math.round(amount.amountCents * feePercent) + fixedFee;
    
    return {
      currency: amount.currency,
      amountCents: feeAmount
    };
  }

  allPaymentIntents(): PaymentIntent[] {
    return this.kv.values();
  }

  allRefunds(): Refund[] {
    return this.refunds.values();
  }
}
