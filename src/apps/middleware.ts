
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const IGNORE = [/^\/_next\//, /^\/favicon\.ico$/, /^\/api\/analytics\/track$/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (IGNORE.some(r => r.test(pathname))) return NextResponse.next();

  const start = Date.now();
  const res = NextResponse.next();
  const durationMs = Date.now() - start;

  // Lightweight: send to API route in background-ish way (best effort).
  // NOTE: middleware can't hit db directly reliably in edge; we just tag headers.
  res.headers.set("x-req-path", pathname);
  res.headers.set("x-req-dur", String(durationMs));
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
