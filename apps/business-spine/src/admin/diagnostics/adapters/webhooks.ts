import type { DiagContext, DiagResult } from "../types";

/**
 * Webhook replay stub.
 * Common use: replay last Stripe event from your DB/event store.
 */
export async function checkWebhookReplay(_ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  return {
    id: "webhooks",
    name: "Webhook replay",
    status: "warn",
    ms: Date.now() - start,
    details: { message: "Stub. Wire to your Stripe event store to replay last event safely." },
  };
}
