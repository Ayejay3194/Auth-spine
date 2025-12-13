import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";

const Q = z.object({
  providerId: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  windowStartISO: z.string(),
  windowEndISO: z.string(),
});

export async function POST(req: Request) {
  const actor = getActor(req);
  const body = Q.parse(await req.json());

  const entry = await prisma.waitlistEntry.create({
    data: {
      providerId: body.providerId,
      clientId: body.clientId,
      serviceId: body.serviceId,
      windowStart: new Date(body.windowStartISO),
      windowEnd: new Date(body.windowEndISO),
      status: "active",
    }
  });

  await audit(actor.userId, actor.role as any, "booking.waitlist.add", { waitlistId: entry.id });
  return NextResponse.json({ waitlistId: entry.id });
}
