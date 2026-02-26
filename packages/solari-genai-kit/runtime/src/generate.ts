import { chatCompletion } from "./openaiCompat.js";
import { extractFirstJson } from "./jsonExtract.js";
import { validateSchema, SchemaName } from "./schema.js";
import { runTool } from "./tools.js";

export async function generateControlled(inp: {
  modelBaseUrl: string; apiKey?: string; schemaName: SchemaName;
  userPrompt: string; context?: Record<string, unknown>;
}) {
  const system = [
    "You are Solari, a precise assistant.",
    "You MUST output valid JSON and nothing else.",
    "Never include markdown. Never include commentary."
  ].join("\n");

  const schemaHint =
    inp.schemaName === "report"
      ? "Schema report: {title, summary, bullets[], actions[], cautions[], citations[{sourceId,quote}]}"
      : "Schema toolcall: {tool, args}";

  const user = [
    schemaHint,
    inp.context ? `Context JSON: ${JSON.stringify(inp.context)}` : "",
    `User request: ${inp.userPrompt}`,
    "Return JSON only."
  ].filter(Boolean).join("\n\n");

  const raw = await chatCompletion(inp.modelBaseUrl, inp.apiKey, [
    { role:"system", content: system },
    { role:"user", content: user }
  ], { temperature: 0.2, max_tokens: 900 });

  const obj = extractFirstJson(raw);
  if (!obj) return { ok:false, error:"Could not parse JSON", raw };

  const v = validateSchema(inp.schemaName, obj);
  if (v.ok) return { ok:true, data: obj, raw };

  // one repair attempt
  const repair = await chatCompletion(inp.modelBaseUrl, inp.apiKey, [
    { role:"system", content: system },
    { role:"user", content: user },
    { role:"assistant", content: raw },
    { role:"user", content: `Fix JSON to match schema. Errors: ${v.errors?.join("; ")}` }
  ], { temperature: 0.0, max_tokens: 900 });

  const obj2 = extractFirstJson(repair);
  if (!obj2) return { ok:false, error:"Repair parse failed", raw: repair, errors: v.errors };

  const v2 = validateSchema(inp.schemaName, obj2);
  if (!v2.ok) return { ok:false, error:"Repair still invalid", raw: repair, errors: v2.errors };

  return { ok:true, data: obj2, raw: repair };
}

export async function generateWithTools(inp: {
  modelBaseUrl: string; apiKey?: string; userPrompt: string; context?: Record<string, unknown>;
  finalSchema: SchemaName;
}) {
  const toolCall = await generateControlled({
    modelBaseUrl: inp.modelBaseUrl,
    apiKey: inp.apiKey,
    schemaName: "toolcall",
    userPrompt: inp.userPrompt + "\n\nIf you need facts, request ONE tool call. Otherwise call calcEphemeris with {}.",
    context: inp.context
  });

  if (!toolCall.ok) return toolCall;

  const tool = toolCall.data.tool;
  const args = toolCall.data.args;
  const toolResult = await runTool(tool, args);

  return generateControlled({
    modelBaseUrl: inp.modelBaseUrl,
    apiKey: inp.apiKey,
    schemaName: inp.finalSchema,
    userPrompt: inp.userPrompt,
    context: { ...(inp.context ?? {}), toolCall: { tool, args }, toolResult }
  });
}
