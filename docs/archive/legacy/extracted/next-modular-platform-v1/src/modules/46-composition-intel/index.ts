import type { Module, ModuleContext } from "../../core/types";

interface InteractionEdge {
  fromModule: string;
  toModule: string;
  eventType: string;
  count: number;
}

export class ModuleCompositionIntelligence implements Module {
  meta = {
    id: "46.composition-intel",
    name: "Module Composition Intelligence",
    version: "1.0.0",
    provides: ["workflow_synthesis", "self_healing_hooks", "emergent_detection"],
    requires: [
      "33.context-collapse",
      "34.anti-churn",
      "35.quality-control",
      "36.demand-shaping",
      "37.trust-velocity",
      "45.compliance",
    ],
  };

  async init(ctx: ModuleContext) {
    const edgeKey = "composition:edges";

    const track = async (eventType: string, fromModule: string, toModule: string) => {
      const edges = (await ctx.store.get<InteractionEdge[]>(edgeKey)) ?? [];
      const found = edges.find((e) => e.fromModule === fromModule && e.toModule === toModule && e.eventType === eventType);
      if (found) found.count += 1;
      else edges.push({ fromModule, toModule, eventType, count: 1 });
      await ctx.store.set(edgeKey, edges);
    };

    ctx.events.subscribe("booking.deposit_policy", async () => track("booking.deposit_policy", "37.trust-velocity", "booking"));
    ctx.events.subscribe("booking.blocked", async () => track("booking.blocked", "45.compliance", "booking"));
    ctx.events.subscribe("artist.surface_action", async () => track("artist.surface_action", "system", "artist_ui"));

    ctx.events.subscribe("module.error", async (e) => {
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "system.fallback_policy",
        at: ctx.now(),
        payload: { cause: e.payload, policy: "degrade_gracefully" },
      });
    });
  }
}
