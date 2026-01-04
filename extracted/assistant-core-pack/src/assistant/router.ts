// src/assistant/router.ts
export type Intent = { name: string; tags: string[] };
export type IntentConfig = { version: number; intents: Intent[]; routing: { default: string; max_examples_per_intent: number } };

export function detectIntent(userText: string, cfg: IntentConfig): string {
  const t = userText.toLowerCase();
  for (const intent of cfg.intents) {
    for (const tag of intent.tags) {
      if (tag && t.includes(tag.toLowerCase())) return intent.name;
    }
  }
  return cfg.routing.default;
}
