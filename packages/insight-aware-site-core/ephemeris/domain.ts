export type Body =
  | "Sun" | "Moon" | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

export type Frame = "ECLIPTIC" | "EQUATORIAL";

export interface EphemerisInput {
  jdTT: number;          // TT Julian Day
  body: Body;
  frame: Frame;
  // Optional observer params (topocentric)
  observer?: {
    latDeg: number;
    lonDeg: number;
    heightM?: number;
  };
  // Mode flags (fast, slow teacher, etc.)
  flags?: Record<string, boolean>;
}

export interface EphemerisOutput {
  // In chosen frame. Use radians for angles.
  lon: number; // lambda (ecliptic) or RA (equatorial)
  lat: number; // beta (ecliptic) or Dec (equatorial)
  r: number;   // AU (or km, pick one and stay consistent)
}

export interface Residual {
  dLon: number;
  dLat: number;
  dR: number;
  gate: number; // 0..1 applied scaling
  meta?: Record<string, unknown>;
}

export interface EphemerisEngine {
  name: string;
  compute(input: EphemerisInput): EphemerisOutput;
}
