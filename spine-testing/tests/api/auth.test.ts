import { describe, it, expect } from "vitest";
import { BASE_URL, TEST_TENANTS, TEST_USERS } from "../../tools/config";
import { http } from "../../tools/http";

describe("auth smoke", () => {
  it("login returns token (demo endpoint)", async () => {
    // Create tenant (dev endpoint). If your project doesn't have this, remove it.
    await http("POST", `${BASE_URL}/tenants`, { body: TEST_TENANTS.a });

    const r = await http("POST", `${BASE_URL}/auth/login`, {
      body: { tenantId: TEST_USERS.a.tenantId, email: TEST_USERS.a.email, deviceLabel: TEST_USERS.a.deviceLabel }
    });

    if (!r.ok) {
      throw new Error(`Login failed. Seed user ${TEST_USERS.a.email} into tenant ${TEST_USERS.a.tenantId}. status=${r.status} body=${r.text}`);
    }
    expect(typeof r.json.token).toBe("string");
  });
});
