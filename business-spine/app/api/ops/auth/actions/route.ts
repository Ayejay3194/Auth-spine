import { NextResponse } from "next/server";
import { runOpsActions } from "@/src/ops-runtime/actions/runner";

/**
 * Guarded endpoint to apply ops actions (feature flags / mitigations).
 * Enforce step-up (MFA / re-auth) for high-risk actions.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const requestId = req.headers.get("x-request-id") ?? undefined;

  const result = await runOpsActions(body, requestId);
  return NextResponse.json(result, { status: result.ok ? 200 : 403 });
}
