import { Pattern } from "../../core/intent.js";

export const patterns: Pattern[] = [
  {
    "spine": "marketing",
    "intent": "create_promo",
    "re": "create promo|new promo|promo code",
    "baseConfidence": 0.7,
    "hint": "create promo"
  },
  {
    "spine": "marketing",
    "intent": "end_promo",
    "re": "end promo|disable promo|stop promo",
    "baseConfidence": 0.75,
    "hint": "end promo"
  }
];
