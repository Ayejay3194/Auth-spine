import { createDefaultOrchestrator } from "./core/defaultOrchestrator.js";

const orch = createDefaultOrchestrator();

const ctx = {
  actor: { userId: "user_1", role: "owner" as const },
  tenantId: "t_1",
  nowISO: new Date().toISOString(),
  timezone: "America/New_York",
  channel: "chat" as const,
};

async function run() {
  console.log("\n=== Testing Astrology Spine ===\n");

  const commands = [
    "what does my scorpio sun mean",
    "tell me about mars in aries",
    "explain moon in pisces",
    "what is 7th house",
    "read my venus in scorpio",
    "daily transit",
  ];

  for (const cmd of commands) {
    console.log(`\n> ${cmd}`);
    const res = await orch.handle(cmd, { ...ctx, nowISO: new Date().toISOString() });
    console.dir(res.final, { depth: 10 });
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
