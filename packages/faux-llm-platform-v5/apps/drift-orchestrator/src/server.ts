import { createServer } from "node:http";
import { LlmClient } from "@aj/llm-client";
import { PolicyEngine } from "@aj/policy";
import { ToolRegistry } from "@aj/tools";
import { calcTool, echoTool } from "@aj/tools";
import { InMemoryKeywordStore, chunkText, retrievalConfidence } from "@aj/rag";
import { validateAssistantResponse, validateToolCall } from "@aj/schemas";
import { newSession, addEvent, setTurnStart, addGoal, pruneExpiredNotes, makeId } from "@aj/state";
import { InMemoryStore, makeNote, revise } from "@aj/memory";
import { selectArm, updateArm } from "@aj/learning";
import { loadConfig } from "@aj/config";
import { makePool, Repo } from "@aj/storage-postgres";
import { rewardFromFeedback, type Feedback } from "@aj/learning";

type Json = Record<string, any>;

const sessions = new Map<string, ReturnType<typeof newSession>>();
const memory = new InMemoryStore();
const pendingActions = new Map<string, { tenantId: string; appId: string; sessionId: string; createdAt: number; action: any }>();
const banditState = { arms: {} as Record<string, { pulls: number; rewardSum: number }> };

const cfg = loadConfig(process.env);
const repo = cfg.databaseUrl ? new Repo(makePool(cfg.databaseUrl)) : null;


function getSession(sessionId: string) {
  let st = sessions.get(sessionId);
  if (!st) { st = newSession(sessionId); sessions.set(sessionId, st); }
  pruneExpiredNotes(st);
  return st;
}


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
  const appIdForStore = appId;
  const policy = new PolicyEngine({
    appId,
    allowedTools,
    maxRepairAttempts: 3,
    maxContextChars: 40_000,
    temperature: 0.2
  });

  const llm = new LlmClient({
    baseUrl: cfg.llmBaseUrl,
    apiKey: cfg.llmApiKey,
    defaultModel: cfg.llmModel,
    timeoutMs: 60_000
  });

  const tools = new ToolRegistry();
tools.register("calc", calcTool);
tools.register("echo", echoTool);

// Side-effect safety pattern:
// 1) propose_action returns an actionId the UI/user must confirm
// 2) execute_action requires that actionId
tools.register("propose_action", async (args) => {
  const kind = String(args["kind"] ?? "unknown");
  const payload = args["payload"] ?? {};
  const actionId = "act_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  // session/tenant are attached later at runtime; this tool is pure.
  pendingActions.set(actionId, { tenantId: "unknown", appId: "unknown", sessionId: "unknown", createdAt: Date.now(), action: { kind, payload } });
  return { ok: true, result: { actionId, kind, payload, needsConfirmation: true } };
});

