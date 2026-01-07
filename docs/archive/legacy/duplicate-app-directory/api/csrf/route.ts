import { api } from "@/src/core/api";
import { newCsrfToken } from "@/src/security/csrf";

export async function GET() {
  return api(async () => {
    const token = newCsrfToken();
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `csrf=${token}; Path=/; HttpOnly; SameSite=Lax; Secure`
      }
    });
  });
}
