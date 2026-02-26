import { StubEphemerisProvider } from "../ephemeris/ephemerisProvider.js";
import { buildAstroNowSignals } from "../astro-signals/astroNow.js";

export function testAspectsDeterministic(): void {
  const eph = new StubEphemerisProvider();
  const a = buildAstroNowSignals({ utc: "2026-02-21T01:07:00.000Z", jd: 2461084.54653, eph });
  const b = buildAstroNowSignals({ utc: "2026-02-21T01:07:00.000Z", jd: 2461084.54653, eph });

  if (a.topAspects.length === 0) throw new Error("Expected aspects");
  const ax = JSON.stringify(a.topAspects.slice(0, 5));
  const bx = JSON.stringify(b.topAspects.slice(0, 5));
  if (ax !== bx) throw new Error("Aspects not deterministic");
}
