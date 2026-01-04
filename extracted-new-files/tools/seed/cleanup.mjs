import { PrismaClient } from "@prisma/client";
import { SEED } from "../config.ts";

const prisma = new PrismaClient();

async function main() {
  // Deletes seeded users/roles by tenant slug, leaves tenant rows (safe-ish).
  const tenants = await prisma.tenant.findMany({ where: { slug: { in: [SEED.tenants.a.slug, SEED.tenants.b.slug] } } });
  for (const t of tenants) {
    await prisma.session.deleteMany({ where: { tenantId: t.id } });
    await prisma.userRole.deleteMany({ where: { tenantId: t.id } });
    await prisma.role.deleteMany({ where: { tenantId: t.id } });
    await prisma.user.deleteMany({ where: { tenantId: t.id } });
    await prisma.auditLog.deleteMany({ where: { tenantId: t.id, target: SEED.marker } });
  }
  console.log("Cleanup complete.");
}

main().finally(async ()=>{ await prisma.$disconnect(); });
