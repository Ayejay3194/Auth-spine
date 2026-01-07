import { NextResponse } from "next/server";
import { suggestBundles } from "@/network/bundles";

export async function POST(req: Request) {
  const body = await req.json();
  const history = (body.clientVerticalHistory as string[] | undefined) ?? [];
  return NextResponse.json({ bundles: suggestBundles({ clientVerticalHistory: history }) }, { status: 200 });
}
