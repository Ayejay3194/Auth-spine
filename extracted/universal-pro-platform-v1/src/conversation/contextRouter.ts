import type { Vertical } from "../core/types.js";
import type { VerticalConfig } from "../platform/verticalConfig.js";

export class ContextRouter {
  constructor(private configs: VerticalConfig[]) {}

  detectVertical(message: string): Vertical {
    const t = message.toLowerCase();
    let best: { vertical: Vertical; score: number } = { vertical: "other", score: 0 };

    for (const cfg of this.configs) {
      const score = cfg.conversationHints.reduce((s, hint) => s + (t.includes(hint.toLowerCase()) ? 1 : 0), 0);
      if (score > best.score) best = { vertical: cfg.vertical, score };
    }
    return best.vertical;
  }
}
