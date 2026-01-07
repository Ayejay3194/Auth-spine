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

function pick(records: JsonlRecord[], type: string) {
  return records.filter(r => r.type === type);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickExamples(records: JsonlRecord[], intent: string, limit: number) {
  const arr = records.filter(r => r.type === "example" && r.intent === intent && Array.isArray(r.messages));
  return shuffle(arr).slice(0, limit);
}

export function buildPrompt(opts: BuildPromptOptions): ChatMessage[] {
  const { preamble, records, intents, messages } = opts;
  const userLast = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const intent = detectIntent(userLast, intents);
  const limit = opts.maxExamplesPerIntent ?? intents.routing.max_examples_per_intent;

  const systems = pick(records, "system").map(r => r.text).filter(Boolean);
  const policies = pick(records, "policy").map(r => r.text).filter(Boolean);
  const styles = pick(records, "style").flatMap(r => (r.rules ?? [])).filter(Boolean);
  const behaviors = pick(records, "behavior").map(r => r.text).filter(Boolean);
  const examples = pickExamples(records, intent, limit).flatMap(r => r.messages);

  const out: ChatMessage[] = [];
  out.push({ role: "system", content: preamble });
  for (const s of systems) out.push({ role: "system", content: s });
  for (const p of policies) out.push({ role: "system", content: p });
  for (const s of styles) out.push({ role: "system", content: s });
  for (const b of behaviors) out.push({ role: "system", content: b });
  for (const m of examples) out.push({ role: m.role, content: m.content });
  for (const m of messages) out.push(m);
  return out;
}
