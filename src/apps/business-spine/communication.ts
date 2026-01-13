import { Engine } from "../assistant/engine";
import { AssistantContext, Suggestion } from "../assistant/types";
import { makeSuggestion } from "../assistant/suggest";

export function scoreTone(text: string) {
  const t=text.trim();
  const flags:string[]=[];
  let professionalism=0.6, warmth=0.5, clarity=0.6;
  if (t.length<20){ clarity-=0.15; flags.push("Too short."); }
  if (/[!]{3,}/.test(t)){ professionalism-=0.2; flags.push("Too many !!!"); }
  if (/(asap|urgent|now)/i.test(t)){ warmth-=0.15; flags.push("Reads rushed."); }
  if (/(please|thank you|thanks)/i.test(t)){ warmth+=0.15; professionalism+=0.05; }
  if (!/[.?!]$/.test(t)){ professionalism-=0.05; flags.push("Missing ending punctuation."); }
  professionalism=Math.max(0,Math.min(1,professionalism));
  warmth=Math.max(0,Math.min(1,warmth));
  clarity=Math.max(0,Math.min(1,clarity));
  return { professionalism, warmth, clarity, flags };
}

export class CommunicationOptimizerEngine implements Engine {
  name="communication";
  run(ctx: AssistantContext): Suggestion[] {
    return [makeSuggestion({
      engine:this.name,title:"Message Tone Analyzer ready",
      message:"Use `scoreTone(draft)` in your composer to nudge clarity/warmth/professionalism without an LLM.",
      severity:"info",practitionerId:ctx.practitioner.id,
      why:["Deterministic heuristics (politeness, rushed words, punctuation, over-emphasis)."],
      actions:[{label:"Open composer",intent:"open_composer"}]
    })];
  }
}
