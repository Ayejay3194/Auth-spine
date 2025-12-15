import { createDefaultOrchestrator } from "./core/defaultOrchestrator.js";
const orch = createDefaultOrchestrator();
const ctx = {
    actor: { userId: "u_1", role: "owner" },
    tenantId: "t_1",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
    channel: "chat",
};
async function run() {
    const examples = [
        "book haircut for alex@example.com tomorrow 3pm 60 min",
        "list bookings",
        "create invoice for alex@example.com $120 memo full color",
        "mark paid invoice_pleaseReplaceMe",
        "refund invoice_pleaseReplaceMe $50",
        "create promo code GLOWUP 15% expires next fri 5pm",
        "this week how did i do",
        "show audit trail",
    ];
    for (const ex of examples) {
        console.log("\n> ", ex);
        const res = await orch.handle(ex, { ...ctx, nowISO: new Date().toISOString() });
        console.dir(res.final, { depth: 6 });
    }
    // interactive-ish: show confirmation flow
    console.log("\n--- Confirmation demo ---");
    const r1 = await orch.handle("refund invoice_abc123 $10", { ...ctx, nowISO: new Date().toISOString() });
    console.dir(r1.final, { depth: 6 });
    const token = r1.final?.payload?.confirmToken;
    if (token) {
        const r2 = await orch.handle("refund invoice_abc123 $10", { ...ctx, nowISO: new Date().toISOString() }, { confirmToken: token });
        console.dir(r2.final, { depth: 6 });
    }
}
run().catch(e => {
    console.error(e);
    process.exit(1);
});
