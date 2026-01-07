import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";

const Q = z.object({ providerId: z.string(), clientId: z.string() });

function genCode() { return "REF" + Math.random().toString(36).slice(2, 8).toUpperCase(); }

export async function POST(req: Request) {
  const actor = getActor(req);
  const body = Q.parse(await req.json());

  const code = genCode();
  const row = await prisma.referralCode.create({ data: { providerId: body.providerId, clientId: body.clientId, code } });

  await audit(actor.userId, actor.role as any, "referrals.create", { referralId: row.id, code });
  return NextResponse.json({ code });
}
