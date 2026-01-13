import { AdminNotification } from "../types/opsAuth";

export class SlackWebhookProvider {
  constructor(private webhookUrl: string) {}

  async send(n: AdminNotification) {
    const payload = {
      text: n.subject,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*${n.subject}*` }
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: "```" + n.body.slice(0, 2900) + "```" }
        }
      ]
    };

    await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
}
