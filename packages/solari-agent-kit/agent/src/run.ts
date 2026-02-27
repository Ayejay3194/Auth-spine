import path from "path";
import { agentLoop } from "./agent/loop.js";
import { ensureDir } from "./storage/fsStore.js";

const MODEL_BASE_URL = process.env.MODEL_BASE_URL || "http://localhost:8080";
const API_KEY = process.env.API_KEY;

const storageDir = path.resolve("storage");
ensureDir(storageDir);

const stateFile = path.join(storageDir, "state.json");
const eventsFile = path.join(storageDir, "events.jsonl");
const learningFile = path.join(storageDir, "learning.jsonl");

async function main() {
  const input = process.argv.slice(2).join(" ") || "Generate a structured report about retention in a booking app.";
  const res = await agentLoop({ modelBaseUrl: MODEL_BASE_URL, apiKey: API_KEY, input, stateFile, eventsFile, learningFile });
  console.log(JSON.stringify(res, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
