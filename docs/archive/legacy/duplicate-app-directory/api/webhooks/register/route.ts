import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { api } from "@/src/core/api";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";
import { audit } from "@/src/core/audit";

const Q = z.object({
  providerId: z.string(),
  url: z.string().url(),
  secret: z.string().min(16),
  events: z.array(z.string()).default([])
});

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    assertRole(actor.role, ["owner","admin"]);
    const body = Q.parse(await req.json());
    const wh = await prisma.webhookEndpoint.create({
      data: { providerId: body.providerId, url: body.url, secret: body.secret, events: body.events, active: true }
    });
    await audit(actor.userId, actor.role as any, "webhooks.register", { webhookId: wh.id });
    return { webhookId: wh.id };
  });
}
