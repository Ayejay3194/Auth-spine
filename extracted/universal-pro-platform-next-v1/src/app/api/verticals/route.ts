import { NextResponse } from "next/server";
import { listVerticals } from "@/verticals/loader";

export async function GET() {
  return NextResponse.json({ verticals: listVerticals() }, { status: 200 });
}
