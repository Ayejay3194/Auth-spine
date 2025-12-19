import { Pattern } from "../../core/intent.js";

export const patterns: Pattern[] = [
  {
    "spine": "payments",
    "intent": "create_invoice",
    "re": "create invoice|invoice ",
    "baseConfidence": 0.7,
    "hint": "create invoice"
  },
  {
    "spine": "payments",
    "intent": "mark_paid",
    "re": "mark (?:it )?paid|paid invoice",
    "baseConfidence": 0.7,
    "hint": "mark paid"
  },
  {
    "spine": "payments",
    "intent": "refund",
    "re": "refund",
    "baseConfidence": 0.85,
    "hint": "refund"
  }
];
