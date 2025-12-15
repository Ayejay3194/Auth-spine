import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";

const Q = z.object({ code: z.string(), amountCents: z.number().int().min(1) });

export async function POST(req: Request) {
  const actor = getActor(req);
  const body = Q.parse(await req.json());

  const card = await prisma.giftCard.findUnique({ where: { code: body.code } });
  if (!card || !card.active) return NextResponse.json({ error: "Invalid card" }, { status: 404 });
  if (card.balanceCents < body.amountCents) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  const updated = await prisma.giftCard.update({ where: { id: card.id }, data: { balanceCents: { decrement: body.amountCents } } });
  await audit(actor.userId, actor.role as any, "giftcards.redeem", { code: body.code, amountCents: body.amountCents });
  return NextResponse.json({ balanceCents: updated.balanceCents });
}
