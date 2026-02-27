import type { Body, AstroBodyState } from "../types/astro.js";
import { wrapDeg } from "../utils/math.js";

/**
 * Replace this with your real ephemeris engine:
 * - VSOP87A / ELP2000
 * - ML residual correctors
 * - gating/clamps
 *
 * For now we provide a deterministic stub so downstream plumbing works.
 */
export interface EphemerisProvider {
  getBodyState(jd: number, body: Body): AstroBodyState;
}

/** Simple deterministic pseudo-ephemeris. DO NOT USE FOR REAL ASTRO. */
export class StubEphemerisProvider implements EphemerisProvider {
  getBodyState(jd: number, body: Body): AstroBodyState {
    const base = (jd - 2451545.0);
    const idx = BODY_INDEX[body];

    // fake cyclic longitude + tiny latitude variation
    const speed = BODY_SPEED_DEG_PER_DAY[body];
    const lon = wrapDeg((base * speed + idx * 33.3) % 360);
    const lat = Math.sin((base/365.25) * 0.7 + idx) * 0.3;

    // fake "ML-corrected" diagnostics
    const rawErr = Math.abs(Math.sin(base*0.01 + idx))*5; // arcsec
    const mlErr = rawErr * 0.2;

    return {
      lonDeg: lon,
      latDeg: lat,
      speedLonDegPerDay: speed,
      retrograde: speed < 0,
      rawErrArcsec: rawErr,
      mlErrArcsec: mlErr,
      corrected: true,
      confidence: 0.95
    };
  }
}

const BODY_INDEX: Record<Body, number> = {
  Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4,
  Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9
};

const BODY_SPEED_DEG_PER_DAY: Record<Body, number> = {
  Sun: 0.9856,
  Moon: 13.1764,
  Mercury: 4.0923,
  Venus: 1.6021,
  Mars: 0.5240,
  Jupiter: 0.0831,
  Saturn: 0.0335,
  Uranus: 0.0117,
  Neptune: 0.0060,
  Pluto: 0.0040
};
