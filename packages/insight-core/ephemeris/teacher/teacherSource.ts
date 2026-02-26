import { EphemerisEngine, EphemerisInput, EphemerisOutput } from "../domain.js";
import { wrap2pi } from "../../utils/math.js";

/**
 * Teacher: plug your gold truth here:
 * - JPL/DE (Chebyshev segments)
 * - Swiss Ephemeris
 * - Your slow/high-precision mode
 */
export class TeacherSource implements EphemerisEngine {
  name = "TeacherSource(placeholder)";

  compute(input: EphemerisInput): EphemerisOutput {
    // Placeholder: deterministic smooth function to simulate a "truth"
    const t = (input.jdTT - 2451545.0) / 36525.0;
    const k = bodyHash(input.body);
    const lon = wrap2pi(k + 2*Math.PI*(t*(0.9 + 0.01*k)) + 0.0007*Math.sin(12*t + k));
    const lat = 0.04*Math.sin(2*lon + 0.2*k) + 0.0005*Math.cos(30*t + k);
    const r = 1.0 + 0.01*Math.cos(lon + 0.2*k);
    return { lon, lat, r };
  }
}

function bodyHash(body: EphemerisInput["body"]): number {
  const m: Record<string, number> = {
    Sun: 0.3, Moon: 1.1, Mercury: 2.2, Venus: 3.0, Mars: 4.1,
    Jupiter: 5.2, Saturn: 6.3, Uranus: 7.1, Neptune: 8.0, Pluto: 9.2,
  };
  return m[body] ?? 0.0;
}
