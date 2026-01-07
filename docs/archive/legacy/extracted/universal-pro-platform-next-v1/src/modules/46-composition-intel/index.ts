import type { Module, ModuleContext } from "@/core/types";

export class ModuleCompositionIntelligence implements Module {
  meta = { id: "46.composition-intel", name: "Module Composition Intelligence", version: "1.0.0", requires: ["45.compliance","37.trust-velocity"] };

  async init(ctx: ModuleContext) {
    const key = "composition:edges";
    const bump = async (eventType: string) => {
      const cur = (await ctx.store.get<Record<string, number>>(key)) ?? {};
      cur[eventType] = (cur[eventType] ?? 0) + 1;
      await ctx.store.set(key, cur);
    };

    ctx.events.subscribe("policy.block", async () => bump("policy.block"));
    ctx.events.subscribe("booking.deposit_policy", async () => bump("booking.deposit_policy"));
  }
}
