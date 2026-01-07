import type { Module, ModuleContext, ID } from "../../core/types";
import { clamp01 } from "../../lib/util";

interface ReviewSignal {
  artistId: ID;
  userId: ID;
  draftText?: string;
  rating?: number;
}

export class ReputationArmor implements Module {
  meta = {
    id: "38.reputation-armor",
    name: "Reputation Armor",
    version: "1.0.0",
    provides: ["bad_review_early_warning", "response_suggestions", "timed_review_requests"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("review.draft_updated", async (e) => {
      const p = e.payload as ReviewSignal;
      const risk = this.predictBadReview(p);

      if (risk > 0.7) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "artist.surface_action",
          at: ctx.now(),
          subject: { artistId: p.artistId, userId: p.userId },
          payload: { kind: "reputation_warning", risk },
        });
      }
    });

    ctx.events.subscribe("booking.completed", async (e) => {
      const artistId = e.subject?.artistId;
      const userId = e.subject?.userId;
      if (!artistId || !userId) return;

      const satProb = (await ctx.store.get<number>(`sat_prob:${userId}:${artistId}`)) ?? 0.65;
      if (satProb > 0.75) {
        await ctx.events.publish({
          id: `evt_${Math.random()}`,
          type: "review.request_suggested",
          at: ctx.now(),
          subject: { artistId, userId },
          payload: { satProb, reason: "high_satisfaction_window" },
        });
      }
    });
  }

  private predictBadReview(p: ReviewSignal): number {
    const ratingRisk = p.rating != null ? clamp01((3 - p.rating) / 3) : 0.3;
    const textRisk = p.draftText
      ? (p.draftText.length > 40 && /refund|rude|dirty|late/i.test(p.draftText) ? 0.9 : 0.4)
      : 0.25;
    return clamp01(0.55 * ratingRisk + 0.45 * textRisk);
  }

  suggestResponse(input: { reviewText: string; artistTone: "calm" | "friendly" | "firm" }): string {
    const base =
      input.artistTone === "firm"
        ? "Thanks for the feedback. I’m sorry this didn’t meet expectations. Please message me so we can make it right."
        : input.artistTone === "friendly"
        ? "Thanks for sharing this. I’m sorry it wasn’t perfect. Please reach out so I can fix it."
        : "Thank you for your feedback. I’m sorry to hear this. Please contact me so we can resolve it.";

    return base;
  }
}
