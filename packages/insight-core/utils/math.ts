export const TAU = Math.PI * 2;

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function wrapDeg(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

export function angSepDeg(a: number, b: number): number {
  // smallest angle separation in degrees, 0..180
  const d = Math.abs(wrapDeg(a) - wrapDeg(b));
  return d > 180 ? 360 - d : d;
}

export function signPow(x: number, p: number): number {
  return Math.sign(x) * Math.pow(Math.abs(x), p);
}
