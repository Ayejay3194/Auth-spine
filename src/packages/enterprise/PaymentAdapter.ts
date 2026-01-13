import type { PaymentIntent, ID, Money, RefundRequest, Refund, PaymentMethod } from '../core/types.js';
import { AppError } from '../core/errors.js';

export interface DatabasePaymentIntent {
  id: string;
  bookingId: string;
  stripePiId?: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    id: string;
    clientId: string;
    providerId: string;
  };
}

export abstract class PaymentAdapter {
  abstract createIntent(bookingId: ID, amount: Money, paymentMethodId?: string): Promise<PaymentIntent>;
  abstract processPayment(paymentIntentId: ID, paymentMethodId: string): Promise<PaymentIntent>;
  abstract refundPayment(request: RefundRequest): Promise<Refund>;
  abstract getPaymentIntent(id: ID): Promise<PaymentIntent | undefined>;
  abstract getPaymentsByBooking(bookingId: ID): Promise<PaymentIntent[]>;
  abstract getRefundsByPayment(paymentIntentId: ID): Promise<Refund[]>;
  abstract addPaymentMethod(userId: ID, paymentMethod: PaymentMethod): Promise<void>;
  abstract getPaymentMethods(userId: ID): Promise<PaymentMethod[]>;
  abstract removePaymentMethod(userId: ID, paymentMethodId: string): Promise<boolean>;
  abstract validatePaymentMethod(paymentMethod: PaymentMethod): boolean;
  abstract calculateProcessingFee(amount: Money, paymentMethodType: PaymentMethod['type']): Money;
  abstract allPaymentIntents(): Promise<PaymentIntent[]>;
  abstract allRefunds(): Promise<Refund[]>;
}

export class PrismaPaymentAdapter extends PaymentAdapter {
  private refunds: Map<string, Refund> = new Map();
  private paymentMethods: Map<string, PaymentMethod[]> = new Map();

  constructor(private prisma: any) {
    super();
  }

