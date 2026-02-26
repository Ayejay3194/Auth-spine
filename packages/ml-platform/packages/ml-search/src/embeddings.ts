export type Vec = readonly number[];

export interface Embedder<Input> {
  embed(input: Input): Vec;
}

export function cosineSim(a: Vec, b: Vec): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const den = Math.sqrt(na) * Math.sqrt(nb) || 1e-9;
  return dot / den;
}
