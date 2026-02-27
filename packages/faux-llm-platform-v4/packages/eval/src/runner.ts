import type { EvalCase, EvalResult } from "./types";

export function simpleEval(cases: EvalCase[], outputs: Record<string, string>): EvalResult[] {
  return cases.map(c => {
    const out = outputs[c.id] ?? "";
    const issues: string[] = [];
    for (const s of (c.mustContain ?? [])) if (!out.includes(s)) issues.push("missing:" + s);
    for (const s of (c.mustNotContain ?? [])) if (out.includes(s)) issues.push("contains_forbidden:" + s);
    return { id: c.id, ok: issues.length === 0, issues };
  });
}
