// src/assistant/prompt.ts
import type { JsonlRecord } from "./loader.js";
import type { IntentConfig } from "./router.js";
import { detectIntent } from "./router.js";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type BuildPromptOptions = {
  preamble: string;
  records: JsonlRecord[];
  intents: IntentConfig;
  messages: ChatMessage[];
  maxExamplesPerIntent?: number;
};

function pickRecords(records: JsonlRecord[], types: string[]) {
  return records.filter(r => types.includes(r.type));
}

function pickExamples(records: JsonlRecord[], intent: string, limit: number) {
  return records
    .filter(r => r.type === "example" && r.intent === intent && Array.isArray(r.messages))
    .slice(0, limit);
}

export function buildPrompt(opts: BuildPromptOptions): ChatMessage[] {
  const { preamble, records, intents, messages } = opts;
  const userLast = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const intent = detectIntent(userLast, intents);
  const limit = opts.maxExamplesPerIntent ?? intents.routing.max_examples_per_intent;

  const systems = pickRecords(records, ["system"]).map(r => ({ role: "system" as const, content: r.text ?? "" }));
  const policies = pickRecords(records, ["policy"]).map(r => ({ role: "system" as const, content: r.text ?? "" }));
  const styles = pickRecords(records, ["style"]).flatMap(r => (r.rules ?? []).map((x: string) => ({ role: "system" as const, content: x })));
  const behaviors = pickRecords(records, ["behavior"]).map(r => ({ role: "system" as const, content: r.text ?? "" }));

  const examples = pickExamples(records, intent, limit).flatMap(r => r.messages as any[]);

  const pre = [{ role: "system" as const, content: preamble }];

  // Final prompt order: preamble -> systems -> policies -> styles -> behaviors -> examples -> conversation
  return [
    ...pre,
    ...systems.filter(m => m.content),
    ...policies.filter(m => m.content),
    ...styles.filter(m => m.content),
    ...behaviors.filter(m => m.content),
    ...examples.map(m => ({ role: m.role, content: m.content })),
    ...messages,
  ];
}
