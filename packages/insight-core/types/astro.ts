export type Body =
  | "Sun"|"Moon"|"Mercury"|"Venus"|"Mars"
  | "Jupiter"|"Saturn"|"Uranus"|"Neptune"|"Pluto";

export const BODIES: Body[] = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];

export type AspectType = "CONJ"|"OPP"|"SQR"|"TRI"|"SEX"|"QUINC"|"SEMI"|"SESQ";

export type AstroBodyState = {
  lonDeg: number;   // 0..360
  latDeg: number;   // -90..90
  speedLonDegPerDay: number;
  retrograde: boolean;

  // diagnostics (optional, for receipts)
  rawErrArcsec?: number;
  mlErrArcsec?: number;
  corrected: boolean;
  confidence: number; // 0..1 derived from gating/clamp/coverage
};

export type Aspect = {
  a: Body;
  b: Body;
  type: AspectType;
  orbDeg: number;
  applying: boolean;
  exactAtUtc?: string;
  peakAtUtc?: string;
  endsAtUtc?: string;
  strength: number; // 0..1
};

export type AstroNowSignals = {
  utc: string;
  jd: number;
  bodies: Record<Body, AstroBodyState>;
  aspects: Aspect[];
  topAspects: Aspect[];
  systemConfidence: number;
};
