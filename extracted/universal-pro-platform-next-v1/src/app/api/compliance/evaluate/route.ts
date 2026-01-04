import { NextResponse } from "next/server";
import { getVertical } from "@/verticals/loader";
import { evaluateCompliance } from "@/policy/compliance";

export async function POST(req: Request) {
  const body = await req.json();
  const vertical = body.vertical as string | undefined;
  if (!vertical) return NextResponse.json({ error: "Missing vertical" }, { status: 400 });

  const config = getVertical(vertical);
  if (!config) return NextResponse.json({ error: "Unknown vertical" }, { status: 404 });

  const result = evaluateCompliance({
    config,
    event: body.event ?? { type: "unknown", payload: {} },
    consents: body.consents ?? [],
    professional: body.professional ?? {}
  });

  return NextResponse.json({ ok: result.ok, result }, { status: 200 });
}
