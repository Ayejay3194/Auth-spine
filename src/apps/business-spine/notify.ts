import { AdminNotification } from "../types/opsAuth";

export type NotifyProvider = {
  send: (n: AdminNotification) => Promise<void>;
};

export class LoggerProvider implements NotifyProvider {
  async send(n: AdminNotification) {
    console.log("[OPS_NOTIFY]", JSON.stringify(n));
  }
}

export class WebhookProvider implements NotifyProvider {
  async send(n: AdminNotification) {
    if (!n.webhook_url) throw new Error("Missing webhook_url");
    await fetch(n.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    });
  }
}

/**
 * Email provider is intentionally a stub.
 * Wire it to your transactional email provider (Resend, Postmark, SES, etc.).
 */
export class EmailProvider implements NotifyProvider {
  async send(n: AdminNotification) {
    console.log("[OPS_EMAIL_STUB]", n.to, n.subject);
  }
}
