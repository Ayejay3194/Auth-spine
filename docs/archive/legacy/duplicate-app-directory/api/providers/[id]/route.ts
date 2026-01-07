import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const p = await prisma.provider.findUnique({
    where: { id },
    include: { services: true, media: true, reviews: { where: { status: "visible" }, take: 20, orderBy: { createdAt: "desc" } } }
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}
