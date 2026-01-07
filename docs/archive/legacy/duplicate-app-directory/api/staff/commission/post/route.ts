import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";
import { computeCommission, postCommission } from "@/src/staff/commission";

const Q = z.object({ providerId: z.string(), bookingId: z.string(), staffId: z.string(), grossCents: z.number().int().min(0) });

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","admin","staff"]);

  const body = Q.parse(await req.json());
  const booking = await prisma.booking.findUnique({ where: { id: body.bookingId } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const amount = await computeCommission(body.providerId, body.staffId, booking.serviceId, body.grossCents);
  const ledger = await postCommission(body.providerId, body.bookingId, body.staffId, amount);

  await audit(actor.userId, actor.role as any, "staff.commission.post", { ledgerId: ledger.id, amountCents: amount });
  return NextResponse.json({ ledgerId: ledger.id, amountCents: amount });
}
