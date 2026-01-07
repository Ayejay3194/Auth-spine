import type { NLUResult, NLUIntent, NLUEntities } from "../core/types.js";

const TAGS: Array<{ intent: NLUIntent; tags: string[] }> = [
  { intent: "booking_reschedule", tags: ["reschedule", "move my", "change my time", "shift it"] },
  { intent: "booking_cancel", tags: ["cancel", "drop my booking", "cancel my appointment"] },
  { intent: "booking_create", tags: ["book", "schedule", "appointment", "slot"] },
  { intent: "artist_unfollow", tags: ["unfollow", "unfavorite", "remove from favorites"] },
  { intent: "artist_follow", tags: ["follow", "favorite", "save this stylist"] },
  { intent: "design_follow", tags: ["follow button placement", "where should the follow button go", "follow button"] },
  { intent: "payments_deposit", tags: ["deposit", "pay up front"] },
  { intent: "messaging_send", tags: ["message", "dm", "contact"] },
  { intent: "search_nearby", tags: ["near me", "nearby", "map", "in atlanta", "in nyc"] },
  { intent: "services_list", tags: ["services", "service menu", "pricing"] },
  { intent: "copy_bio", tags: ["write a bio", "headline", "caption", "about section"] },
];

export class NLUModule {
  parse(text: string): NLUResult {
    const t = text.toLowerCase();

    let intent: NLUIntent = "unknown";
    for (const row of TAGS) {
      if (row.tags.some(tag => t.includes(tag))) { intent = row.intent; break; }
    }

    const entities: NLUEntities = {};

    const timeMatch = t.match(/\b(\d{1,2}:\d{2})\b/) || t.match(/\b(\d{1,2})(am|pm)\b/);
    if (timeMatch) entities.time = timeMatch[0].toUpperCase();

    if (t.includes("tomorrow")) entities.date = "TOMORROW";
    else if (t.includes("today")) entities.date = "TODAY";
    else if (t.includes("friday")) entities.date = "FRIDAY";
    else if (t.includes("next week")) entities.date = "NEXT_WEEK";

    const locMatch = t.match(/\bin\s+([a-z\s]{2,20})\b/);
    if (locMatch) entities.location = locMatch[1].trim();

    return { intent, confidence: intent === "unknown" ? 0.4 : 0.78, entities };
  }
}
