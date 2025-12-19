import { AssistantContext, Suggestion } from "./types";
import { defaultEngines } from "./registry";

export function runAssistant(ctx: AssistantContext): Suggestion[] {
  const sev = { critical: 0, warn: 1, info: 2 } as const;
  const out: Suggestion[] = [];
  for (const e of defaultEngines()) {
    try { out.push(...e.run(ctx)); }
    catch (err) {
      out.push({ id:`err_${e.name}`, engine:e.name, title:"Engine error", message:"Engine failed.", severity:"warn", createdAt: ctx.now, why:[String(err)] });
    }
  }
  return out.sort((a,b)=> (sev[a.severity]-sev[b.severity]) || (b.createdAt.getTime()-a.createdAt.getTime()));
}
