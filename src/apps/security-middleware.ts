import { NextResponse } from "next/server";

export function securityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options","DENY");
  res.headers.set("X-Content-Type-Options","nosniff");
  res.headers.set("Referrer-Policy","strict-origin");
  res.headers.set("Content-Security-Policy","default-src 'self'");
  res.headers.set("Strict-Transport-Security","max-age=63072000");
  return res;
}
