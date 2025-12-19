import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({ providerId: z.string(), name: z.string(), role: z.string().optional(), userId: z.string().optional() });

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","admin"]);

  const body = Q.parse(await req.json());
  const staff = await prisma.staffMember.create({
    data: { providerId: body.providerId, name: body.name, role: body.role ?? "staff", userId: body.userId ?? null }
  });

  await audit(actor.userId, actor.role as any, "staff.add", { staffId: staff.id });
  return NextResponse.json({ staffId: staff.id });
}
