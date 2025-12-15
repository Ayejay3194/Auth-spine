import { describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { SEED } from "../../tools/config";

/**
 * DB-level isolation sanity check:
 * Make sure Tenant A and Tenant B have different IDs and users are scoped.
 */
describe("tenant isolation (db)", () => {
  const prisma = new PrismaClient();
  it("tenants are distinct and users are scoped", async () => {
    const ta = await prisma.tenant.findUnique({ where: { slug: SEED.tenants.a.slug } });
    const tb = await prisma.tenant.findUnique({ where: { slug: SEED.tenants.b.slug } });
    expect(ta && tb).toBeTruthy();
    expect(ta!.id).not.toBe(tb!.id);

    const ua = await prisma.user.findFirst({ where: { tenantId: ta!.id, email: SEED.users.a.email } });
    const ub = await prisma.user.findFirst({ where: { tenantId: tb!.id, email: SEED.users.b.email } });
    expect(ua).toBeTruthy();
    expect(ub).toBeTruthy();

    const cross = await prisma.user.findFirst({ where: { tenantId: ta!.id, email: SEED.users.b.email } });
    expect(cross).toBeNull();
  });
});
