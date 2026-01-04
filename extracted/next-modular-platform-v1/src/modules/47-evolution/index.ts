import type { Module, ModuleContext } from "../../core/types";

interface FeatureUsage {
  key: string;
  activeUsers7d: number;
  retentionLift?: number;
  costScore?: number;
}

export class PlatformEvolutionEngine implements Module {
  meta = {
    id: "47.evolution",
    name: "Platform Evolution Engine",
    version: "1.0.0",
    provides: ["usage_feedback_loop", "ab_automation_hooks", "deprecation_intel"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("system.evaluate_evolution", async () => {
      const plan = await this.evaluate(ctx);
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "system.evolution_plan_ready",
        at: ctx.now(),
        payload: plan,
      });
    });
  }

  async evaluate(ctx: ModuleContext): Promise<{
    keep: string[];
    experiment: Array<{ feature: string; test: string }>;
    deprecate: Array<{ feature: string; reason: string }>;
  }> {
    const usage = (await ctx.store.get<FeatureUsage[]>("usage:features")) ?? [];

    const keep: string[] = [];
    const experiment: Array<{ feature: string; test: string }> = [];
    const deprecate: Array<{ feature: string; reason: string }> = [];

    for (const f of usage) {
      if (f.activeUsers7d >= 250) keep.push(f.key);
      else if (f.activeUsers7d >= 80) experiment.push({ feature: f.key, test: "copy_variant_or_ui_simplification" });
      else deprecate.push({ feature: f.key, reason: "low_usage_7d" });
    }

    return { keep, experiment, deprecate };
  }
}
