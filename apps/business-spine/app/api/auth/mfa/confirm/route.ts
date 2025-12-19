import { z } from "zod";
import { api } from "@/src/core/api";
import { getActor } from "@/src/core/auth";
import { confirmMfa } from "@/src/security/mfa";

const Q = z.object({ token: z.string().min(6).max(12) });

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    const body = Q.parse(await req.json());
    const ok = await confirmMfa(actor.userId, body.token);
    if (!ok) throw new Error("unauthorized");
    return { ok: true };
  });
}
