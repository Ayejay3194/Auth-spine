import { NextResponse } from "next/server";
import { getContainer } from "@/src/server/infra/container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { verticals } = getContainer();
  return NextResponse.json({ verticals: verticals.list() });
}
