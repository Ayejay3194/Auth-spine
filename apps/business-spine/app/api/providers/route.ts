import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const providers = await prisma.provider.findMany({
    where: { verified: true },
    select: { id: true, businessName: true, bio: true, specialties: true, location: true, yearsExp: true }
  });
  return NextResponse.json(providers);
}
