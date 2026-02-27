import { Body, EphemerisInput, Residual } from "../domain.js";
import { clamp, hypot2 } from "../../utils/math.js";

export interface CorrectorFeatures {
  bodyId: number;
  T: number;
  sinLon: number;
  cosLon: number;
  lat: number;
}

export interface ResidualCorrector {
  name: string;
  // predict residual in same output space as student core
  predict(input: EphemerisInput, studentLon: number, studentLat: number, studentR: number): Residual;
}

export class CappedGatedLinearCorrector implements ResidualCorrector {
  name = "CappedGatedLinearCorrector(placeholder)";

  // weights: 2 outputs (dLon,dLat) each with 5 features
  private wLon = [0.0, 2e-7, -2e-7, 1e-7, 0.0];
  private wLat = [0.0, -1e-7, 1e-7, 0.0, 1e-7];

  predict(input: EphemerisInput, studentLon: number, studentLat: number, studentR: number): Residual {
    const f = this.features(input, studentLon, studentLat);
    const dLonRaw = dot(this.wLon, f);
    const dLatRaw = dot(this.wLat, f);

    const caps = capsForBody(input.body);
    const dLon = clamp(dLonRaw, caps.capLon);
    const dLat = clamp(dLatRaw, caps.capLat);

    const mag = hypot2(dLon, dLat);
    const confidence = input.flags?.confidence ?? true ? 0.95 : 0.6;
    const anomaly = input.flags?.anomaly ?? false ? 0.8 : 0.0;
    const gate = computeGate(mag, confidence, anomaly, caps.gateScale);

    return { dLon, dLat, dR: 0, gate, meta: { mag, confidence, anomaly } };
  }

  private features(input: EphemerisInput, lon: number, lat: number): number[] {
    const T = (input.jdTT - 2451545.0) / 36525.0;
    return [bodyToId(input.body), T, Math.sin(lon), Math.cos(lon), lat];
  }
}

function dot(w: number[], x: number[]): number {
  let s = 0;
  for (let i = 0; i < w.length; i++) s += w[i] * x[i];
  return s;
}

function bodyToId(b: Body): number {
  const order: Body[] = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
  return order.indexOf(b);
}

function capsForBody(body: Body): { capLon: number; capLat: number; gateScale: number } {
  // radians. tune these based on your truncation.
  if (body === "Moon") return { capLon: 30e-6, capLat: 30e-6, gateScale: 15e-6 };
  return { capLon: 8e-6, capLat: 8e-6, gateScale: 6e-6 };
}

function computeGate(residualMag: number, confidence: number, anomaly: number, scale: number): number {
  const a = Math.max(0, Math.min(1, 1 - anomaly));
  const c = Math.max(0, Math.min(1, confidence));
  const r = Math.max(0, Math.min(1, residualMag / scale));
  return a * c * r;
}
