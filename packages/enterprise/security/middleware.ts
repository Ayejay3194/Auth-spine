import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Host-based separation template.
 * - Set env:
 *   APP_HOST=app.domain.com
 *   OPS_HOST=ops.domain.com
 *   STUDIO_HOST=studio.domain.com (optional)
 */
const APP_HOST = process.env.APP_HOST || "";
const OPS_HOST = process.env.OPS_HOST || "";
const STUDIO_HOST = process.env.STUDIO_HOST || "";

const isDev = process.env.NODE_ENV !== "production";
const matchHost = (h:string, e:string) => e && h.toLowerCase() === e.toLowerCase();

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const path = req.nextUrl.pathname;

  if (isDev && !APP_HOST && !OPS_HOST && !STUDIO_HOST) return NextResponse.next();

  const onOps = matchHost(host, OPS_HOST);
  const onStudio = matchHost(host, STUDIO_HOST);

  const isOpsSurface =
    path.startsWith("/ops") ||
    path.startsWith("/admin") ||
    path.startsWith("/salon-admin") ||
    path.startsWith("/api/ops");

  const isStudioSurface =
    path.startsWith("/studio") ||
    path.startsWith("/api/studio");

  if (isOpsSurface && !onOps) return new NextResponse("Not found", { status: 404 });

  if (STUDIO_HOST && isStudioSurface && !onStudio) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
