import { NextResponse } from "next/server";
import { getVertical } from "@/verticals/loader";

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const config = getVertical(params.key);
  if (!config) return NextResponse.json({ error: "Unknown vertical" }, { status: 404 });
  return NextResponse.json({ config }, { status: 200 });
}
