import { InsightEngine } from "../engine.js";

export function testContextBuild(): void {
  const engine = new InsightEngine();
  const now = Date.parse("2026-02-21T01:07:00.000Z");
  const ctx = engine.buildContext({
    utc: "2026-02-21T01:07:00.000Z",
    jd: 2461084.54653,
    convo: {
      nowMs: now,
      events: [
        { kind: "msg", t: now-10000, speaker: "AJ", text: "I need real-time transits." }
      ]
    }
  });

  if (!ctx.astro || !ctx.vibe) throw new Error("Missing signals");
  if (ctx.routing.suggestedModules.length === 0) throw new Error("Expected module suggestions");
}
