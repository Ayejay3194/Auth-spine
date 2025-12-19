import { api } from "@/src/core/api";
import { clearSessionCookie } from "@/src/security/cookies";
import { cookies } from "next/headers";
import { revokeSession } from "@/src/auth/session";

export async function POST() {
  return api(async () => {
    const c = await cookies();
    const token = c.get("session")?.value;
    if (token) await revokeSession(token);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": clearSessionCookie() }
    });
  });
}
