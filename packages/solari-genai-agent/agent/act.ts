import { generateWithTools } from "../runtime/generate.js";

export async function act(modelBaseUrl: string, apiKey: string|undefined, obs: any) {
  return generateWithTools({
    modelBaseUrl,
    apiKey,
    userPrompt: obs.input,
    context: obs.context,
    finalSchema: "report"
  });
}
