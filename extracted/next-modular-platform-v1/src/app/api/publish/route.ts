import { NextResponse } from "next/server";
import { getPlatform } from "@/server/bootstrap";
import type { Event } from "@/core/types";

export async function POST(req: Request) {
  const { ctx } = await getPlatform();
  const body = (await req.json()) as Partial<Event>;

  if (!body.type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  const event: Event = {
    id: body.id ?? `evt_${Math.random()}`,
    type: body.type,
    at: body.at ?? ctx.now(),
    actor: body.actor,
    subject: body.subject,
    channel: body.channel,
    payload: body.payload ?? {},
  };

  await ctx.events.publish(event);

  return NextResponse.json({ ok: true, published: event }, { status: 200 });
}
