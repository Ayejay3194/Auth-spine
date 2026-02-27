import { chatCompletion } from "../llm/openaiCompat.js";
import { extractFirstJson } from "../llm/jsonExtract.js";
import { validateSchema } from "../llm/schema.js";

function toolStub(toolName: string, args: any) {
  // Replace with real tool router (ephemeris, scoring, retrieval)
  return { ok: true, tool: toolName, args, note: "stub" };
}

export async function executePlan(modelBaseUrl: string, apiKey: string|undefined, planObj: any, baseContext: any) {
  const stepResults: any[] = [];
  let ctx = { ...baseContext };

  for (const step of planObj.steps) {
    if (step.kind === "tool") {
      const r = toolStub(step.inputs?.tool ?? "calcEphemeris", step.inputs?.args ?? {});
      stepResults.push({ stepId: step.id, kind: step.kind, result: r });
      ctx = { ...ctx, toolResult: r };
      continue;
    }

    if (step.kind === "generate_report") {
      const system = [
        "You are Solari.",
        "You MUST output valid JSON matching the report schema and nothing else.",
        "Cite sources via citations[]. If toolResult exists in context, cite it as sourceId='tool'."
      ].join("\n");

      const user = [
        `User request: ${ctx.userInput}`,
        `Context JSON: ${JSON.stringify(ctx)}`,
        "Return JSON only."
      ].join("\n\n");

      const raw = await chatCompletion(modelBaseUrl, apiKey, [
        { role:"system", content: system },
        { role:"user", content: user }
      ], { temperature: 0.2, max_tokens: 900 });

      const obj = extractFirstJson(raw);
      if (!obj) return { ok:false, error:"REPORT_JSON_PARSE", raw, stepId: step.id, stepResults };

      const v = validateSchema("report", obj);
      if (!v.ok) return { ok:false, error:"REPORT_SCHEMA", raw, errors: v.errors, stepId: step.id, stepResults };

      stepResults.push({ stepId: step.id, kind: step.kind, result: obj });
      return { ok:true, data: obj, raw, stepResults };
    }

    if (step.kind === "reflect") {
      // Reflect step can update ctx.beliefs in future; for now it just logs.
      stepResults.push({ stepId: step.id, kind: step.kind, result: { ok:true, note:"reflect stub" } });
      continue;
    }

    if (step.kind === "retrieve") {
      // Retrieval stub
      const r = { ok:true, chunks: [] };
      stepResults.push({ stepId: step.id, kind: step.kind, result: r });
      ctx = { ...ctx, retrieval: r };
      continue;
    }
  }

  return { ok:false, error:"NO_REPORT_STEP", stepResults };
}
