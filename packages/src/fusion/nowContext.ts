import type { NowContext } from "../types/context.js";
import type { EphemerisProvider } from "../ephemeris/ephemerisProvider.js";
import { buildAstroNowSignals } from "../astro-signals/astroNow.js";
import { VibeEngine } from "../vibe-signals/vibeNow.js";
import type { ConversationWindow } from "../vibe-signals/events.js";
import { routeModules } from "./router.js";

export type BuildNowContextArgs = {
  utc: string;
  jd: number;
  eph: EphemerisProvider;
  vibe: VibeEngine;
  convo: ConversationWindow;
  user?: NowContext["user"];
};

export function buildNowContext(args: BuildNowContextArgs): NowContext {
  const astro = buildAstroNowSignals({ utc: args.utc, jd: args.jd, eph: args.eph });
  const vibe = args.vibe.computeNow(args.utc, args.convo);

  const user = args.user ?? {
    natal: undefined,
    preferences: {
      tone: "sassy",
      intensity: 2,
      receiptsDefault: false
    }
  };

  const base: NowContext = {
    utc: args.utc,
    astro,
    vibe,
    user,
    routing: { suggestedModules: [], riskFlags: [] }
  };

  base.routing = routeModules(base);
  return base;
}
