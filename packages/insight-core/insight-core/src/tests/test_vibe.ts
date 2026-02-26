import { VibeEngine } from "../vibe-signals/vibeNow.js";

export function testVibeDeterministic(): void {
  const e1 = new VibeEngine();
  const e2 = new VibeEngine();

  const now = Date.parse("2026-02-21T01:07:00.000Z");
  const win = {
    nowMs: now,
    events: [
      { kind: "msg", t: now-60000, speaker: "AJ", text: "ok" },
      { kind: "latency", t: now-50000, speaker: "AJ", ms: 3000 },
      { kind: "msg", t: now-20000, speaker: "AJ", text: "no. not doing that. stop." },
    ]
  } as any;

  const s1 = e1.computeNow("2026-02-21T01:07:00.000Z", win);
  const s2 = e2.computeNow("2026-02-21T01:07:00.000Z", win);

  const a = JSON.stringify(s1);
  const b = JSON.stringify(s2);
  if (a !== b) throw new Error("Vibe engine not deterministic");
}
