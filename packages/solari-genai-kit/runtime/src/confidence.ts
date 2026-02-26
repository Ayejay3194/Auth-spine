export type ConfidenceLabel = "HIGH" | "MEDIUM" | "LOW";

export interface ConfidenceSignals {
  schemaOk: boolean;
  repaired: boolean;
  hasCitations: boolean;
  citationsCount: number;
  usedTools: boolean;
  toolOk: boolean;
  outputLengthChars: number;
}

export interface ConfidenceResult {
  score01: number; // 0..1
  label: ConfidenceLabel;
  reasons: string[];
}

/**
 * Minimal, auditable confidence scoring.
 * Not "AI confidence" (which is mostly fake), but pipeline confidence:
 * - schema validity
 * - whether we had to repair JSON
 * - whether citations exist (when schema expects them)
 * - whether tool output was used (when available)
 */
export function scoreConfidence(sig: ConfidenceSignals): ConfidenceResult {
  let score = 1.0;
  const reasons: string[] = [];

  if (!sig.schemaOk) {
    score = 0.0;
    reasons.push("schema_invalid");
    return { score01: 0.0, label: "LOW", reasons };
  }

  if (sig.repaired) {
    score -= 0.25;
    reasons.push("needed_json_repair");
  }

  if (!sig.hasCitations) {
    score -= 0.20;
    reasons.push("missing_citations");
  } else if (sig.citationsCount < 1) {
    score -= 0.10;
    reasons.push("empty_citations");
  }

  if (sig.usedTools && !sig.toolOk) {
    score -= 0.25;
    reasons.push("tool_failed");
  }

  if (sig.outputLengthChars < 60) {
    score -= 0.10;
    reasons.push("too_short");
  }

  score = Math.max(0, Math.min(1, score));

  const label: ConfidenceLabel = score >= 0.75 ? "HIGH" : score >= 0.5 ? "MEDIUM" : "LOW";
  return { score01: score, label, reasons };
}
