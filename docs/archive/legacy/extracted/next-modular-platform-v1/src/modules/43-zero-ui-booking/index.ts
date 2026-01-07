import type { Module, ModuleContext, ID } from "../../core/types";
import type { BookingDraft } from "../../domain/entities";
import { randId } from "../../lib/util";

interface VoiceBookingInput {
  userId: ID;
  artistId: ID;
  transcript: string;
}

interface ImageBookingInput {
  userId: ID;
  artistId: ID;
  imageUrl: string;
}

export class ZeroUIBookingFlow implements Module {
  meta = {
    id: "43.zero-ui-booking",
    name: "Zero-UI Booking Flow",
    version: "1.0.0",
    provides: ["voice_to_booking", "image_to_booking", "one_tap_rebook"],
    requires: ["33.context-collapse"],
  };

  async init(ctx: ModuleContext) {
    ctx.events.subscribe("booking.voice_intent", async (e) => {
      const p = e.payload as VoiceBookingInput;
      const draft = await this.voiceToDraft(ctx, p);
      await ctx.events.publish({
        id: randId("evt"),
        type: "booking.draft_ready",
        at: ctx.now(),
        subject: { userId: p.userId, artistId: p.artistId, bookingId: draft.id },
        payload: draft,
      });
    });

    ctx.events.subscribe("booking.image_intent", async (e) => {
      const p = e.payload as ImageBookingInput;
      const draft = await this.imageToDraft(ctx, p);
      await ctx.events.publish({
        id: randId("evt"),
        type: "booking.draft_ready",
        at: ctx.now(),
        subject: { userId: p.userId, artistId: p.artistId, bookingId: draft.id },
        payload: draft,
      });
    });
  }

  private async voiceToDraft(ctx: ModuleContext, input: VoiceBookingInput): Promise<BookingDraft> {
    const serviceGuess = /braid|loc|lash|nail/i.exec(input.transcript)?.[0]?.toLowerCase();
    const draft: BookingDraft = {
      id: randId("bd"),
      userId: input.userId,
      artistId: input.artistId,
      serviceId: serviceGuess ? `svc_${serviceGuess}` : undefined,
      status: "draft",
      lastTouchedAt: ctx.now(),
    };
    await ctx.workflow.upsert({
      id: draft.id,
      type: "booking_flow",
      owner: { userId: input.userId, artistId: input.artistId },
      status: "active",
      step: "draft_ready",
      data: { transcript: input.transcript, serviceGuess },
      updatedAt: ctx.now(),
    });
    await ctx.store.set(`intent:last_workflow:${input.userId}:${input.artistId}`, draft.id, { ttlSeconds: 60 * 60 * 24 * 14 });
    return draft;
  }

  private async imageToDraft(ctx: ModuleContext, input: ImageBookingInput): Promise<BookingDraft> {
    const draft: BookingDraft = {
      id: randId("bd"),
      userId: input.userId,
      artistId: input.artistId,
      status: "draft",
      lastTouchedAt: ctx.now(),
      notes: `INSPIRATION_IMAGE:${input.imageUrl}`,
    };
    await ctx.workflow.upsert({
      id: draft.id,
      type: "booking_flow",
      owner: { userId: input.userId, artistId: input.artistId },
      status: "active",
      step: "draft_ready",
      data: { imageUrl: input.imageUrl },
      updatedAt: ctx.now(),
    });
    await ctx.store.set(`intent:last_workflow:${input.userId}:${input.artistId}`, draft.id, { ttlSeconds: 60 * 60 * 24 * 14 });
    return draft;
  }
}
