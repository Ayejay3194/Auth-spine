/**
 * Eval gates: fail builds if quality drops.
 */
export interface Gate {
  metric: string;
  op: ">=" | "<=" | ">" | "<";
  value: number;
}

export function checkGates(metrics: Record<string, number>, gates: Gate[]): { ok: boolean; failures: string[] } {
  const failures: string[] = [];
  for (const g of gates) {
    const v = metrics[g.metric];
    if (typeof v !== "number") { failures.push(`missing:${g.metric}`); continue; }
    const ok =
      g.op === ">=" ? v >= g.value :
      g.op === "<=" ? v <= g.value :
      g.op === ">"  ? v >  g.value :
      v < g.value;
    if (!ok) failures.push(`${g.metric}:${v} ${g.op} ${g.value} FAILED`);
  }
  return { ok: failures.length === 0, failures };
}
