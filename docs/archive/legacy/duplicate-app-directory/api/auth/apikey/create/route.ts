import { z } from "zod";
import { api } from "@/src/core/api";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/src/core/auth";
import { assertRole } from "@/src/core/policy";
import { sha256 } from "@/src/security/crypto";

const Q = z.object({ label: z.string().min(1).max(60) });

function genRaw() {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  return "sk_" + Buffer.from(bytes).toString("base64url");
}

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    assertRole(actor.role, ["owner","admin"]);
    const body = Q.parse(await req.json());
    const raw = genRaw();
    const prefix = raw.slice(0, 8);
    const key = await prisma.apiKey.create({
      data: { userId: actor.userId, label: body.label, prefix, keyHash: sha256(raw) }
    });
    // only time you ever show it
    return { apiKey: raw, prefix: key.prefix, id: key.id };
  });
}
