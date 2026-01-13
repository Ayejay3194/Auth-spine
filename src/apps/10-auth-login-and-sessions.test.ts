import { describe, it, expect } from "vitest";
import { BASE_URL, AUTH_MODE, SEED } from "../../tools/config";
import { http } from "../../tools/http";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

describe("auth sessions", () => {
  it("user A can get sessions list", async () => {
    let token: string | null = null;

    if (AUTH_MODE === "api_login") {
      const r = await http("POST", `${BASE_URL}/auth/login`, {
        body: { tenantId: SEED.tenants.a.slug, email: SEED.users.a.email, deviceLabel: SEED.users.a.deviceLabel }
      });
      if (!r.ok) throw new Error(`Login failed. status=${r.status} body=${r.text}`);
      token = r.json.token;
    } else {
      // direct_session: insert DB session and use its token
      const ta = await prisma.tenant.findUnique({ where: { slug: SEED.tenants.a.slug } });
      const ua = await prisma.user.findFirst({ where: { tenantId: ta!.id, email: SEED.users.a.email } });
      const raw = crypto.randomBytes(32).toString("hex");
      await prisma.session.create({
        data: {
          tenantId: ta!.id,
          userId: ua!.id,
          tokenHash: sha256(raw),
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          deviceLabel: "direct-session",
        }
      });
      token = raw;
    }

    const sessions = await http("GET", `${BASE_URL}/auth/sessions`, { headers: { authorization: `Bearer ${token}` } });
    expect(sessions.ok).toBe(true);
    expect(Array.isArray(sessions.json.sessions)).toBe(true);
  });
});
