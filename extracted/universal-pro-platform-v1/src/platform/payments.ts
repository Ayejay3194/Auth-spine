import type { Money, PaymentIntent, ID, ISODateTime } from "../core/types.js";
import { id } from "../core/ids.js";

export interface PaymentProvider {
  createPaymentIntent(input: { bookingId: ID; amount: Money; atUtc: ISODateTime }): PaymentIntent;
  refund(input: { paymentIntentId: ID; atUtc: ISODateTime }): PaymentIntent;
}

export class MockPayments implements PaymentProvider {
  private intents = new Map<ID, PaymentIntent>();

  createPaymentIntent(input: { bookingId: ID; amount: Money; atUtc: ISODateTime }): PaymentIntent {
    const pi: PaymentIntent = { id: id("pi"), bookingId: input.bookingId, amount: input.amount, status: "succeeded", provider: "mock", createdAtUtc: input.atUtc };
    this.intents.set(pi.id, pi);
    return pi;
  }

  refund(input: { paymentIntentId: ID; atUtc: ISODateTime }): PaymentIntent {
    const pi = this.intents.get(input.paymentIntentId);
    if (!pi) throw new Error("payment intent not found");
    const refunded: PaymentIntent = { ...pi, status: "refunded" };
    this.intents.set(refunded.id, refunded);
    return refunded;
  }
}