tools.register("execute_action", async (args) => {
  const actionId = String(args["actionId"] ?? "");
  const ok = pendingActions.has(actionId);
  if (!ok) return { ok: false, error: "action_not_found_or_not_confirmed" };
  const a = pendingActions.get(actionId)!;
  // In real prod, you would route `a.action.kind` to your domain handlers.
  pendingActions.delete(actionId);
  return { ok: true, result: { executed: true, actionId, action: a.action } };
});

  const rag = new InMemoryKeywordStore();

  async function ingestDoc(tenantId: string, docId: string, text: string) {
    const chunks = chunkText(docId, text, { maxChars: 1200, overlapChars: 120 });
    await rag.upsert(chunks);
    if (repo) {
      await repo.upsertChunks({ tenantId, appId: appIdForStore, docId, version: 1, chunks: chunks.map(c => ({ id: c.id, text: c.text, meta: c.meta })) });
    }
    return { ok: true, chunks: chunks.length };
  }

  async function chat(tenantId: string, sessionId: string, userText: string, goalText?: string): Promise<Json> {
    let toolCalls = 0;
    const st = getSession(sessionId);
    if (repo) {
      const saved = await repo.getSession({ tenantId, appId: appIdForStore, sessionId });
      if (saved && typeof saved === 'object') {
        // naive restore
        Object.assign(st, saved);
      }
    }
    setTurnStart(st);
    const turnId = makeId('turn');
    addEvent(st, 'user_message', { turnId, text: userText });
    if (repo) await repo.insertEvent({ tenantId, appId: appIdForStore, sessionId, eventId: makeId('evt'), t: Date.now(), type: 'user_message', data: { turnId, text: userText } });
    if (goalText && goalText.trim()) { const g = addGoal(st, goalText.trim()); addEvent(st, 'policy', { turnId, addedGoal: g }); }
    let scored = await rag.retrieveScored!({ query: userText, k: 6 });
    if (repo && scored.length === 0) {
      const pg = await repo.retrieveChunksScored({ tenantId, appId: appIdForStore, query: userText, k: 6 });
      // map into rag scored shape
      scored = pg.map(p => ({ chunk: { id: p.chunkId, text: p.text, meta: p.meta }, score: Math.max(0, Math.min(1, (p.score ?? 0) / 5)) }));
    }
    const ctxChunks = scored.map(s => s.chunk);
    const conf = retrievalConfidence(scored);
    st.last.retrievalConfidence = conf;
    addEvent(st, 'retrieval', { turnId, confidence: conf, chunks: ctxChunks.map(c => c.id) });
    const context = ctxChunks.map(c => `[[${c.id}]]\n${c.text}`).join("\n\n");

    const p = policy.get();
    const strategies = ['strict_json', 'strict_json_with_citations'];
    const strategy = selectArm(banditState as any, strategies, { epsilon: 0.1 });
    addEvent(st, 'policy', { turnId, strategy });

    const system = [
      `You are ${appId}.`,
      `You must respond with ONE JSON object only.`,
      `If you need a tool, return { "type":"tool_call", "payload": { "tool": "...", "args": {...} } }`,
      strategy === 'strict_json_with_citations' ? `If you answer, include citations to chunk ids like [[doc:chunk]].` : `Citations are optional unless asked.`,
      `Otherwise return { "type":"answer", "payload": { "text":"...", "citations":[...optional...] } }`,
      `Allowed tools: ${p.allowedTools.join(", ") || "(none)"}.`,
      `Never call tools that are not allowed.`,
      `If retrieval confidence is low, you must say you do not know instead of guessing.`
    ].join("\n");

    const req = {
      messages: [
        { role: "system", content: system },
        { role: "user", content: `MEMORY:\n${(repo ? (await repo.queryMemory({ tenantId, appId: appIdForStore, contains: userText, limit: 6 })) : (await memory.query({ contains: userText, limit: 6 }))).map(n => `- ${n.key}: ${n.value} (c=${n.confidence.toFixed(2)})`).join("\n") }\n\nCONTEXT:\n${context}\n\nUSER:\n${userText}` }
      ],
      temperature: p.temperature,
      max_tokens: 800
    };

    const out = await callWithRepair(llm, req, p.maxRepairAttempts);
    const parsed = out.parsed;

    if (!parsed || typeof parsed !== "object") {
      return { type: "error", payload: { message: "model_failed_to_return_json", raw: out.content } };
    }
// Schema validation (JSON parse is not enough)
const vr = validateAssistantResponse(parsed);
if (!vr.ok) {
  return { type: "error", payload: { message: "schema_validation_failed", issues: vr.issues, raw: out.content } };
}


    addEvent(st, 'assistant_answer', { turnId, raw: out.content, parsed });

    if (parsed.type === "tool_call") {
      const tc = parsed.payload;
      const tv = validateToolCall(tc);
      if (!tv.ok) {
        return { type: "error", payload: { message: "tool_call_schema_invalid", issues: tv.issues, raw: out.content } };
      }
      const tool = tc.tool;
      const args = tc.args ?? {};
      if (typeof tool !== "string" || !policy.isToolAllowed(tool)) {
        return { type: "error", payload: { message: "tool_not_allowed", tool } };
      }
      toolCalls += 1;
      if (toolCalls > 1) {
        return { type: "error", payload: { message: "tool_loop_detected", tool } };
      }
      addEvent(st, 'tool_call', { turnId, tool, args });
      const result = await tools.run(tool, args);
      addEvent(st, 'tool_result', { turnId, tool, result });
      return { type: "answer", payload: { text: "Tool executed.", toolResult: result, attempts: out.attempts }, meta: { retrievalConfidence: conf, strategy } };
    }

    // Low-confidence retrieval gate: do NOT guess.
    if (conf < 0.25 && parsed.type === "answer") {
      addEvent(st, 'assistant_answer', { turnId, gated: true, reason: 'low_retrieval_confidence' });
      return { type: "answer", payload: { text: "I don’t have that in my knowledge base yet.", citations: [] }, meta: { attempts: out.attempts, retrievalConfidence: conf, strategy } };
    }

// Lightweight memory extraction (deterministic heuristic). Upgrade later.
const m = userText.match(/\bmy\s+([a-zA-Z0-9_ -]{2,40})\s+is\s+(.{1,80})$/i);
if (m) {
  const key = m[1]!.trim().toLowerCase().replace(/\s+/g, "_");
  const value = m[2]!.trim();
  const note = makeNote({ key, value, confidence: 0.7, source: "user" });
  await revise(memory, note);
  addEvent(st, 'policy', { turnId, memoryWrite: { key, value } });
}

    if (repo) await repo.upsertSession({ tenantId, appId: appIdForStore, sessionId, state: st as any });
    return { ...parsed, meta: { attempts: out.attempts, retrievalConfidence: conf, strategy } };
  }

  return { ingestDoc, chat };
}

