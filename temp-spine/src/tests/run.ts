import { createDefaultOrchestrator } from "../core/defaultOrchestrator.js";
import { db } from "../adapters/memory.js";

const orch = createDefaultOrchestrator();
const ctx = {
  actor: { userId: "u_test", role: "owner" as const },
  tenantId: "t_test",
  nowISO: new Date().toISOString(),
  timezone: "America/New_York",
  channel: "api" as const,
};

function assert(cond: any, msg: string) {
  if (!cond) throw new Error("Assertion failed: " + msg);
}

async function main() {
  // book
  const r = await orch.handle("book haircut for alex@example.com tomorrow 3pm 60 min", { ...ctx, nowISO: new Date().toISOString() });
  assert(r.final?.ok === true, "booking should succeed");
  assert(db.bookings.size >= 1, "booking stored");

  // invoice create triggers confirmation (high sensitivity)
  const inv1 = await orch.handle("create invoice for alex@example.com $100", { ...ctx, nowISO: new Date().toISOString() });
  assert(inv1.final?.ok === true, "should ask confirm");
  const token = (inv1.final?.payload as any)?.confirmToken;
  assert(token, "confirm token present");

  const inv2 = await orch.handle("create invoice for alex@example.com $100", { ...ctx, nowISO: new Date().toISOString() }, { confirmToken: token });
  assert(db.invoices.size >= 1, "invoice stored after confirm");

  // audit exists
  const aud = await orch.handle("show audit trail", { ...ctx, nowISO: new Date().toISOString() });
  assert(aud.final?.ok === true, "audit should return (or request confirm)");
  console.log("✅ tests passed");
}

main().catch(e => {
  console.error("❌ tests failed", e);
  process.exit(1);
});
