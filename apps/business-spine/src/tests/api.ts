/**
 * Business Spine API Tests
 * 
 * Tests the API server and handlers.
 */

import { BusinessSpineApi, ApiRequest } from "../api/server.js";

const api = new BusinessSpineApi({
  apiKey: "test-api-key",
});

type TestResult = {
  name: string;
  passed: boolean;
  message?: string;
};

const results: TestResult[] = [];

function test(name: string, fn: () => Promise<void>) {
  return async () => {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.push({
        name,
        passed: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(`✗ ${name}`);
      if (error instanceof Error) {
        console.error(`  ${error.message}`);
      }
    }
  };
}

function assertEqual(actual: unknown, expected: unknown, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

// Tests
const tests = [
  test("API: Validate API key - valid", async () => {
    const isValid = api.validateApiKey("test-api-key");
    assertEqual(isValid, true, "Should validate correct API key");
  }),

  test("API: Validate API key - invalid", async () => {
    const isValid = api.validateApiKey("wrong-key");
    assertEqual(isValid, false, "Should reject incorrect API key");
  }),

  test("API: Health check", async () => {
    const result = await api.health();
    assertEqual(result.success, true, "Health check should succeed");
    assertEqual(
      result.data && typeof result.data === "object" && "status" in result.data,
      true,
      "Should return status"
    );
  }),

  test("API: Handle valid request", async () => {
    const request: ApiRequest = {
      text: "list bookings",
      context: {
        userId: "test_user",
        role: "owner",
        tenantId: "test_tenant",
      },
    };

    const result = await api.handle(request);
    assertEqual(result.success, true, "Should handle valid request");
  }),

  test("API: Handle invalid request - missing text", async () => {
    const request: ApiRequest = {
      text: "",
      context: {
        userId: "test_user",
        role: "owner",
      },
    };

    const result = await api.handle(request);
    assertEqual(result.success, false, "Should reject invalid request");
  }),

  test("API: Detect intents", async () => {
    const request: ApiRequest = {
      text: "book appointment",
      context: {
        userId: "test_user",
        role: "owner",
      },
    };

    const result = await api.detectIntents(request);
    assertEqual(result.success, true, "Should detect intents");
    assertEqual(
      result.data && typeof result.data === "object" && "intents" in result.data,
      true,
      "Should return intents array"
    );
  }),

  test("API: Handle request with confirmation token", async () => {
    // First request to get confirmation token
    const request1: ApiRequest = {
      text: "refund invoice_test123 $50",
      context: {
        userId: "test_user",
        role: "owner",
        tenantId: "test_tenant",
      },
    };

    const result1 = await api.handle(request1);
    assertEqual(result1.success, true, "Should handle first request");

    // Extract confirmation token if present
    if (
      result1.data &&
      typeof result1.data === "object" &&
      "final" in result1.data &&
      result1.data.final &&
      typeof result1.data.final === "object" &&
      "payload" in result1.data.final &&
      result1.data.final.payload &&
      typeof result1.data.final.payload === "object" &&
      "confirmToken" in result1.data.final.payload
    ) {
      const token = (result1.data.final.payload as any).confirmToken;

      // Second request with confirmation token
      const request2: ApiRequest = {
        text: "refund invoice_test123 $50",
        context: {
          userId: "test_user",
          role: "owner",
          tenantId: "test_tenant",
        },
        confirmToken: token,
      };

      const result2 = await api.handle(request2);
      assertEqual(result2.success, true, "Should handle confirmed request");
    }
  }),
];

// Run all tests
async function runTests() {
  console.log("\n=== Business Spine API Tests ===\n");

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
