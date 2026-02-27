import { EphemerisEngine, EphemerisInput, EphemerisOutput } from "../domain.js";
import { wrap2pi } from "../../utils/math.js";

/**
 * Student core: your FAST TypeScript ephemeris engine (math-first).
 * Replace with your real output. Keep lon/lat/r units consistent.
 */
export class StudentCore implements EphemerisEngine {
  name = "StudentCore(placeholder)";

  compute(input: EphemerisInput): EphemerisOutput {
    // Placeholder: slightly biased version of TeacherSource
    const t = (input.jdTT - 2451545.0) / 36525.0;
    const k = bodyHash(input.body);
    const lon = wrap2pi(k + 2*Math.PI*(t*(0.9 + 0.01*k)) + 0.0002*Math.sin(9*t + 0.5*k));
    const lat = 0.04*Math.sin(2*lon + 0.2*k);
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
