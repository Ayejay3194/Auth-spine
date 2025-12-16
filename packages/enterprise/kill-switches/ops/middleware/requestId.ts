import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware helper: ensures every request has an X-Request-Id.
 * - Reads incoming X-Request-Id if present, else generates one.
 * - Sets it on the response so the client can see it.
 */
export function withRequestId(req: NextRequest) {
  const rid = req.headers.get("x-request-id") ?? cryptoId();
  const res = NextResponse.next();
  res.headers.set("x-request-id", rid);
  return { requestId: rid, response: res };
}

function cryptoId(): string {
  // @ts-ignore
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "req_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}
