/**
 * Keep exports deterministic and portable.
 * Prefer JSON model exports + deterministic inference in TS.
 */
export function stableStringify(obj: unknown): string {
  const seen = new WeakSet<object>();
  const sortKeys = (x: any): any => {
    if (x && typeof x === "object") {
      if (seen.has(x)) return x;
      seen.add(x);
      if (Array.isArray(x)) return x.map(sortKeys);
      const out: any = {};
      for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
      return out;
    }
    return x;
  };
  return JSON.stringify(sortKeys(obj));
}
