import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { createPaymentIntent } from "@/src/payments/stripe";
import type { Role } from "@prisma/client";

const Q = z.object({
  providerId: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  startISO: z.string(),
  endISO: z.string(),
  depositCents: z.number().int().optional(),
});

export async function POST(req: Request) {
  const actor = getActor(req);
  const body = Q.parse(await req.json());

  const booking = await prisma.booking.create({
    data: {
      providerId: body.providerId,
      clientId: body.clientId,
      serviceId: body.serviceId,
      startAt: new Date(body.startISO),
      endAt: new Date(body.endISO),
      status: "confirmed",
      depositCents: body.depositCents ?? null
    }
  });

  let paymentIntentClientSecret: string | null = null;

  if (body.depositCents && body.depositCents > 0) {
    const pi = await createPaymentIntent({
      amountCents: body.depositCents,
      currency: "usd",
      metadata: { bookingId: booking.id, providerId: booking.providerId, clientId: booking.clientId }
    });
    await prisma.paymentIntent.create({
      data: { bookingId: booking.id, stripePiId: pi.id, amountCents: body.depositCents, currency: "usd", status: pi.status }
    });
    paymentIntentClientSecret = pi.client_secret ?? null;
  }

  await audit(actor.userId, actor.role as Role, "booking.create", { bookingId: booking.id });

  return NextResponse.json({ bookingId: booking.id, paymentIntentClientSecret });
}
