import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/src/auth/jwt";
import { verifySession } from "@/src/auth/session";

const PROTECTED_PREFIXES = [
  "/api/booking/create",
  "/api/marketing",
  "/api/automation",
  "/api/staff",
  "/api/loyalty",
  "/api/giftcards",
  "/api/webhooks",
];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  const pathname = req.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!needsAuth) return res;

  const auth = req.headers.get("authorization") ?? "";
  const cookieSession = req.cookies.get("session")?.value ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token && !cookieSession) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const claims = token ? verifyToken(token) : await verifySession(cookieSession);
    if (!claims) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    res.headers.set("x-user-id", claims.sub);
    res.headers.set("x-role", claims.role);
    return res;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

export const config = { matcher: ["/api/:path*"] };
