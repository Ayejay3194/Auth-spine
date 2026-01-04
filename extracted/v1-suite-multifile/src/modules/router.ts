import type { IntentConfig } from "./prompt.js";

export function detectIntent(userText: string, cfg: IntentConfig): string {
  const t = userText.toLowerCase();
  for (const intent of cfg.intents) {
    for (const tag of intent.tags) {
      if (tag && t.includes(tag.toLowerCase())) return intent.name;
    }
  }
  return cfg.routing.default;
}
