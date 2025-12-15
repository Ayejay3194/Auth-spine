import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20" as any
});

export async function createPaymentIntent(input: { amountCents: number; currency: string; metadata: Record<string, string> }) {
  return stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: input.currency,
    metadata: input.metadata,
    automatic_payment_methods: { enabled: true }
  });
}
