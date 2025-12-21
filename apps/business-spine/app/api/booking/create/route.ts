import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor, AuthenticationError } from "@/src/core/auth";
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
  try {
    const actor = await getActor(req);
    const body = Q.parse(await req.json());

    // Authorization: Verify user owns the provider or is admin
    if (actor.role !== "admin") {
      const provider = await prisma.provider.findUnique({
        where: { id: body.providerId },
        select: { userId: true }
      });
      
      if (!provider || provider.userId !== actor.userId) {
        return NextResponse.json(
          { error: "Unauthorized: You do not own this provider" },
          { status: 403 }
        );
      }
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      select: { id: true }
    });
    
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

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
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
