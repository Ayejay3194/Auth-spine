import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { SEED } from "../config.ts";

const prisma = new PrismaClient();

function hashPassword(pw) {
  // demo only. swap with argon2/bcrypt in real auth.
  return crypto.createHash("sha256").update(pw).digest("hex");
}

async function ensureTenant(t) {
  return prisma.tenant.upsert({
    where: { slug: t.slug },
    update: { name: t.name },
    create: { slug: t.slug, name: t.name },
  });
}

async function ensureRole(tenantId, r) {
  return prisma.role.upsert({
    where: { tenantId_key: { tenantId, key: r.key } },
    update: { label: r.label },
    create: { tenantId, key: r.key, label: r.label },
  });
}

async function ensureUser(tenantId, u) {
  return prisma.user.upsert({
    where: { tenantId_email: { tenantId, email: u.email } },
    update: { name: u.name },
    create: { tenantId, email: u.email, name: u.name, passwordHash: hashPassword("password") },
  });
}

async function tagAudit(tenantId) {
  await prisma.auditLog.create({
    data: { tenantId, action: "seed", target: SEED.marker, meta: { marker: SEED.marker } }
  });
}

async function main() {
  const ta = await ensureTenant(SEED.tenants.a);
  const tb = await ensureTenant(SEED.tenants.b);

  const rolesA = await Promise.all(SEED.roles.map(r => ensureRole(ta.id, r)));
  const rolesB = await Promise.all(SEED.roles.map(r => ensureRole(tb.id, r)));

  const ua = await ensureUser(ta.id, SEED.users.a);
  const ub = await ensureUser(tb.id, SEED.users.b);

  // assign admin to user A, staff to user B
  await prisma.userRole.upsert({
    where: { id: `${ua.id}:${rolesA.find(r=>r.key==="admin").id}` },
    update: {},
    create: { id: `${ua.id}:${rolesA.find(r=>r.key==="admin").id}`, tenantId: ta.id, userId: ua.id, roleId: rolesA.find(r=>r.key==="admin").id }
  }).catch(()=>{});
  await prisma.userRole.upsert({
    where: { id: `${ub.id}:${rolesB.find(r=>r.key==="staff").id}` },
    update: {},
    create: { id: `${ub.id}:${rolesB.find(r=>r.key==="staff").id}`, tenantId: tb.id, userId: ub.id, roleId: rolesB.find(r=>r.key==="staff").id }
  }).catch(()=>{});

  await tagAudit(ta.id);
  await tagAudit(tb.id);

  console.log("Seed complete:", { tenantA: ta.slug, tenantB: tb.slug, userA: ua.email, userB: ub.email, password: "password" });
}

main().finally(async ()=>{ await prisma.$disconnect(); });
