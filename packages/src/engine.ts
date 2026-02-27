import type { EphemerisProvider } from "./ephemeris/ephemerisProvider.js";
import { StubEphemerisProvider } from "./ephemeris/ephemerisProvider.js";
import { VibeEngine } from "./vibe-signals/vibeNow.js";
import type { ConversationWindow } from "./vibe-signals/events.js";
import { buildNowContext } from "./fusion/nowContext.js";
import { renderSassy } from "./renderers/sassy.js";
import { renderClinical } from "./renderers/clinical.js";
import { MODULE_REGISTRY } from "./modules/index.js";
import { PlasticityEngine } from "./plasticity/plasticityEngine.js";
import { applyPlasticityToRouting } from "./plasticity/applyPlasticity.js";
import type { NowContext } from "./types/context.js";

export class InsightEngine {
  private eph: EphemerisProvider;
  private vibe: VibeEngine;
  private plasticity?: PlasticityEngine;

  constructor(args?: { ephemeris?: EphemerisProvider; vibe?: VibeEngine; plasticity?: PlasticityEngine | boolean }) {
    this.eph = args?.ephemeris ?? new StubEphemerisProvider();
    this.vibe = args?.vibe ?? new VibeEngine();
    const p = args?.plasticity;
    if (p === true) this.plasticity = new PlasticityEngine();
    else if (p && typeof p !== "boolean") this.plasticity = p as PlasticityEngine;
  }

  public buildContext(args: { utc: string; jd: number; convo: ConversationWindow; user?: NowContext["user"] }): NowContext {
    let ctx = buildNowContext({
      utc: args.utc,
      jd: args.jd,
      eph: this.eph,
      vibe: this.vibe,
      convo: args.convo,
      user: args.user
    });

    // Optional adaptive personalization (bounded). Only affects routing ordering by default.
    if (this.plasticity) {
      const pred = this.plasticity.predict(ctx);
      ctx = applyPlasticityToRouting({ ...ctx, plasticity: pred });
    }

    return ctx;
  }

  public submitFeedback(ctx: NowContext, feedback: { moduleId: string; helpful: number }): { loss: number; audit?: Record<string, unknown> } {
    if (!this.plasticity) return { loss: 0, audit: { skipped: true, reason: "plasticity_disabled" } };
    const res = this.plasticity.update(ctx, feedback);
    // Attach latest audit back into context if caller wants to persist it.
    return res;
  }

  public chat(ctx: NowContext): { sassy?: any; clinical?: any } {
    const tone = ctx.user.preferences.tone;
    if (tone === "clinical") return { clinical: renderClinical(ctx) };
    if (tone === "balanced") return { sassy: renderSassy(ctx), clinical: renderClinical(ctx) };
    return { sassy: renderSassy(ctx) };
  }

  public runModule(ctx: NowContext, moduleId: keyof typeof MODULE_REGISTRY): any {
    const mod = MODULE_REGISTRY[moduleId];
    return mod(ctx);
  }
}
