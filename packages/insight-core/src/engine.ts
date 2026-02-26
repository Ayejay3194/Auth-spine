import type { EphemerisProvider } from "./ephemeris/ephemerisProvider.js";
import { StubEphemerisProvider } from "./ephemeris/ephemerisProvider.js";
import { VibeEngine } from "./vibe-signals/vibeNow.js";
import type { ConversationWindow } from "./vibe-signals/events.js";
import { buildNowContext } from "./fusion/nowContext.js";
import { renderSassy } from "./renderers/sassy.js";
import { renderClinical } from "./renderers/clinical.js";
import { MODULE_REGISTRY } from "./modules/index.js";
import type { NowContext } from "./types/context.js";

export class InsightEngine {
  private eph: EphemerisProvider;
  private vibe: VibeEngine;

  constructor(args?: { ephemeris?: EphemerisProvider; vibe?: VibeEngine }) {
    this.eph = args?.ephemeris ?? new StubEphemerisProvider();
    this.vibe = args?.vibe ?? new VibeEngine();
  }

  public buildContext(args: { utc: string; jd: number; convo: ConversationWindow; user?: NowContext["user"] }): NowContext {
    return buildNowContext({
      utc: args.utc,
      jd: args.jd,
      eph: this.eph,
      vibe: this.vibe,
      convo: args.convo,
      user: args.user
    });
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
