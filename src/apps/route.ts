
import { NextResponse } from "next/server";
import { z } from "zod";
import { track } from "@/lib/analytics";
import { getViewer } from "@/lib/auth";

const Schema = z.object({
  event: z.string().min(1),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  path: z.string().optional(),
  props: z.any().optional(),
  sessionId: z.string().optional()
});

export async function POST(req: Request) {
  const viewer = await getViewer();
  const body = await req.json().catch(() => ({}));
  const data = Schema.parse(body);

  await track({
    viewer,
    event: data.event,
    entity: data.entity,
    entityId: data.entityId,
    path: data.path,
    sessionId: data.sessionId,
    props: data.props
  });

  return NextResponse.json({ ok: true });
}
