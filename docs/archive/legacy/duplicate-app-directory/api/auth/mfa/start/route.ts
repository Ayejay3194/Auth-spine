import { api } from "@/src/core/api";
import { getActor } from "@/src/core/auth";
import { startMfa } from "@/src/security/mfa";

export async function POST(req: Request) {
  return api(async () => {
    const actor = getActor(req);
    return startMfa(actor.userId);
  });
}
