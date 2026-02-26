import { InsightEngine } from "../engine.js";
import { jdFromDateUTC } from "../utils/time.js";

function demo() {
  const engine = new InsightEngine();

  const now = new Date();
  const utc = now.toISOString();
  const jd = jdFromDateUTC(now);

  const convo = {
    nowMs: now.getTime(),
    events: [
      { kind: "msg", t: now.getTime()-120000, speaker: "AJ", text: "I feel like I'm doing too much. Is this over-engineered?" },
      { kind: "latency", t: now.getTime()-80000, speaker: "AJ", ms: 2200 },
      { kind: "msg", t: now.getTime()-60000, speaker: "AJ", text: "Also I need it to be fast and not lie. Like at all." },
      { kind: "msg", t: now.getTime()-15000, speaker: "AJ", text: "Give me the receipts." },
    ]
  };

  const ctx = engine.buildContext({
    utc, jd, convo,
    user: {
      natal: undefined,
      preferences: { tone: "balanced", intensity: 2, receiptsDefault: true }
    }
  });

  console.log("\n=== CHAT ===");
  console.log(engine.chat(ctx));

  console.log("\n=== MODULE: TodaySnapshot ===");
  console.log(engine.runModule(ctx, "TodaySnapshot"));

  console.log("\n=== MODULE: PressureWindow ===");
  console.log(engine.runModule(ctx, "PressureWindow"));
}

demo();
