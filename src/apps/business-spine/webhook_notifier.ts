import type { AdminAlert, IAdminNotifier } from "./notifier";

export class WebhookNotifier implements IAdminNotifier {
  constructor(private url: string) {}
  async send(alert: AdminAlert) {
    // stub: fetch(this.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(alert) })
    console.log("[WEBHOOK NOTIFY]", this.url, alert.severity, alert.title);
  }
}
