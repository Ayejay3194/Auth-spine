import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const p = await prisma.provider.findUnique({
    where: { id: params.id },
    include: { services: true, media: true, reviews: { where: { status: "visible" }, take: 20, orderBy: { createdAt: "desc" } } }
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}
