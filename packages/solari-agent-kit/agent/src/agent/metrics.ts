export interface RunSignal {
  ok: boolean;
  repaired: boolean;
  confidenceLabel?: "HIGH"|"MEDIUM"|"LOW";
}

export function updateRolling(history: RunSignal[], next: RunSignal, window: number) {
  const h = [...history, next];
  return h.length > window ? h.slice(h.length - window) : h;
}

export function computeRates(history: RunSignal[]) {
  const n = history.length || 1;
  const ok = history.filter(x => x.ok).length / n;
  const repaired = history.filter(x => x.repaired).length / n;
  const lowConf = history.filter(x => x.confidenceLabel === "LOW").length / n;
  return { ok, repaired, lowConf };
}
