import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Q = z.object({
  providerId: z.string(),
  dateISO: z.string().optional()
});

export async function POST(req: Request) {
  const body = Q.parse(await req.json());
  const start = body.dateISO ? new Date(body.dateISO + "T00:00:00.000Z") : new Date(Date.now());
  const end = new Date(start.getTime() + 7*24*3600*1000);

  const slots = await prisma.availabilitySlot.findMany({
    where: { providerId: body.providerId, startAt: { gte: start, lt: end } },
    orderBy: { startAt: "asc" },
    take: 200
  });

  return NextResponse.json({ slots: slots.map(s => ({
    slotId: s.id,
    startISO: s.startAt.toISOString(),
    endISO: s.endAt.toISOString(),
    capacity: s.capacity
  }))});
}
