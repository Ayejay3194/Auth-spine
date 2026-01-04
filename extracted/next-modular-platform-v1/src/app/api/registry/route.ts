import { NextResponse } from "next/server";
import { getPlatform } from "@/server/bootstrap";

export async function GET() {
  const { registry } = await getPlatform();
  return NextResponse.json({ modules: registry.list() }, { status: 200 });
}
