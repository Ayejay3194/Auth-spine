import { InsightEngine } from "../engine.js";
import { jdFromDateUTC } from "../utils/time.js";
import type { ConversationWindow } from "../vibe-signals/events.js";

function demo() {
  // Enable plasticity (online personalization) for the demo.
  const engine = new InsightEngine({ plasticity: true });

  const now = new Date();
  const utc = now.toISOString();
  const jd = jdFromDateUTC(now);

  const convo: ConversationWindow = {
    nowMs: now.getTime(),
    events: [
      { kind: "msg", t: now.getTime()-120000, speaker: "AJ", text: "I feel like I'm doing too much. Is this over-engineered?" },
      { kind: "latency", t: now.getTime()-80000, speaker: "AJ", ms: 2200 },
      { kind: "msg", t: now.getTime()-60000, speaker: "AJ", text: "Also I need it to be fast and not lie. Like at all." },
      { kind: "msg", t: now.getTime()-15000, speaker: "AJ", text: "Give me the receipts." },
    ]
  };

  let ctx = engine.buildContext({
    utc, jd, convo,
    user: {
      natal: undefined,
      preferences: { tone: "balanced", intensity: 2, receiptsDefault: true }
    }
  });

  console.log("\n=== ROUTING (before feedback) ===");
  console.log(ctx.routing);

  console.log("\n=== CHAT (sassy + clinical) ===");
  console.log(engine.chat(ctx));

  // Simulate user clicking a module and finding it helpful (online learning signal).
  const chosen = ctx.routing.suggestedModules[0] ?? "PressureWindow";
  const fb = engine.submitFeedback(ctx, { moduleId: chosen, helpful: 1.0 });
  console.log(`\n=== FEEDBACK: helpful on ${chosen} ===`);
  console.log(fb);

  // Rebuild context to see updated routing after one learning step.
  ctx = engine.buildContext({ utc, jd, convo, user: ctx.user });

  console.log("\n=== ROUTING (after 1 update) ===");
  console.log(ctx.routing);
  console.log("\nPlasticity:", ctx.plasticity);
}

demo();
