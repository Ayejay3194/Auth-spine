import { NLUTrainingExample } from './EnhancedNLUService.js';

export const comprehensiveTrainingData: NLUTrainingExample[] = [
  // Booking creation examples
  {
    text: "I want to book a haircut appointment",
    intent: "booking.create",
    entities: [
      { type: "service", value: "haircut", start: 16, end: 23, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Can I schedule a massage for tomorrow afternoon?",
    intent: "booking.create",
    entities: [
      { type: "service", value: "massage", start: 16, end: 23, confidence: 0.9 },
      { type: "datetime", value: "tomorrow afternoon", start: 28, end: 45, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "I need to make an appointment for a facial next week",
    intent: "booking.create",
    entities: [
      { type: "service", value: "facial", start: 26, end: 32, confidence: 0.9 },
      { type: "datetime", value: "next week", start: 37, end: 46, confidence: 0.7 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Book me a manicure for Friday at 2pm",
    intent: "booking.create",
    entities: [
      { type: "service", value: "manicure", start: 12, end: 20, confidence: 0.9 },
      { type: "datetime", value: "Friday at 2pm", start: 25, end: 39, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "I'd like to reserve a spot for a consultation",
    intent: "booking.create",
    entities: [
      { type: "service", value: "consultation", start: 26, end: 38, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },

  // Availability inquiry examples
  {
    text: "What times are available for a haircut today?",
    intent: "booking.inquiry",
    entities: [
      { type: "service", value: "haircut", start: 29, end: 36, confidence: 0.9 },
      { type: "datetime", value: "today", start: 37, end: 42, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Are there any openings tomorrow morning?",
    intent: "booking.inquiry",
    entities: [
      { type: "datetime", value: "tomorrow morning", start: 18, end: 33, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Check availability for massage next week",
    intent: "booking.inquiry",
    entities: [
      { type: "service", value: "massage", start: 19, end: 26, confidence: 0.9 },
      { type: "datetime", value: "next week", start: 27, end: 36, confidence: 0.7 }
    ],
    sentiment: "neutral"
  },

  // Service information examples
  {
    text: "What services do you offer?",
    intent: "service.information",
    entities: [],
    sentiment: "neutral"
  },
  {
    text: "Tell me about your hair styling services",
    intent: "service.information",
    entities: [
      { type: "service", value: "hair styling", start: 20, end: 32, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Do you have any treatments for acne?",
    intent: "service.information",
    entities: [
      { type: "service", value: "treatments for acne", start: 13, end: 33, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "What kind of facials do you provide?",
    intent: "service.information",
    entities: [
      { type: "service", value: "facials", start: 16, end: 23, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },

  // Pricing information examples
  {
    text: "How much does a haircut cost?",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "haircut", start: 14, end: 21, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "What are your rates for massage therapy?",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "massage therapy", start: 19, end: 35, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "I need to know the price of a facial treatment",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "facial treatment", start: 23, end: 39, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "How much would a full day spa package cost?",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "full day spa package", start: 14, end: 35, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },

  // Professional information examples
  {
    text: "Who is available for hair appointments?",
    intent: "professional.information",
    entities: [
      { type: "service", value: "hair appointments", start: 19, end: 35, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Which professionals specialize in massage?",
    intent: "professional.information",
    entities: [
      { type: "service", value: "massage", start: 28, end: 35, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "Can I book with Dr. Smith for a consultation?",
    intent: "professional.information",
    entities: [
      { type: "professional", value: "Dr. Smith", start: 16, end: 25, confidence: 0.9 },
      { type: "service", value: "consultation", start: 30, end: 42, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },

  // Cancellation examples
  {
    text: "I need to cancel my appointment",
    intent: "booking.cancel",
    entities: [],
    sentiment: "negative"
  },
  {
    text: "Can I reschedule my haircut for next week?",
    intent: "booking.cancel",
    entities: [
      { type: "service", value: "haircut", start: 23, end: 30, confidence: 0.9 },
      { type: "datetime", value: "next week", start: 35, end: 44, confidence: 0.7 }
    ],
    sentiment: "neutral"
  },
  {
    text: "I need to move my appointment to a different time",
    intent: "booking.cancel",
    entities: [],
    sentiment: "neutral"
  },

  // Greeting examples
  {
    text: "Hello, I need some help",
    intent: "greeting",
    entities: [],
    sentiment: "neutral"
  },
  {
    text: "Hi there! How are you today?",
    intent: "greeting",
    entities: [],
    sentiment: "positive"
  },
  {
    text: "Good morning, I'd like to book an appointment",
    intent: "greeting",
    entities: [],
    sentiment: "positive"
  },

  // Help examples
  {
    text: "What can you help me with?",
    intent: "help",
    entities: [],
    sentiment: "neutral"
  },
  {
    text: "I need some assistance with booking",
    intent: "help",
    entities: [],
    sentiment: "neutral"
  },
  {
    text: "Can you guide me through the process?",
    intent: "help",
    entities: [],
    sentiment: "neutral"
  },

  // Complex conversational examples
  {
    text: "Hi! I was wondering if you have any availability for a haircut this weekend, preferably Saturday afternoon around 3pm?",
    intent: "booking.create",
    entities: [
      { type: "service", value: "haircut", start: 50, end: 57, confidence: 0.9 },
      { type: "datetime", value: "this weekend", start: 62, end: 74, confidence: 0.7 },
      { type: "datetime", value: "Saturday afternoon", start: 87, end: 104, confidence: 0.8 },
      { type: "datetime", value: "3pm", start: 111, end: 114, confidence: 0.8 }
    ],
    sentiment: "positive"
  },
  {
    text: "I'm looking for a deep tissue massage, but I'm not sure about the pricing. Can you tell me how much it costs and when you have openings?",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "deep tissue massage", start: 15, end: 34, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "My friend recommended your facials and said they're amazing. I'd like to try one, but I have sensitive skin. Do you have treatments for sensitive skin?",
    intent: "service.information",
    entities: [
      { type: "service", value: "facials", start: 29, end: 36, confidence: 0.9 },
      { type: "service", value: "treatments for sensitive skin", start: 89, end: 119, confidence: 0.8 }
    ],
    sentiment: "positive"
  },

  // Natural language variations
  {
    text: "Hey, can you hook me up with a haircut?",
    intent: "booking.create",
    entities: [
      { type: "service", value: "haircut", start: 26, end: 33, confidence: 0.9 }
    ],
    sentiment: "neutral"
  },
  {
    text: "I'm trying to figure out when I can get my nails done",
    intent: "booking.inquiry",
    entities: [
      { type: "service", value: "nails", start: 35, end: 40, confidence: 0.8 }
    ],
    sentiment: "neutral"
  },
  {
    text: "What's the damage for a full spa day?",
    intent: "pricing.information",
    entities: [
      { type: "service", value: "full spa day", start: 18, end: 30, confidence: 0.8 }
    ],
    sentiment: "neutral"
  }
];

export const conversationalFlows = [
  {
    scenario: "Complete booking flow",
    messages: [
      "Hi, I'd like to book a haircut",
      "I'm free on Friday afternoon",
      "Around 3pm would be perfect",
      "Yes, that works for me!"
    ],
    expectedIntents: ["greeting", "booking.create", "booking.create", "booking.create"]
  },
  {
    scenario: "Service inquiry to booking",
    messages: [
      "What services do you offer?",
      "Tell me more about your massage therapy",
      "How much does a 60-minute massage cost?",
      "Great! Can I book one for tomorrow?"
    ],
    expectedIntents: ["service.information", "service.information", "pricing.information", "booking.create"]
  },
  {
    scenario: "Availability check",
    messages: [
      "Are there any openings today?",
      "What about tomorrow morning?",
      "I need a haircut, preferably with someone experienced",
      "Perfect, book me for 10am"
    ],
    expectedIntents: ["booking.inquiry", "booking.inquiry", "booking.create", "booking.create"]
  }
];

export const sentimentAnalysisData = [
  { text: "I'm so excited for my appointment!", sentiment: "positive" },
  { text: "This is exactly what I was looking for", sentiment: "positive" },
  { text: "Your service sounds amazing", sentiment: "positive" },
  { text: "I'm a bit nervous about trying something new", sentiment: "neutral" },
  { text: "Just checking my options", sentiment: "neutral" },
  { text: "I need to think about it", sentiment: "neutral" },
  { text: "I'm disappointed with the limited availability", sentiment: "negative" },
  { text: "The prices seem too high", sentiment: "negative" },
  { text: "This isn't what I expected", sentiment: "negative" }
];
