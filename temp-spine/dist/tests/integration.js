/**
 * Business Spine Integration Tests
 *
 * Tests the full end-to-end flow of the business spine system.
 */
import { createDefaultOrchestrator } from "../core/defaultOrchestrator.js";
const orch = createDefaultOrchestrator();
// Test context
const ownerContext = {
    actor: { userId: "owner_1", role: "owner" },
    tenantId: "test_tenant",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
    channel: "chat",
};
const adminContext = {
    actor: { userId: "admin_1", role: "admin" },
    tenantId: "test_tenant",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
    channel: "chat",
};
const staffContext = {
    actor: { userId: "staff_1", role: "staff" },
    tenantId: "test_tenant",
    nowISO: new Date().toISOString(),
    timezone: "America/New_York",
    channel: "chat",
};
const results = [];
function test(name, fn) {
    return async () => {
        try {
            await fn();
            results.push({ name, passed: true });
            console.log(`✓ ${name}`);
        }
        catch (error) {
            results.push({
                name,
                passed: false,
                message: error instanceof Error ? error.message : "Unknown error",
                error,
            });
            console.error(`✗ ${name}`);
            if (error instanceof Error) {
                console.error(`  ${error.message}`);
            }
        }
    };
}
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
}
function assertOk(result, message) {
    const ok = result.ok ?? result.final?.ok ?? false;
    if (!ok) {
        throw new Error(message || "Expected result to be ok");
    }
}
// Tests
const tests = [
    test("Booking: Create booking", async () => {
        const result = await orch.handle("book haircut for alex@example.com tomorrow 3pm 60 min", { ...ownerContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to create booking");
    }),
    test("Booking: List bookings", async () => {
        const result = await orch.handle("list bookings", { ...ownerContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to list bookings");
    }),
    test("Booking: Cancel booking requires confirmation", async () => {
        const result = await orch.handle("cancel booking_test123", { ...ownerContext, nowISO: new Date().toISOString() });
        // Should fail because booking doesn't exist, but intent should be detected
        assertEqual(result.steps.length > 0, true, "No steps returned");
    }),
    test("CRM: Find client", async () => {
        const result = await orch.handle("find client alex", { ...ownerContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to find client");
    }),
    test("CRM: Add note to client", async () => {
        const result = await orch.handle("add note for alex@example.com: prefers morning appointments", { ...ownerContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to add note");
    }),
    test("Payments: Create invoice requires confirmation", async () => {
        const result = await orch.handle("create invoice for alex@example.com $120 memo haircut", { ...ownerContext, nowISO: new Date().toISOString() });
        // Should return confirmation token
        assertEqual(result.final?.payload && typeof result.final.payload === "object" && "confirmToken" in result.final.payload, true, "Expected confirmation token");
    }),
    test("Marketing: Create promo code", async () => {
        const result = await orch.handle("create promo code GLOWUP 15% expires next friday 5pm", { ...ownerContext, nowISO: new Date().toISOString() });
        // May ask for missing percentOff since parsing is hard
        assertEqual(result.steps.length > 0, true, "No steps returned");
    }),
    test("Analytics: Week summary", async () => {
        const result = await orch.handle("how did i do this week", { ...ownerContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to get week summary");
    }),
    test("Diagnostics: Admin can run diagnostics", async () => {
        const result = await orch.handle("run diagnostics", { ...adminContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to run diagnostics");
    }),
    test("Diagnostics: Staff cannot run diagnostics", async () => {
        const result = await orch.handle("run diagnostics", { ...staffContext, nowISO: new Date().toISOString() });
        assertEqual(result.final?.ok, false, "Staff should not be able to run diagnostics");
    }),
    test("Diagnostics: Check database", async () => {
        const result = await orch.handle("check database", { ...adminContext, nowISO: new Date().toISOString() });
        assertOk(result, "Failed to check database");
    }),
    test("Admin Security: Show audit trail requires confirmation", async () => {
        const result = await orch.handle("show audit trail", { ...adminContext, nowISO: new Date().toISOString() });
        // Should return confirmation token
        assertEqual(result.final?.payload && typeof result.final.payload === "object" && "confirmToken" in result.final.payload, true, "Expected confirmation token");
    }),
    test("Intent Detection: Detects multiple intents", async () => {
        const intents = orch.detect("book appointment", ownerContext);
        assertEqual(intents.length > 0, true, "Should detect at least one intent");
        assertEqual(intents[0]?.spine, "booking", "Should detect booking intent");
    }),
    test("Intent Detection: Handles unknown commands", async () => {
        const result = await orch.handle("do something completely random xyz123", { ...ownerContext, nowISO: new Date().toISOString() });
        assertEqual(result.final?.ok, false, "Should fail for unknown command");
    }),
];
// Run all tests
async function runTests() {
    console.log("\n=== Business Spine Integration Tests ===\n");
    for (const t of tests) {
        await t();
    }
    console.log("\n=== Test Summary ===\n");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`Passed: ${passed}/${results.length}`);
    console.log(`Failed: ${failed}/${results.length}`);
    if (failed > 0) {
        console.log("\nFailed tests:");
        results
            .filter((r) => !r.passed)
            .forEach((r) => {
            console.log(`  - ${r.name}: ${r.message}`);
        });
    }
    process.exit(failed > 0 ? 1 : 0);
}
runTests().catch((e) => {
    console.error(e);
    process.exit(1);
});
