import { NextResponse } from "next/server";
import { z } from "zod";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";
import { audit } from "@/src/core/audit";
import { addPoints } from "@/src/loyalty/points";

const Q = z.object({ providerId: z.string(), clientId: z.string(), delta: z.number().int() });

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","staff","admin"]);
  const body = Q.parse(await req.json());

  const acct = await addPoints(body.providerId, body.clientId, body.delta);
  await audit(actor.userId, actor.role as any, "loyalty.points.add", { providerId: body.providerId, clientId: body.clientId, delta: body.delta });
  return NextResponse.json({ points: acct.points, tier: acct.tier });
}
