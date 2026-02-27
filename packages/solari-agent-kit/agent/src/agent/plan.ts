import { chatCompletion } from "../llm/openaiCompat.js";
import { extractFirstJson } from "../llm/jsonExtract.js";
import { validateSchema } from "../llm/schema.js";

export async function plan(modelBaseUrl: string, apiKey: string|undefined, input: string, context: any) {
  const system = [
    "You are Solari Planner.",
    "You MUST output valid JSON matching the plan schema and nothing else.",
    "Use tools for factual claims. Keep steps minimal."
  ].join("\n");

  const user = [
    "Create a plan JSON with steps to satisfy the user request.",
    `User request: ${input}`,
    `Context JSON: ${JSON.stringify(context)}`,
    "Return JSON only."
  ].join("\n\n");

  const raw = await chatCompletion(modelBaseUrl, apiKey, [
    { role: "system", content: system },
    { role: "user", content: user }
  ], { temperature: 0.2, max_tokens: 900 });

  const obj = extractFirstJson(raw);
  if (!obj) return { ok:false, error:"PLAN_JSON_PARSE", raw };

  const v = validateSchema("plan", obj);
  if (!v.ok) return { ok:false, error:"PLAN_SCHEMA", raw, errors: v.errors };

  // cap steps defensively
  if (obj.safety?.maxSteps && obj.steps?.length > obj.safety.maxSteps) {
    obj.steps = obj.steps.slice(0, obj.safety.maxSteps);
  }

  return { ok:true, data: obj, raw };
}
