import { App } from "./app.js";
import type { ChatMessage } from "./core/types.js";
import { buildPromptFromPack } from "./modules/prompt.js";

const app = new App();

const userText = "Where should the follow button go on an artist profile?";
const res = await app.handleAssistant({
  text: userText,
  context: { actor: { kind: "client", clientId: "client_1" }, platform: "web" },
});

console.log("\n--- V1 DIRECT RESPONSE ---\n");
console.log(res);

const messages: ChatMessage[] = [{ role: "user", content: userText }];

const prompt = buildPromptFromPack({ messages, packDir: "data" });
console.log("\n--- OPTIONAL LLM PROMPT (if data pack exists) ---\n");
console.log(prompt.map(m => `[${m.role}] ${m.content}`).join("\n\n"));
