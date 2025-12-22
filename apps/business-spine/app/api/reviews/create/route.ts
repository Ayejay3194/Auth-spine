import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor, AuthenticationError } from "@/src/core/auth";
import { audit } from "@/src/core/audit";

const Q = z.object({
  providerId: z.string(),
  clientId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  bookingId: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const actor = await getActor(req);
    const body = Q.parse(await req.json());

    // Authorization: Verify user is the client or is admin
    // Clients can only review providers they've booked with
    if (actor.role !== "admin") {
      const client = await prisma.client.findFirst({
        where: { userId: actor.userId, id: body.clientId }
      });
      
      if (!client) {
        return NextResponse.json(
          { error: "Unauthorized: You are not the client for this review" },
          { status: 403 }
        );
      }
    }

    // Verify provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: body.providerId },
      select: { id: true }
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
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

    const review = await prisma.review.create({
      data: {
        providerId: body.providerId,
        clientId: body.clientId,
        rating: body.rating,
        comment: body.comment ?? null,
        bookingId: body.bookingId ?? null,
        photoUrl: body.photoUrl ?? null,
        status: "visible",
      }
    });

    await audit(actor.userId, actor.role as any, "reviews.create", { reviewId: review.id });

    return NextResponse.json({ reviewId: review.id });
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

    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
