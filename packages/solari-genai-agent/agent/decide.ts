import { generateControlled } from "../runtime/generate.js";

export interface Decision {
  intent: "respond" | "use_tool" | "wait";
  reason: string;
}

export async function decide(modelBaseUrl: string, apiKey: string|undefined, obs: any) {
  return generateControlled({
    modelBaseUrl,
    apiKey,
    schemaName: "toolcall",
    userPrompt: `Decide next action. Observation: ${JSON.stringify(obs)}.
Return intent=respond|use_tool|wait with reason.`,
    context: { stage: "decide" }
  });
}
