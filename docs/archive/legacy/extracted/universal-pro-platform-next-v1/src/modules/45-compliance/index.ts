import type { Module, ModuleContext } from "@/core/types";
import { evaluateCompliance } from "@/policy/compliance";
import { getVertical } from "@/verticals/loader";

export class ComplianceAutopilot implements Module {
  meta = { id: "45.compliance", name: "Compliance Autopilot", version: "1.0.0" };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("policy.check", async (e) => {
      const vertical = (e.payload as any)?.vertical as string | undefined;
      const consents = ((e.payload as any)?.consents as string[] | undefined) ?? [];
      const professional = (e.payload as any)?.professional ?? {};
      if (!vertical) return;

      const config = getVertical(vertical);
      if (!config) return;

      const result = evaluateCompliance({
        config,
        event: { type: (e.payload as any)?.eventType ?? "unknown", payload: (e.payload as any)?.eventPayload ?? {} },
        consents,
        professional
      });

      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: result.ok ? "policy.allow" : "policy.block",
        at: ctx.now(),
        subject: e.subject as any,
        payload: { vertical, result }
      });
    });
  }
}
