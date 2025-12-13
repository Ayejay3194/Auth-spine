import { Pattern } from "../../core/intent.js";

export const patterns: Pattern[] = [
  {
    "spine": "analytics",
    "intent": "week_report",
    "re": "this week|week summary|how did i do|revenue down|no-show rate|weekly report|report",
    "baseConfidence": 0.65,
    "hint": "week report"
  }
];
