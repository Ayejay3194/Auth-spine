export type Body =
  | "Sun" | "Moon"
  | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn"
  | "Uranus" | "Neptune" | "Pluto";

export type Frame = "geocentric" | "topocentric" | "heliocentric";

export interface EphemerisInput {
  jdTt: number;
  jdUt1?: number;
  latDeg?: number;
  lonDeg?: number;
  elevationM?: number;

  body: Body;
  frame: Frame;

  engineVersion: string;
  kernelVersion?: string;
}

export interface EphemerisOutput {
  lonDeg: number;
  latDeg: number;
  rAu?: number;
  dLonDegPerDay?: number;
  dLatDegPerDay?: number;
}

export interface Residual {
  dLonArcsec: number;
  dLatArcsec: number;
}
