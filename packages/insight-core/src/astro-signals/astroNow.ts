import type { AstroNowSignals, Body } from "../types/astro.js";
import { BODIES } from "../types/astro.js";
import type { EphemerisProvider } from "../ephemeris/ephemerisProvider.js";
import { computeAspects } from "./aspects.js";
import { clamp } from "../utils/math.js";

export function buildAstroNowSignals(args: {
  utc: string;
  jd: number;
  eph: EphemerisProvider;
  bodies?: Body[];
}): AstroNowSignals {
  const bodies = args.bodies ?? BODIES;
  const bodyStates = Object.create(null) as AstroNowSignals["bodies"];

  let confSum = 0;
  for (const b of bodies) {
    const st = args.eph.getBodyState(args.jd, b);
    bodyStates[b] = st;
    confSum += st.confidence;
  }

  const aspects = computeAspects({ utc: args.utc, jd: args.jd, bodies: bodyStates, aspects: [], topAspects: [], systemConfidence: 1 }, bodies);
  const topAspects = aspects.slice(0, 12);

  const systemConfidence = clamp(confSum / bodies.length, 0, 1);

  return {
    utc: args.utc,
    jd: args.jd,
    bodies: bodyStates,
    aspects,
    topAspects,
    systemConfidence
  };
}
