import { NextResponse } from "next/server";
import { getPlatform } from "@/server/bootstrap";

export async function POST() {
  const { ctx } = await getPlatform();

  // seed some aggregates so scoring modules have something to chew on
  await ctx.store.set("agg:recency_days:usr_1:art_1", 45);
  await ctx.store.set("agg:freq_90d:usr_1:art_1", 1);
  await ctx.store.set("agg:spend_90d:usr_1:art_1", 12000);
  await ctx.store.set("agg:sent_trend:usr_1:art_1", -0.4);

  await ctx.store.set("user:profile_complete:usr_1", 0.4);
  await ctx.store.set("user:response_latency_min:usr_1", 600);
  await ctx.store.set("user:prior_bookings:usr_1:art_1", 0);
  await ctx.store.set("user:no_show_count:usr_1", 1);

  // publish a few events
  await ctx.events.publish({
    id: "evt_msg",
    type: "message.received",
    at: ctx.now(),
    subject: { userId: "usr_1", artistId: "art_1" },
    channel: "web",
    payload: { text: "hey, can I book?" },
  });

  await ctx.events.publish({
    id: "evt_booking_req",
    type: "booking.requested",
    at: ctx.now(),
    subject: { userId: "usr_1", artistId: "art_1", bookingId: "bd_1" },
    channel: "web",
    payload: { serviceTag: "lash" },
  });

  await ctx.events.publish({
    id: "evt_review",
    type: "review.received",
    at: ctx.now(),
    subject: { userId: "usr_1", artistId: "art_1", reviewId: "rv_1" },
    payload: { rating: 3, text: "meh" },
  });

  await ctx.events.publish({
    id: "evt_review_draft",
    type: "review.draft_updated",
    at: ctx.now(),
    subject: { userId: "usr_1", artistId: "art_1", reviewId: "rv_d1" },
    payload: { userId: "usr_1", artistId: "art_1", rating: 2, draftText: "late and rude, want a refund" },
  });

  const edges = await ctx.store.get("composition:edges");

  return NextResponse.json({ ok: true, compositionEdges: edges ?? [] }, { status: 200 });
}
