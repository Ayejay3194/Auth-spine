import { initialState } from "./state.js";
import { agentLoop } from "./loop.js";

const MODEL_BASE_URL = process.env.MODEL_BASE_URL || "http://localhost:8080";
const API_KEY = process.env.API_KEY;

async function main() {
  let state = initialState("solari", ["Produce accurate, structured outputs"]);
  state = await agentLoop(state, "Generate a structured report about retention.", MODEL_BASE_URL, API_KEY);
  console.log(state);
}

main();
