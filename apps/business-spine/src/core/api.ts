import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function api<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (e: any) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "validation_error", issues: e.issues }, { status: 400 });
    }
    const msg = typeof e?.message === "string" ? e.message : "server_error";
    const status = msg === "unauthorized" ? 401 : msg === "rate_limited" ? 429 : msg.startsWith("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
