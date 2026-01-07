import type { Module, ModuleContext, ID, ScoreResult } from "../../core/types";
import { clamp01 } from "../../lib/util";

interface TrustInput {
  userId: ID;
  artistId: ID;
  profileCompleteness: number;
  responseLatencyMinutes: number;
  priorBookings: number;
  noShowHistory: number;
}

export class TrustVelocitySystem implements Module {
  meta = {
    id: "37.trust-velocity",
    name: "Trust Velocity System",
    version: "1.0.0",
    provides: ["trust_scoring", "no_show_prediction", "deposit_intelligence"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("booking.requested", async (e) => {
      const userId = e.subject?.userId;
      const artistId = e.subject?.artistId;
      if (!userId || !artistId) return;

      const input = await this.buildInput(ctx, userId, artistId);
      const trust = this.scoreTrust(input);
      await ctx.store.set(`trust:${userId}:${artistId}`, trust);

      const depositRequired = trust.value < 0.55 || (trust.signals?.noShowRisk ?? 0) > 0.6;
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "booking.deposit_policy",
        at: ctx.now(),
        subject: { userId, artistId },
        payload: { depositRequired, trust },
      });
    });
  }

  private async buildInput(ctx: ModuleContext, userId: ID, artistId: ID): Promise<TrustInput> {
    const profileCompleteness = (await ctx.store.get<number>(`user:profile_complete:${userId}`)) ?? 0.3;
    const responseLatencyMinutes = (await ctx.store.get<number>(`user:response_latency_min:${userId}`)) ?? 240;
    const priorBookings = (await ctx.store.get<number>(`user:prior_bookings:${userId}:${artistId}`)) ?? 0;
    const noShowHistory = (await ctx.store.get<number>(`user:no_show_count:${userId}`)) ?? 0;
    return { userId, artistId, profileCompleteness, responseLatencyMinutes, priorBookings, noShowHistory };
  }

  private scoreTrust(input: TrustInput): ScoreResult {
    const completion = clamp01(input.profileCompleteness);
    const latency = clamp01(1 - input.responseLatencyMinutes / 720);
    const history = clamp01(input.priorBookings / 5);
    const noShowRisk = clamp01(input.noShowHistory / 3);

    const value = clamp01(0.35 * completion + 0.25 * latency + 0.3 * history + 0.1 * (1 - noShowRisk));
    return {
      key: "trust_score",
      value,
      level: value < 0.35 ? "high" : value < 0.55 ? "medium" : "low",
      signals: { completion, latency, history, noShowRisk },
    };
  }
}
