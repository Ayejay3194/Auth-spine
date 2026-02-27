import type { Aspect, AspectType, AstroNowSignals, Body } from "../types/astro.js";
import { angSepDeg, clamp } from "../utils/math.js";

const ASPECTS: { type: AspectType; angle: number; orb: number; weight: number }[] = [
  { type: "CONJ",  angle: 0,   orb: 8, weight: 1.00 },
  { type: "OPP",   angle: 180, orb: 8, weight: 0.95 },
  { type: "SQR",   angle: 90,  orb: 7, weight: 0.90 },
  { type: "TRI",   angle: 120, orb: 7, weight: 0.85 },
  { type: "SEX",   angle: 60,  orb: 5, weight: 0.70 },
  { type: "QUINC", angle: 150, orb: 3, weight: 0.55 },
  { type: "SESQ",  angle: 135, orb: 2.5, weight: 0.45 },
  { type: "SEMI",  angle: 45,  orb: 2.5, weight: 0.40 },
];

function aspectStrength(orbDeg: number, maxOrb: number, baseWeight: number, applying: boolean): number {
  const t = clamp(1 - (orbDeg / maxOrb), 0, 1);
  const applyBoost = applying ? 1.05 : 0.95;
  return clamp(t * baseWeight * applyBoost, 0, 1);
}

function isApplying(lonA: number, speedA: number, lonB: number, speedB: number, targetAngle: number): boolean {
  // crude heuristic: compare relative motion direction near the target
  // For production: compute orb derivative properly.
  const dNow = angSepDeg(lonA, lonB);
  // pretend target is closest at targetAngle; compute signed "distance from target"
  const distNow = Math.abs(dNow - targetAngle);

  const dt = 1 / 24; // 1 hour
  const lonA2 = lonA + speedA * dt;
  const lonB2 = lonB + speedB * dt;
  const d2 = angSepDeg(lonA2, lonB2);
  const dist2 = Math.abs(d2 - targetAngle);

  return dist2 < distNow;
}

export function computeAspects(signals: AstroNowSignals, bodies: Body[]): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const A = signals.bodies[a];
      const B = signals.bodies[b];
      const sep = angSepDeg(A.lonDeg, B.lonDeg);

      for (const def of ASPECTS) {
        const orb = Math.abs(sep - def.angle);
        if (orb <= def.orb) {
          const applying = isApplying(A.lonDeg, A.speedLonDegPerDay, B.lonDeg, B.speedLonDegPerDay, def.angle);
          const strength = aspectStrength(orb, def.orb, def.weight, applying);
          out.push({
            a, b,
            type: def.type,
            orbDeg: orb,
            applying,
            strength
          });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => y.strength - x.strength);
}
