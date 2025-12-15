import { NextResponse } from "next/server";
import { computeAuthMetrics, AuthLogEvent } from "@/src/ops-runtime/metrics/authMetrics";

/**
 * Pull endpoint that returns current auth metrics snapshot.
 * Replace `getAuthLogEvents()` with your real log store query.
 */
export async function GET() {
  const events = await getAuthLogEvents();
  const snapshot = computeAuthMetrics(events);
  return NextResponse.json({ ok: true, snapshot });
}

async function getAuthLogEvents(): Promise<AuthLogEvent[]> {
  // TODO: integrate your log store / DB / analytics.
  // This stub simulates a login-failure spike.
  const now = Date.now();
  const events: AuthLogEvent[] = [];
  for (let i = 0; i < 80; i++) {
    events.push({ type: "login_failed", ts: now - (i * 1000) });
  }
  return events;
}
