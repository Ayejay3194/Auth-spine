import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";
import { audit } from "@/src/core/audit";

const Q = z.object({ providerId: z.string(), initialCents: z.number().int().min(100) });
function genCard() { return "GC" + Math.random().toString(36).slice(2, 10).toUpperCase(); }

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","admin","staff"]);
  const body = Q.parse(await req.json());

  const code = genCard();
  const card = await prisma.giftCard.create({
    data: { providerId: body.providerId, code, initialCents: body.initialCents, balanceCents: body.initialCents, currency: "usd", active: true }
  });

  await audit(actor.userId, actor.role as any, "giftcards.create", { giftCardId: card.id, code });
  return NextResponse.json({ code, balanceCents: card.balanceCents });
}
