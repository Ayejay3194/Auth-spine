import { EphemerisInput, EphemerisOutput, Vec } from "../core/types";

export interface FeaturePipeline {
  schemaId: string;
  featurize(input: EphemerisInput, baseline: EphemerisOutput): Vec;
  featureNames(): readonly string[];
}

export function makeDefaultFeaturePipeline(): FeaturePipeline {
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
    schemaId: "default-v1",
    featureNames: () => names,
    featurize: (input, base) => ([
      input.jdTt,
      bodyToId[input.body] ?? -1,
      frameToId[input.frame] ?? -1,
      base.lonDeg,
      base.latDeg,
      base.dLonDegPerDay ?? 0,
      base.dLatDegPerDay ?? 0,
      input.latDeg ?? 0,
      input.lonDeg ?? 0,
      input.elevationM ?? 0,
    ])
  };
}
