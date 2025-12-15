import { OpsAuthEvent, OpsSpineResponse, AdminNotification } from "../../types-ops/opsAuth";
import { EmailProvider, LoggerProvider, WebhookProvider } from "../providers/notify";

type NotifyConfig = {
  admin_email?: string;
  webhook_url?: string;
  mode?: "log" | "webhook" | "email" | "webhook+email";
};

export async function notifyAdminOfAuthIncident(
  event: OpsAuthEvent,
  response: OpsSpineResponse,
  cfg: NotifyConfig
) {
  const mode = cfg.mode ?? "log";
  const providers = pickProviders(mode);

  const subject = formatSubject(event, response);
  const body = formatBody(event, response);

  const n: AdminNotification = {
    channel: mode.includes("email") ? "email" : mode.includes("webhook") ? "webhook" : "log",
    to: cfg.admin_email,
    webhook_url: cfg.webhook_url,
    subject,
    body,
    metadata: { event, response },
  };

  for (const p of providers) {
    if (p instanceof EmailProvider && !cfg.admin_email) continue;
    if (p instanceof WebhookProvider && !cfg.webhook_url) continue;
    await p.send(n);
  }
}

function pickProviders(mode: string) {
  const out: any[] = [];
  if (mode === "log") return [new LoggerProvider()];
  if (mode.includes("webhook")) out.push(new WebhookProvider());
  if (mode.includes("email")) out.push(new EmailProvider());
  if (out.length === 0) out.push(new LoggerProvider());
  return out;
}

function formatSubject(event: OpsAuthEvent, response: OpsSpineResponse) {
  const sev = response.classification?.sev ?? event.severity_guess;
  const appName = process.env.APP_NAME || "App";
  return `[${appName}][AuthOps][SEV-${sev}] ${event.incident_type}`;
}

function formatBody(event: OpsAuthEvent, response: OpsSpineResponse) {
  const sev = response.classification?.sev ?? event.severity_guess;
  const lines = [
    `SEV-${sev} ${event.incident_type}`,
    ``,
    `Decision: ${response.decision}`,
    ``,
    `Steps:`,
    ...response.steps.map((s, i) => `${i + 1}) ${s}`),
    ``,
    `Risk notes:`,
    ...response.risk_notes.map((r) => `- ${r}`),
    ``,
    `Rollback plan:`,
    ...response.rollback_plan.map((rb) => `- ${rb}`),
    ``,
    response.recommended_flags?.length
      ? `Recommended flags:\n${response.recommended_flags.map((f) => `- ${f.key} = ${String(f.value)} (${f.reason})`).join("\n")}`
      : `Recommended flags: none`,
    ``,
    `Metrics:`,
    JSON.stringify(event.metrics_snapshot ?? {}, null, 2),
    ``,
    `Notes:`,
    event.notes ?? "",
  ];
  return lines.join("\n");
}
