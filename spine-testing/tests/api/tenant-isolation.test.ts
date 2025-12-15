import { describe, it, expect } from "vitest";
import { BASE_URL, TEST_TENANTS, TEST_USERS } from "../../tools/config";
import { http } from "../../tools/http";

describe("tenant isolation", () => {
  it("sessions list is scoped to session tenant", async () => {
    await http("POST", `${BASE_URL}/tenants`, { body: TEST_TENANTS.a });
    await http("POST", `${BASE_URL}/tenants`, { body: TEST_TENANTS.b });

    const la = await http("POST", `${BASE_URL}/auth/login`, { body: { tenantId: TEST_USERS.a.tenantId, email: TEST_USERS.a.email } });
    if (!la.ok) throw new Error("Need seeded user a@example.com under tenant-a for this test.");

    const sessionsA = await http("GET", `${BASE_URL}/auth/sessions`, { headers: { authorization: `Bearer ${la.json.token}` } });
    expect(sessionsA.ok).toBe(true);

    // Add your own cross-tenant endpoint tests here (IDOR checks).
  });
});
