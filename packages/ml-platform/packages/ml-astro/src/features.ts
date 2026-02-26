import type { FeaturePipeline, Vec } from "@aj/ml-core";
import type { EphemerisInput, EphemerisOutput } from "./types";

export interface AstroFeatureContext {
  input: EphemerisInput;
  baseline: EphemerisOutput;
}

export function makeAstroFeaturePipeline(): FeaturePipeline<AstroFeatureContext, Vec> {
  const names = [
    "jdTt",
    "bodyId",
    "frameId",
    "baselineLonDeg",
    "baselineLatDeg",
    "dLonDegPerDay",
    "dLatDegPerDay",
    "latDeg",
    "lonDeg",
    "elevationM",
  ] as const;

  const bodyToId: Record<string, number> = {
    Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4, Jupiter: 5, Saturn: 6, Uranus: 7, Neptune: 8, Pluto: 9
  };
  const frameToId: Record<string, number> = { geocentric: 0, topocentric: 1, heliocentric: 2 };

  return {
    schemaId: "astro-features-v1",
    featureNames: () => names,
    featurize: ({ input, baseline }) => ([
      input.jdTt,
      bodyToId[input.body] ?? -1,
      frameToId[input.frame] ?? -1,
      baseline.lonDeg,
      baseline.latDeg,
      baseline.dLonDegPerDay ?? 0,
      baseline.dLatDegPerDay ?? 0,
      input.latDeg ?? 0,
      input.lonDeg ?? 0,
      input.elevationM ?? 0,
    ])
  };
}
