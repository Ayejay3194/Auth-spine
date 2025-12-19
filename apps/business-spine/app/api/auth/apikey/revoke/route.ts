import { z } from "zod";
import { api } from "@/src/core/api";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";

const Q = z.object({ id: z.string() });

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    assertRole(actor.role, ["owner","admin"]);
    const body = Q.parse(await req.json());
    await prisma.apiKey.update({ where: { id: body.id }, data: { revokedAt: new Date() } });
    return { ok: true };
  });
}
