import type { AssistantResponse, NLUResult } from "../core/types.js";

export class DecisionModule {
  respond(nlu: NLUResult): AssistantResponse {
    if (nlu.intent === "design_follow") {
      return {
        answer: [
          "Follow goes with identity, not booking.",
          "Best placement: top-right of the profile header row (same line as name + rating).",
        ],
        doNext: [
          "Add an outlined Follow button next to rating.",
          "Toggle: Follow → Following ✓.",
          "Keep Book as the only filled primary CTA.",
        ],
        edgeCases: [
          "Mobile: keep Follow available in a sticky header.",
          "Don’t style Follow as gold. Gold is for money actions.",
        ],
      };
    }

    if (nlu.intent === "booking_create") {
      return {
        answer: [
          "Booking should be staged: service → date → time → confirm.",
          "Start by forcing service selection so duration and pricing are real.",
        ],
        doNext: [
          "Pick service first (duration/price).",
          "Pick date, then time.",
          "Confirm to lock the slot (5–10 min hold).",
        ],
        edgeCases: [
          "Store UTC; display local time.",
          "Use a unique constraint on (artistId, startAtUtc) to prevent double-booking.",
        ],
      };
    }

    return {
      answer: ["Tell me what you want the user to do and what’s blocking it."],
      doNext: ["One-sentence goal.", "Platform (web/ios/android).", "Paste the relevant screen/code."],
      edgeCases: ["If you want output-only, say “code only” or “JSON only”.", "If it’s auth, include cookie/domain details."],
      meta: { inferredIntent: nlu.intent, entities: nlu.entities },
    };
  }
}
