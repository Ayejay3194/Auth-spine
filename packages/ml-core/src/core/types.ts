export type Vec = readonly number[];

export type Body =
  | "Sun" | "Moon"
  | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn"
  | "Uranus" | "Neptune" | "Pluto";

export type Frame = "geocentric" | "topocentric" | "heliocentric";
export type Zodiac = "tropical" | "sidereal";
export type HouseSystem = "placidus" | "wholeSign" | "koch" | "equal";

export interface EphemerisInput {
  jdTt: number;        // Julian Day (TT)
  jdUt1?: number;      // optional if you have UT1
  latDeg?: number;     // for topo
  lonDeg?: number;
  elevationM?: number;

  body: Body;
  frame: Frame;

  zodiac?: Zodiac;
  houseSystem?: HouseSystem;

  engineVersion: string;     // deterministic engine version hash
  kernelVersion?: string;    // if using JPL kernels for training/validation
}

export interface EphemerisOutput {
  lonDeg: number;    // ecliptic longitude
  latDeg: number;    // ecliptic latitude
  rAu?: number;      // distance (optional)

  dLonDegPerDay?: number;
  dLatDegPerDay?: number;
}

export interface Residual {
  dLonArcsec: number;
  dLatArcsec: number;
}

export interface Prediction<T> {
  value: T;
  confidence: number;            // 0..1
  diagnostics?: Record<string, unknown>;
}

export interface ModelMeta {
  id: string;
  version: string;
  trainedAtIso: string;
  trainingDataHash: string;
  featureSchemaHash: string;
  notes?: string;
}

export interface Model<Input, Output> {
  meta: ModelMeta;
  predict(input: Input): Prediction<Output>;
}
