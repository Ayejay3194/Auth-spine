import { describe, it, expect } from "vitest";
import { BASE_URL } from "../../tools/config";
import { http } from "../../tools/http";

describe("health", () => {
  it("GET /health", async () => {
    const r = await http("GET", `${BASE_URL}/health`);
    expect(r.ok).toBe(true);
  });
});
