// scripts/build-prompt.mjs
import fs from "node:fs";
import path from "node:path";
import { loadJsonl } from "../src/assistant/loader.js";
import { buildPrompt } from "../src/assistant/prompt.js";

const preamble = fs.readFileSync(path.resolve("data/prompt_preamble.txt"), "utf-8");
const intents = JSON.parse(fs.readFileSync(path.resolve("data/intents.json"), "utf-8"));
const records = loadJsonl(path.resolve("data/assistant_core.jsonl"));

const messages = [
  { role: "user", content: "Where should I put the follow button on an artist profile page?" }
];

const prompt = buildPrompt({ preamble, intents, records, messages });
console.log(JSON.stringify(prompt, null, 2));