export function startServer(appId: string, allowedTools: string[], port: number) {
  const appIdForStore = appId;
  const orch = makeOrchestrator(appId, allowedTools);

  const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/ingest") {
      const body = await readBody(req);
      const j = safeJsonParse(body);
      if (!j.ok) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: "bad_json" })); }
      const docId = String(j.value.docId ?? "doc");
      const text = String(j.value.text ?? "");
      const tenantId = String(j.value.tenantId ?? cfg.tenantIdDefault);
      const out = await orch.ingestDoc(tenantId, docId, text);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(out));
    }

    if (req.method === "POST" && req.url === "/chat") {
      const body = await readBody(req);
      const j = safeJsonParse(body);
      if (!j.ok) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: "bad_json" })); }
      const text = String(j.value.text ?? "");
      const sessionId = String(j.value.sessionId ?? "default");
      const tenantId = String(j.value.tenantId ?? cfg.tenantIdDefault);
      const goal = j.value.goal ? String(j.value.goal) : undefined;
      const out = await orch.chat(tenantId, sessionId, text, goal);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(out));
    }

if (req.method === "POST" && req.url === "/feedback") {
  const body = await readBody(req);
  const j = safeJsonParse(body);
  if (!j.ok) { res.writeHead(400); return res.end(JSON.stringify({ ok: false, error: "bad_json" })); }
  const fb: Feedback = {
    sessionId: String(j.value.sessionId ?? "default"),
    turnId: String(j.value.turnId ?? "unknown"),
    score: (j.value.score === 1 ? 1 : (j.value.score === -1 ? -1 : 0)) as any,
    note: j.value.note ? String(j.value.note) : undefined
  };
  const st = getSession(fb.sessionId);
  addEvent(st, "feedback", fb as any);
  const reward = rewardFromFeedback(fb);
  // reward the current strategy if it exists on last policy event; simplistic but works
  const lastPolicy = [...st.events].reverse().find(e => e.type === "policy" && (e.data as any).strategy);
  const strategy = lastPolicy ? String((lastPolicy.data as any).strategy) : "strict_json";
  updateArm(banditState as any, strategy, reward);
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify({ ok: true, reward, strategy, banditState }));
}

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`${appId} running. POST /ingest or /chat`);
  });

  server.listen(port);
  console.log(`${appId} listening on http://localhost:${port}`);
}


startServer("Drift", ["echo"], 5052);
