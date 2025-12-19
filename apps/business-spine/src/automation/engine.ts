export type TriggerEvent =
  | "booking.created"
  | "booking.confirmed"
  | "booking.completed"
  | "booking.cancelled"
  | "booking.no_show"
  | "client.created"
  | "inventory.low_stock"
  | "review.request_due";

export type AutomationContext = {
  providerId: string;
  bookingId?: string;
  clientId?: string;
  nowISO: string;
  meta?: Record<string, unknown>;
};

export type Rule = {
  id: string;
  name: string;
  trigger: TriggerEvent;
  enabled: boolean;
  // JSON config: delay minutes, channel, templateKey, segment selector, etc.
  config: Record<string, unknown>;
};

export interface ActionRunner {
  sendMessage(input: { providerId: string; clientId: string; channel: "email"|"sms"|"push"; templateKey: string; vars: Record<string, unknown> }): Promise<void>;
  createTask(input: { providerId: string; title: string }): Promise<void>;
  schedule(input: { runAtISO: string; event: TriggerEvent; ctx: AutomationContext }): Promise<void>;
}

export class AutomationEngine {
  constructor(private runner: ActionRunner) {}

  async handle(event: TriggerEvent, ctx: AutomationContext, rules: Rule[]) {
    for (const r of rules) {
      if (!r.enabled) continue;
      if (r.trigger !== event) continue;
      await this.executeRule(r, ctx);
    }
  }

  private async executeRule(rule: Rule, ctx: AutomationContext) {
    const cfg = rule.config ?? {};
    const kind = String(cfg.kind ?? "send");
    if (kind === "send") {
      const channel = cfg.channel as any;
      const templateKey = String(cfg.templateKey ?? "generic");
      const clientId = String(ctx.clientId ?? "");
      if (!clientId) return;
      await this.runner.sendMessage({ providerId: ctx.providerId, clientId, channel, templateKey, vars: { ...ctx.meta, bookingId: ctx.bookingId } });
      return;
    }
    if (kind === "task") {
      await this.runner.createTask({ providerId: ctx.providerId, title: String(cfg.title ?? "Task") });
      return;
    }
    if (kind === "schedule") {
      await this.runner.schedule({ runAtISO: String(cfg.runAtISO), event: cfg.event as any, ctx });
      return;
    }
  }
}
