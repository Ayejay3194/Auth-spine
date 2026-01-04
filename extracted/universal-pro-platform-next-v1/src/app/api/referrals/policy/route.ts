import { NextResponse } from "next/server";
import { defaultReferralPolicy } from "@/network/referrals";

export async function GET() {
  return NextResponse.json({ policy: defaultReferralPolicy }, { status: 200 });
}
