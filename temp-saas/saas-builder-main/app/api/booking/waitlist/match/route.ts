import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({ providerId: z.string(), slotId: z.string() });

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","staff","admin"]);

  const body = Q.parse(await req.json());
  const slot = await prisma.availabilitySlot.findUnique({ where: { id: body.slotId } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  const entry = await prisma.waitlistEntry.findFirst({
    where: {
      providerId: body.providerId,
      status: "active",
      windowStart: { lte: slot.startAt },
      windowEnd: { gte: slot.endAt },
    },
    orderBy: { createdAt: "asc" }
  });

  if (!entry) return NextResponse.json({ matched: false });

  await prisma.waitlistEntry.update({ where: { id: entry.id }, data: { status: "matched" } });
  await audit(actor.userId, actor.role as any, "booking.waitlist.matched", { waitlistId: entry.id, slotId: slot.id });

  return NextResponse.json({
    matched: true,
    waitlistId: entry.id,
    clientId: entry.clientId,
    serviceId: entry.serviceId,
    startISO: slot.startAt.toISOString(),
    endISO: slot.endAt.toISOString()
  });
}
