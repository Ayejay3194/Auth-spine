import type { ChatMessage } from "../core/types.js";
import type { JsonlRecord } from "../core/loader.js";
import { loadJsonl, loadJson, loadText, exists } from "../core/loader.js";
import { detectIntent } from "./router.js";

export type Intent = { name: string; tags: string[] };
export type IntentConfig = { version: number; intents: Intent[]; routing: { default: string; max_examples_per_intent: number } };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(records: JsonlRecord[], type: string) {
  return records.filter(r => r.type === type);
}

function pickExamples(records: JsonlRecord[], intent: string, limit: number) {
  const arr = records.filter(r => r.type === "example" && r.intent === intent && Array.isArray(r.messages));
  return shuffle(arr).slice(0, limit).flatMap(r => r.messages as ChatMessage[]);
}

export function buildPromptFromPack(input: {
  messages: ChatMessage[];
  packDir?: string; // default: data/
}): ChatMessage[] {
  const packDir = input.packDir ?? "data";
  const preamblePath = `${packDir}/prompt_preamble.txt`;
  const intentsPath = `${packDir}/intents.json`;
  const recordsPath = `${packDir}/assistant_core.jsonl`;

  if (!exists(preamblePath) || !exists(intentsPath) || !exists(recordsPath)) {
    // No pack present: return messages as-is
    return input.messages;
  }

  const preamble = loadText(preamblePath);
  const intents = loadJson(intentsPath) as IntentConfig;
  const records = loadJsonl(recordsPath);

  const userLast = [...input.messages].reverse().find(m => m.role === "user")?.content ?? "";
  const intent = detectIntent(userLast, intents);
  const limit = intents.routing.max_examples_per_intent ?? 6;

  const systems = pick(records, "system").map(r => r.text).filter(Boolean);
  const policies = pick(records, "policy").map(r => r.text).filter(Boolean);
  const styles = pick(records, "style").flatMap(r => (r.rules ?? [])).filter(Boolean);
  const behaviors = pick(records, "behavior").map(r => r.text).filter(Boolean);

  const examples = pickExamples(records, intent, limit);

  const out: ChatMessage[] = [];
  out.push({ role: "system", content: preamble });
  for (const s of systems) out.push({ role: "system", content: s });
  for (const p of policies) out.push({ role: "system", content: p });
  for (const s of styles) out.push({ role: "system", content: s });
  for (const b of behaviors) out.push({ role: "system", content: b });
  for (const m of examples) out.push(m);
  for (const m of input.messages) out.push(m);
  return out;
}
