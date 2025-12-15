import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/admin/diagnostics/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    // Replace with dynamic policy export from your policy engine.
    const matrix = {
      owner: ["*"],
      admin: ["diagnostics.run", "audit.read", "users.manage"],
      staff: ["booking.write", "crm.write"],
      accountant: ["payments.read", "reports.export"],
    };
    return NextResponse.json({ matrix });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: String(e?.message ?? e) }, { status });
  }
}
