
import { db } from "@/lib/db";
import type { Viewer } from "@/lib/auth";

export type TrackArgs = {
  viewer?: Viewer | null;
  event: string;
  entity?: string;
  entityId?: string | null;
  path?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  sessionId?: string | null;
  props?: any;
};

export async function track(args: TrackArgs) {
  const v = args.viewer ?? null;
  await db.analyticsEvent.create({
    data: {
      occurredAt: new Date(),
      actorId: v?.id,
      actorEmail: v?.email,
      actorRole: (v?.role as any) ?? undefined,
      sessionId: args.sessionId ?? undefined,
      event: args.event,
      entity: args.entity,
      entityId: args.entityId ?? undefined,
      path: args.path,
      method: args.method,
      status: args.status,
      durationMs: args.durationMs,
      props: args.props ?? undefined
    }
  });
}
