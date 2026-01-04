import type { Vertical, Result } from "@/src/server/core/types";
import type { VerticalConfig } from "./vertical.types";

import beauty from "./configs/beauty.json";
import fitness from "./configs/fitness.json";
import consulting from "./configs/consulting.json";

const ALL = [beauty, fitness, consulting] as unknown as VerticalConfig[];

export class VerticalRegistry {
  list(): VerticalConfig[] {
    return ALL;
  }

  get(vertical: Vertical): Result<VerticalConfig> {
    const v = ALL.find(c => c.vertical === vertical);
    if (!v) return { ok: false, error: { kind: "NOT_FOUND", message: `Unknown vertical: ${vertical}` } };
    return { ok: true, value: v };
  }

  detectFromText(text: string): { vertical: Vertical; confidence: number } {
    const t = text.toLowerCase();
    let best: { vertical: Vertical; score: number } = { vertical: "other", score: 0 };

    for (const cfg of ALL) {
      const score = cfg.conversation_context.keywords.reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0);
      if (score > best.score) best = { vertical: cfg.vertical, score };
    }

    if (best.score === 0) return { vertical: (process.env.DEFAULT_VERTICAL as Vertical) ?? "beauty", confidence: 0.3 };
    return { vertical: best.vertical, confidence: Math.min(1, 0.5 + best.score * 0.15) };
  }
}
