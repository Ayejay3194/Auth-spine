export interface QaIssue {
  severity: "ERROR" | "WARN" | "INFO";
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface QaReport {
  ok: boolean;
  issues: QaIssue[];
}

export function checkRequiredKeys(rows: any[], keys: string[]): QaIssue[] {
  const issues: QaIssue[] = [];
  rows.forEach((r, i) => {
    for (const k of keys) {
      if (!(k in r)) issues.push({ severity: "ERROR", code: "missing_key", message: `Row ${i} missing ${k}`, meta: { i, k } });
    }
  });
  return issues;
}

export function checkFeatureScale(matrix: number[][], ratioWarn = 1e3): QaIssue[] {
  if (matrix.length == 0) return [];
  const d = matrix[0]!.length;
  const mins = Array(d).fill(Infinity);
  const maxs = Array(d).fill(-Infinity);
  for (const row of matrix) {
    for (let j = 0; j < d; j++) {
      const v = row[j]!;
      if (!Number.isFinite(v)) continue;
      mins[j] = Math.min(mins[j], v);
      maxs[j] = Math.max(maxs[j], v);
    }
  }
  const ranges = mins.map((mn, j) => Math.max(1e-9, maxs[j]! - mn));
  const minR = Math.min(...ranges);
  const maxR = Math.max(...ranges);
  if (maxR / minR >= ratioWarn) {
    return [{ severity: "WARN", code: "scale_mismatch", message: "Feature scales differ massively; consider standardization.", meta: { minR, maxR } }];
  }
  return [];
}

export function checkLeakage(featureNames: string[], suspicious: string[] = ["label","target","y","outcome"]): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const n of featureNames) {
    const ln = n.toLowerCase();
    if (suspicious.some(s => ln.includes(s))) issues.push({ severity: "WARN", code: "possible_leakage", message: `Feature looks target-like: ${n}` });
  }
  return issues;
}

export function checkClassImbalance(labels: Array<string | number>, maxMinorityFrac = 0.1): QaIssue[] {
  const counts = new Map<string, number>();
  for (const y of labels) counts.set(String(y), (counts.get(String(y)) ?? 0) + 1);
  const total = labels.length || 1;
  const fracs = [...counts.entries()].map(([k, c]) => ({ k, frac: c / total }));
  const minFrac = Math.min(...fracs.map(f => f.frac));
  if (minFrac < maxMinorityFrac) {
    return [{ severity: "WARN", code: "class_imbalance", message: "Minority class very small; consider weighting/resampling.", meta: { fracs } }];
  }
  return [];
}

export function checkMissing(matrix: number[][]): QaIssue[] {
  let missing = 0, total = 0;
  for (const row of matrix) {
    for (const v of row) {
      total++;
      if (v == null || !Number.isFinite(v)) missing++;
    }
  }
  const frac = missing / Math.max(1, total);
  if (frac > 0) {
    return [{ severity: "WARN", code: "missing_values", message: "Missing/NaN values present; impute or drop.", meta: { missing, total, frac } }];
  }
  return [];
}

export function buildReport(issues: QaIssue[]): QaReport {
  const ok = !issues.some(i => i.severity === "ERROR");
  return { ok, issues };
}
