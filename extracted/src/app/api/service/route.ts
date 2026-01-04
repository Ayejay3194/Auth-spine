import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/src/server/infra/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const { catalog } = getContainer();
  const res = await catalog.createService({
    professionalId: body.professionalId ?? process.env.DEFAULT_PROFESSIONAL_ID,
    name: body.name,
    durationMin: body.durationMin,
    priceCents: body.priceCents,
    currency: body.currency ?? "usd",
    locationType: body.locationType,
    metadata: body.metadata
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true, serviceId: res.value.serviceId });
}

export async function GET(req: NextRequest) {
  const professionalId = req.nextUrl.searchParams.get("professionalId") ?? (process.env.DEFAULT_PROFESSIONAL_ID ?? "");
  const { serviceRepo } = getContainer();
  const services = await serviceRepo.listByProfessional(professionalId);
  return NextResponse.json({ professionalId, services });
}
