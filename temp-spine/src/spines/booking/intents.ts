import { Pattern } from "../../core/intent.js";

export const patterns: Pattern[] = [
  {
    "spine": "booking",
    "intent": "book",
    "re": "(?:^| )book( |$)|schedule|appointment",
    "baseConfidence": 0.75,
    "hint": "book/schedule"
  },
  {
    "spine": "booking",
    "intent": "cancel",
    "re": "cancel|call off",
    "baseConfidence": 0.8,
    "hint": "cancel"
  },
  {
    "spine": "booking",
    "intent": "list",
    "re": "list (?:bookings|appointments)|show (?:my )?schedule|what's on",
    "baseConfidence": 0.65,
    "hint": "list schedule"
  }
];
