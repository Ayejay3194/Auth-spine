import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { audit } from "@/src/core/audit";
import { assertRole } from "@/src/core/policy";

const Q = z.object({
  providerId: z.string(),
  channel: z.enum(["email","sms","push"]),
  segment: z.string(),
  templateKey: z.string(),
  scheduledAtISO: z.string().optional(),
});

export async function POST(req: Request) {
  const actor = getActor(req);
  assertRole(actor.role, ["owner","staff","admin"]);

  const body = Q.parse(await req.json());
  const c = await prisma.campaign.create({
    data: {
      providerId: body.providerId,
      channel: body.channel,
      segment: body.segment,
      templateKey: body.templateKey,
      status: "queued",
      scheduledAt: body.scheduledAtISO ? new Date(body.scheduledAtISO) : new Date(),
    }
  });

  await audit(actor.userId, actor.role as any, "marketing.campaign.create", { campaignId: c.id });

  return NextResponse.json({ campaignId: c.id });
}