  async createIntent(bookingId: ID, amount: Money, paymentMethodId?: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.create({
        data: {
          bookingId,
          amountCents: amount.amountCents,
          currency: amount.currency,
          status: 'pending'
        },
        include: {
          booking: true
        }
      });

      return this.mapToPaymentIntent(paymentIntent);
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new AppError('Booking not found', 'NOT_FOUND', 404);
      }
      throw new AppError('Failed to create payment intent', 'DATABASE_ERROR', 500);
    }
  }

  async processPayment(paymentIntentId: ID, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id: paymentIntentId }
      });

      if (!paymentIntent) {
        throw new AppError('Payment intent not found', 'NOT_FOUND', 404);
      }

      if (paymentIntent.status !== 'pending') {
        throw new AppError('Payment cannot be processed', 'INVALID_STATE', 400);
      }

      // Update to processing
      await this.prisma.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'processing' }
      });

      // Simulate async processing - in real implementation, integrate with Stripe
      setTimeout(async () => {
        try {
          await this.prisma.paymentIntent.update({
            where: { id: paymentIntentId },
            data: { 
              status: 'succeeded',
              stripePiId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          });
        } catch (error) {
          console.error('Failed to update payment status:', error);
        }
      }, 1000);

      // Return the processing state
      paymentIntent.status = 'processing';
      return this.mapToPaymentIntent(paymentIntent);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process payment', 'DATABASE_ERROR', 500);
    }
  }

  async refundPayment(request: RefundRequest): Promise<Refund> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id: request.paymentIntentId }
      });

      if (!paymentIntent) {
        throw new AppError('Payment intent not found', 'NOT_FOUND', 404);
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new AppError('Cannot refund incomplete payment', 'INVALID_STATE', 400);
      }

      const refundAmount = request.amount || {
        currency: paymentIntent.currency,
        amountCents: paymentIntent.amountCents
      };

      const refund: Refund = {
        id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId: request.paymentIntentId,
        amount: refundAmount,
        reason: request.reason,
        status: 'pending',
        createdAtUtc: new Date().toISOString()
      };

      // Store refund in memory (in real implementation, would be in database)
      this.refunds.set(refund.id, refund);

      // Simulate async refund processing
      setTimeout(() => {
        refund.status = 'processed';
        refund.processedAtUtc = new Date().toISOString();
        this.refunds.set(refund.id, refund);
      }, 2000);

      return refund;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process refund', 'DATABASE_ERROR', 500);
    }
  }

  async getPaymentIntent(id: ID): Promise<PaymentIntent | undefined> {
    try {
      const paymentIntent = await this.prisma.paymentIntent.findUnique({
        where: { id },
        include: { booking: true }
      });

      return paymentIntent ? this.mapToPaymentIntent(paymentIntent) : undefined;
    } catch (error) {
      throw new AppError('Failed to get payment intent', 'DATABASE_ERROR', 500);
    }
  }

  async getPaymentsByBooking(bookingId: ID): Promise<PaymentIntent[]> {
    try {
      const paymentIntents = await this.prisma.paymentIntent.findMany({
        where: { bookingId },
        include: { booking: true },
        orderBy: { createdAt: 'desc' }
      });

      return paymentIntents.map((pi: DatabasePaymentIntent) => this.mapToPaymentIntent(pi));
    } catch (error) {
      throw new AppError('Failed to get payments by booking', 'DATABASE_ERROR', 500);
    }
  }

  async getRefundsByPayment(paymentIntentId: ID): Promise<Refund[]> {
    try {
      return Array.from(this.refunds.values())
        .filter(refund => refund.paymentIntentId === paymentIntentId);
    } catch (error) {
      throw new AppError('Failed to get refunds by payment', 'DATABASE_ERROR', 500);
    }
  }

  async addPaymentMethod(userId: ID, paymentMethod: PaymentMethod): Promise<void> {
    try {
      const methods = this.paymentMethods.get(userId) || [];
      methods.push(paymentMethod);
      this.paymentMethods.set(userId, methods);
    } catch (error) {
      throw new AppError('Failed to add payment method', 'DATABASE_ERROR', 500);
    }
  }

  async getPaymentMethods(userId: ID): Promise<PaymentMethod[]> {
    try {
      return this.paymentMethods.get(userId) || [];
    } catch (error) {
      throw new AppError('Failed to get payment methods', 'DATABASE_ERROR', 500);
    }
  }

  async removePaymentMethod(userId: ID, paymentMethodId: string): Promise<boolean> {
    try {
      const methods = this.paymentMethods.get(userId) || [];
      const index = methods.findIndex(m => m.id === paymentMethodId);
      if (index > -1) {
        methods.splice(index, 1);
        this.paymentMethods.set(userId, methods);
        return true;
      }
      return false;
    } catch (error) {
      throw new AppError('Failed to remove payment method', 'DATABASE_ERROR', 500);
    }
  }

  validatePaymentMethod(paymentMethod: PaymentMethod): boolean {
    return !!(paymentMethod.id && paymentMethod.type && paymentMethod.provider);
  }

  calculateProcessingFee(amount: Money, paymentMethodType: PaymentMethod['type']): Money {
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

  async allPaymentIntents(): Promise<PaymentIntent[]> {
    try {
      const paymentIntents = await this.prisma.paymentIntent.findMany({
        include: { booking: true },
        orderBy: { createdAt: 'desc' }
      });

      return paymentIntents.map((pi: DatabasePaymentIntent) => this.mapToPaymentIntent(pi));
    } catch (error) {
      throw new AppError('Failed to get all payment intents', 'DATABASE_ERROR', 500);
    }
  }

  async allRefunds(): Promise<Refund[]> {
    try {
      return Array.from(this.refunds.values());
    } catch (error) {
      throw new AppError('Failed to get all refunds', 'DATABASE_ERROR', 500);
    }
  }

  private mapToPaymentIntent(paymentIntent: DatabasePaymentIntent): PaymentIntent {
    return {
      id: paymentIntent.id,
      bookingId: paymentIntent.bookingId,
      amount: {
        currency: paymentIntent.currency,
        amountCents: paymentIntent.amountCents
      },
      status: paymentIntent.status as PaymentIntent['status'],
      paymentMethodId: undefined, // Would be stored separately
      createdAtUtc: paymentIntent.createdAt.toISOString(),
      processedAtUtc: paymentIntent.status === 'succeeded' ? paymentIntent.updatedAt.toISOString() : undefined
    };
  }
}
