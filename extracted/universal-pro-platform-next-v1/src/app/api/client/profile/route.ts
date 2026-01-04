import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "usr_1";
  return NextResponse.json({
    client: {
      id,
      name: "CLIENT_NAME",
      trustScore: 0.72,
      verticalHistory: ["beauty", "fitness", "consulting"]
    }
  }, { status: 200 });
}
