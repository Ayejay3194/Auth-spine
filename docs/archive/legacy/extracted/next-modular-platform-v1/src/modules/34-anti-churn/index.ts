import type { Module, ModuleContext, ID, ScoreResult } from "../../core/types";
import { clamp01 } from "../../lib/util";

interface ChurnRiskInput {
  userId: ID;
  artistId: ID;
  recencyDays: number;
  frequency90d: number;
  spend90d: number;
  sentimentTrend: number; // -1..+1
}

export class AntiChurnImmuneSystem implements Module {
  meta = {
    id: "34.anti-churn",
    name: "Anti-Churn Immune System",
    version: "1.0.0",
    provides: ["churn_risk", "reactivation_surfaces", "relationship_strength"],
    requires: ["33.context-collapse"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("review.received", async (e) => {
      const userId = e.subject?.userId;
      const artistId = e.subject?.artistId;
      if (!userId || !artistId) return;

      const input = await this.buildInput(ctx, userId, artistId);
      const risk = await this.scoreChurn(ctx, input);

      await ctx.store.set(`churn:risk:${userId}:${artistId}`, risk);

      if (risk.level === "high" || risk.level === "critical") {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.surface_action",
          at: ctx.now(),
          subject: { userId, artistId },
          payload: { kind: "churn_risk", risk },
        });
      }
    });
  }

  private async buildInput(ctx: ModuleContext, userId: ID, artistId: ID): Promise<ChurnRiskInput> {
    const recencyDays = (await ctx.store.get<number>(`agg:recency_days:${userId}:${artistId}`)) ?? 999;
    const frequency90d = (await ctx.store.get<number>(`agg:freq_90d:${userId}:${artistId}`)) ?? 0;
    const spend90d = (await ctx.store.get<number>(`agg:spend_90d:${userId}:${artistId}`)) ?? 0;
    const sentimentTrend = (await ctx.store.get<number>(`agg:sent_trend:${userId}:${artistId}`)) ?? 0;
    return { userId, artistId, recencyDays, frequency90d, spend90d, sentimentTrend };
  }

  private async scoreChurn(_ctx: ModuleContext, input: ChurnRiskInput): Promise<ScoreResult> {
    const recency = clamp01(input.recencyDays / 60);
    const lowFreq = clamp01(1 - input.frequency90d / 6);
    const lowSpend = clamp01(1 - input.spend90d / 40000);
    const sentiment = clamp01((-input.sentimentTrend + 1) / 2);

    const value = clamp01(0.35 * recency + 0.25 * lowFreq + 0.2 * lowSpend + 0.2 * sentiment);
    return {
      key: "churn_risk",
      value,
      level: value > 0.8 ? "critical" : value > 0.65 ? "high" : value > 0.4 ? "medium" : "low",
      signals: { recency, lowFreq, lowSpend, sentiment },
    };
  }
}
