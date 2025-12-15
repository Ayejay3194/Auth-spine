import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({
  providerId: z.string(),
  staffId: z.string().optional(),
  serviceId: z.string().optional(),
  percentBps: z.number().int().min(0).max(10000),
  flatCents: z.number().int().min(0).optional()
});

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","admin"]);

  const body = Q.parse(await req.json());
  const rule = await prisma.commissionRule.create({
    data: {
      providerId: body.providerId,
      staffId: body.staffId ?? null,
      serviceId: body.serviceId ?? null,
      percentBps: body.percentBps,
      flatCents: body.flatCents ?? 0,
      active: true
    }
  });

  await audit(actor.userId, actor.role as any, "staff.commission.rule.create", { ruleId: rule.id });
  return NextResponse.json({ ruleId: rule.id });
}
