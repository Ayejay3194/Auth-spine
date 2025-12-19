import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function audit(actorUserId: string, role: Role, type: string, details: unknown) {
  await prisma.auditEvent.create({
    data: { actorUserId, role, type, details: details as any }
  });
}
