import type { DiagContext, DiagResult } from "../types";

/**
 * Queue/DLQ adapter stub.
 * Wire to BullMQ, SQS, RabbitMQ, etc.
 */
export async function checkQueue(_ctx: DiagContext): Promise<DiagResult> {
  const start = Date.now();
  // Replace with real checks:
  // - queue connectivity
  // - active jobs
  // - delayed jobs
  // - dead letter count
  return {
    id: "queue",
    name: "Queue + DLQ",
    status: "warn",
    ms: Date.now() - start,
    details: { message: "Queue adapter not wired (stub). Plug into BullMQ/SQS/etc." },
  };
}
