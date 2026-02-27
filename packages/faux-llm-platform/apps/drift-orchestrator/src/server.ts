import { createServer } from "node:http";
import { LlmClient } from "@aj/llm-client";
import { PolicyEngine } from "@aj/policy";
import { ToolRegistry } from "@aj/tools";
import { calcTool, echoTool } from "@aj/tools";
import { InMemoryKeywordStore, chunkText } from "@aj/rag";

type Json = Record<string, any>;

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c: any) => data += c);
    req.on("end", () => resolve(data));
  });
}

function safeJsonParse(s: string): { ok: boolean; value?: any; error?: string } {
  try { return { ok: true, value: JSON.parse(s) }; } catch (e: any) { return { ok: false, error: e?.message ?? "json_parse_error" }; }
}

function jsonRepair(raw: string): string {
  const t = raw.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

async function callWithRepair(llm: LlmClient, req: any, maxAttempts: number): Promise<{ content: string; parsed?: any; attempts: number }> {
  let last = "";
  for (let i = 0; i < maxAttempts; i++) {
    const res = await llm.chat(req);
    const content = res.choices?.[0]?.message?.content ?? "";
    last = content;

    const repaired = jsonRepair(content);
    const parsed = safeJsonParse(repaired);
    if (parsed.ok) return { content, parsed: parsed.value, attempts: i + 1 };

    req = {
      ...req,
      messages: [
        ...req.messages,
        { role: "user", content: "Your last output was invalid JSON. Output ONLY valid JSON object, no prose. Fix it now." }
      ]
    };
  }
  return { content: last, attempts: maxAttempts };
}

export function makeOrchestrator(appId: string, allowedTools: string[]) {
  const policy = new PolicyEngine({
    appId,
    allowedTools,
    maxRepairAttempts: 3,
    maxContextChars: 40_000,
    temperature: 0.2
  });

  const llm = new LlmClient({
    baseUrl: process.env.LLM_BASE_URL ?? "http://localhost:8000/v1",
    apiKey: process.env.LLM_API_KEY ?? "local",
    defaultModel: process.env.LLM_MODEL ?? "local-model",
    timeoutMs: 60_000
  });

  const tools = new ToolRegistry();
  tools.register("calc", calcTool);
  tools.register("echo", echoTool);

  const rag = new InMemoryKeywordStore();

  async function ingestDoc(docId: string, text: string) {
    const chunks = chunkText(docId, text, { maxChars: 1200, overlapChars: 120 });
    await rag.upsert(chunks);
    return { ok: true, chunks: chunks.length };
  }

  async function chat(userText: string): Promise<Json> {
    const ctxChunks = await rag.retrieve({ query: userText, k: 6 });
    const context = ctxChunks.map(c => `[[${c.id}]]\n${c.text}`).join("\n\n");

    const p = policy.get();
    const system = [
      `You are ${appId}.`,
      `You must respond with ONE JSON object only.`,
      `If you need a tool, return { "type":"tool_call", "payload": { "tool": "...", "args": {...} } }`,
      `Otherwise return { "type":"answer", "payload": { "text":"...", "citations":[...optional...] } }`,
      `Allowed tools: ${p.allowedTools.join(", ") || "(none)"}.`,
      `Never call tools that are not allowed.`
    ].join("\n");

    const req = {
      messages: [
        { role: "system", content: system },
        { role: "user", content: `CONTEXT:\n${context}\n\nUSER:\n${userText}` }
      ],
      temperature: p.temperature,
      max_tokens: 800
    };

    const out = await callWithRepair(llm, req, p.maxRepairAttempts);
    const parsed = out.parsed;

    if (!parsed || typeof parsed !== "object") {
      return { type: "error", payload: { message: "model_failed_to_return_json", raw: out.content } };
    }

    if (parsed.type === "tool_call") {
      const tool = parsed.payload?.tool;
      const args = parsed.payload?.args ?? {};
      if (typeof tool !== "string" || !policy.isToolAllowed(tool)) {
        return { type: "error", payload: { message: "tool_not_allowed", tool } };
      }
      const result = await tools.run(tool, args);
      return { type: "answer", payload: { text: "Tool executed.", toolResult: result, attempts: out.attempts } };
    }

    return { ...parsed, meta: { attempts: out.attempts } };
  }

  return { ingestDoc, chat };
}

export function startServer(appId: string, allowedTools: string[], port: number) {
  const orch = makeOrchestrator(appId, allowedTools);

  const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/ingest") {
      const body = await readBody(req);
      const j = safeJsonParse(body);
      if (!j.ok) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: "bad_json" })); }
      const docId = String(j.value.docId ?? "doc");
      const text = String(j.value.text ?? "");
      const out = await orch.ingestDoc(docId, text);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(out));
    }

    if (req.method === "POST" && req.url === "/chat") {
      const body = await readBody(req);
      const j = safeJsonParse(body);
      if (!j.ok) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: "bad_json" })); }
      const text = String(j.value.text ?? "");
      const out = await orch.chat(text);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(out));
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`${appId} running. POST /ingest or /chat`);
  });

  server.listen(port);
  console.log(`${appId} listening on http://localhost:${port}`);
}


startServer("Drift", ["echo"], 5052);
