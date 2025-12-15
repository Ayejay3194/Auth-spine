import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/admin/diagnostics/auth";
import { runAll } from "@/src/admin/diagnostics/runAll";

export async function POST(req: Request) {
  try {
    const ctx = await requireAdmin(req);
    const out = await runAll(ctx);
    return NextResponse.json(out);
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: String(e?.message ?? e) }, { status });
  }
}
