import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/src/server/infra/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const { booking } = getContainer();
  const res = await booking.createBooking({
    professionalId: body.professionalId ?? (process.env.DEFAULT_PROFESSIONAL_ID ?? "pro_001"),
    clientId: body.clientId ?? "client_anon",
    serviceId: body.serviceId ?? "svc_default",
    vertical: body.vertical ?? (process.env.DEFAULT_VERTICAL ?? "beauty"),
    startAt: body.startAt,
    endAt: body.endAt,
    requestedVia: "WEB"
  });

  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
  return NextResponse.json({ ok: true, bookingId: res.value.bookingId });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { bookingRepo } = getContainer();
  const booking = await bookingRepo.getById(id);
  if (!booking) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ booking });
}
