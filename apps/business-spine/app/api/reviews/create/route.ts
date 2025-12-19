import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
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
  const actor = getActor(req);
  const body = Q.parse(await req.json());

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
}
