import type { Module, ModuleContext, ID, Money } from "../../core/types";

interface ExpenseForecast {
  artistId: ID;
  nextMonthSupplies: Money;
  confidence: number;
}

export class CashFlowOptimizationEngine implements Module {
  meta = {
    id: "39.cashflow",
    name: "Cash Flow Optimization Engine",
    version: "1.0.0",
    provides: ["payout_batching", "expense_forecast", "revenue_smoothing", "tax_tracking"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("payout.requested", async (e) => {
      const artistId = e.subject?.artistId;
      if (!artistId) return;

      const batchWindowMin = 90;
      await ctx.events.publish({
        id: `evt_${Math.random()}`,
        type: "payout.policy",
        at: ctx.now(),
        subject: { artistId },
        payload: { policy: "batch", windowMinutes: batchWindowMin },
      });
    });
  }

  async forecastExpenses(ctx: ModuleContext, artistId: ID): Promise<ExpenseForecast> {
    const avgSupplies = (await ctx.store.get<number>(`cash:avg_supplies_minor:${artistId}`)) ?? 80000;
    const currency = (await ctx.store.get<string>(`cash:currency:${artistId}`)) ?? "USD";
    return {
      artistId,
      nextMonthSupplies: { amount: avgSupplies, currency },
      confidence: 0.55,
    };
  }
}
