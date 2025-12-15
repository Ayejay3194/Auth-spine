import { NextResponse } from "next/server";
import { z } from "zod";
import { findOpenSlots } from "@/src/booking/gapfill";

const Q = z.object({ providerId: z.string(), fromISO: z.string(), toISO: z.string() });

export async function POST(req: Request) {
  const body = Q.parse(await req.json());
  const slots = await findOpenSlots(body.providerId, new Date(body.fromISO), new Date(body.toISO));
  return NextResponse.json({ slots });
}
