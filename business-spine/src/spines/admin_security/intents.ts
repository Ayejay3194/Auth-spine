import { Pattern } from "../../core/intent.js";

export const patterns: Pattern[] = [
  {
    "spine": "admin_security",
    "intent": "show_audit",
    "re": "audit trail|show audit|what changed",
    "baseConfidence": 0.75,
    "hint": "audit"
  }
];
