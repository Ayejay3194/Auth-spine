import { NextResponse } from "next/server";
import { getPlatform } from "@/server/bootstrap";

export async function POST() {
  const { ctx } = await getPlatform();

  await ctx.store.set("user:profile_complete:usr_1", 0.4);
  await ctx.store.set("user:response_latency_min:usr_1", 600);
  await ctx.store.set("user:prior_bookings:usr_1:pro_1", 0);
  await ctx.store.set("user:no_show_count:usr_1", 1);

  await ctx.events.publish({
    id: "evt_booking_req",
    type: "booking.requested",
    at: ctx.now(),
    subject: { userId: "usr_1", professionalId: "pro_1", bookingId: "bk_1" } as any,
    channel: "web",
    payload: { vertical: "beauty" }
  });

  await ctx.events.publish({
    id: "evt_policy_check",
    type: "policy.check",
    at: ctx.now(),
    subject: { userId: "usr_1", professionalId: "pro_1" } as any,
    payload: {
      vertical: "beauty",
      eventType: "professional.activate",
      consents: [],
      professional: { license: { number: "", expiresAt: "" }, region: { state: "NY" }, businessName: "Test" }
    }
  });

  await ctx.events.publish({ id: "evt_eval", type: "system.evaluate_evolution", at: ctx.now(), payload: {} });

  const edges = await ctx.store.get("composition:edges");
  return NextResponse.json({ ok: true, compositionEdges: edges ?? {} }, { status: 200 });
}
