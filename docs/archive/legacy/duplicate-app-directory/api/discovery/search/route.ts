import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Q = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  specialty: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export async function POST(req: Request) {
  const body = Q.parse(await req.json());
  const providers = await prisma.provider.findMany({
    where: {
      verified: true,
      ...(body.location ? { location: { contains: body.location, mode: "insensitive" } } : {}),
      ...(body.specialty ? { specialties: { has: body.specialty } } : {}),
      ...(body.q ? { OR: [
        { businessName: { contains: body.q, mode: "insensitive" } },
        { bio: { contains: body.q, mode: "insensitive" } }
      ] } : {}),
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: { id: true, businessName: true, location: true, specialties: true, yearsExp: true }
  });
  return NextResponse.json({ providers });
}
