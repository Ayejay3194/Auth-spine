import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/src/server/infra/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const { professionals, catalog } = getContainer();
  const res = await professionals.onboard({
    vertical: body.vertical,
    businessName: body.businessName,
    phoneE164: body.phoneE164,
    email: body.email,
    requiredFields: body.requiredFields
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  await catalog.seedDefaultsForProfessional(res.value.professionalId);

  return NextResponse.json({ ok: true, professionalId: res.value.professionalId });
}
