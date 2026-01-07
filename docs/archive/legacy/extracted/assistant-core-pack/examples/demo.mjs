// examples/demo.mjs
import fs from "node:fs";
import path from "node:path";
import { loadJsonl } from "../src/assistant/loader.js";
import { buildPrompt } from "../src/assistant/prompt.js";

const preamble = fs.readFileSync(path.resolve("data/prompt_preamble.txt"), "utf-8");
const intents = JSON.parse(fs.readFileSync(path.resolve("data/intents.json"), "utf-8"));
const records = loadJsonl(path.resolve("data/assistant_core.jsonl"));

const conversation = [
  { role: "user", content: "Give me TS code for a bio page layout with no images." }
];

const prompt = buildPrompt({ preamble, intents, records, messages: conversation });
console.log("\n--- PROMPT MESSAGES (send to your LLM) ---\n");
console.log(prompt.map(m => `[${m.role}] ${m.content}`).join("\n\n"));
