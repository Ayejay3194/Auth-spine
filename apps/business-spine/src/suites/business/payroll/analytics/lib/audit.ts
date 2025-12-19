
import { db } from "@/lib/db";
import type { Viewer } from "@/lib/auth";

export async function audit(viewer: Viewer, action: string, entity: string, entityId: string | null, before: any, after: any) {
  await db.auditEvent.create({
    data: {
      actorId: viewer.id,
      actorEmail: viewer.email,
      action,
      entity,
      entityId: entityId ?? undefined,
      before: before ?? undefined,
      after: after ?? undefined
    }
  });
}
