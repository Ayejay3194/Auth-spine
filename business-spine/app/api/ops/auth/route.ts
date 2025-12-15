import { NextResponse } from "next/server";
import { deriveAuthIncidents } from "@/src/ops-spine/alerts/authAlertRules";
import { runAuthOpsSpine } from "@/src/ops-spine/spine/authOpsSpine";
import { notifyAdminOfAuthIncident } from "@/src/ops-spine/alerts/notifyAdmin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const metrics = body.metrics ?? {};
  const context = body.context ?? {};
  const incidents = deriveAuthIncidents(metrics, context);

  const results = [];
  for (const ev of incidents) {
    const resp = runAuthOpsSpine(ev);

    await notifyAdminOfAuthIncident(ev, resp, {
      admin_email: process.env.OPSSPINE_ADMIN_EMAIL,
      webhook_url: process.env.OPSSPINE_WEBHOOK_URL,
      mode: (process.env.OPSSPINE_NOTIFY_MODE as any) ?? "log",
    });

    results.push({ event: ev, response: resp });
  }

  return NextResponse.json({ ok: true, incidents: results });
}
