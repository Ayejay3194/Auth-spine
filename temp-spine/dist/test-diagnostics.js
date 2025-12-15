import { createDefaultOrchestrator } from "./core/defaultOrchestrator.js";
const orch = createDefaultOrchestrator();
const ctx = {
    actor: { userId: "admin_1", role: "admin" },
    tenantId: "t_1",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
    channel: "chat",
};
async function run() {
    console.log("\n=== Testing Diagnostics Spine ===\n");
    const commands = [
        "run diagnostics",
        "health check",
        "check database",
        "check redis",
        "system status",
    ];
    for (const cmd of commands) {
        console.log(`\n> ${cmd}`);
        const res = await orch.handle(cmd, { ...ctx, nowISO: new Date().toISOString() });
        console.dir(res.final, { depth: 10 });
    }
    console.log("\n=== Testing with non-admin user (should not detect diagnostics intents) ===\n");
    const userCtx = {
        ...ctx,
        actor: { userId: "user_1", role: "staff" },
    };
    console.log("\n> run diagnostics (as staff)");
    const res = await orch.handle("run diagnostics", userCtx);
    console.dir(res.final, { depth: 10 });
}
run().catch(e => {
    console.error(e);
    process.exit(1);
});
