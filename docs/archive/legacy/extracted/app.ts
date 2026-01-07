// Monolithic V1 TypeScript Suite
// This file contains the full V1 backbone in one place for easy extraction.

export type ID = string;
export type ISODateTime = string;
export type Money = { currency: "USD"; amountCents: number };

export type Actor =
  | { kind: "client"; clientId: ID }
  | { kind: "artist"; artistId: ID };

export type AssistantResponse = {
  answer: string[];
  doNext: string[];
  edgeCases: string[];
};

export type NLUIntent =
  | "booking_create"
  | "booking_cancel"
  | "artist_follow"
  | "design_follow"
  | "unknown";

export type NLUResult = {
  intent: NLUIntent;
  confidence: number;
  entities: Record<string, string>;
};

export class NLUModule {
  parse(text: string): NLUResult {
    const t = text.toLowerCase();
    if (t.includes("follow button")) return { intent: "design_follow", confidence: 0.8, entities: {} };
    if (t.includes("book")) return { intent: "booking_create", confidence: 0.7, entities: {} };
    if (t.includes("cancel")) return { intent: "booking_cancel", confidence: 0.7, entities: {} };
    if (t.includes("follow")) return { intent: "artist_follow", confidence: 0.7, entities: {} };
    return { intent: "unknown", confidence: 0.4, entities: {} };
  }
}

export class DecisionModule {
  respond(nlu: NLUResult): AssistantResponse {
    if (nlu.intent === "design_follow") {
      return {
        answer: [
          "Put Follow with identity, not booking.",
          "Best spot is top-right of the profile header."
        ],
        doNext: [
          "Add outlined Follow button.",
          "Toggle state on tap.",
          "Keep Book as primary CTA."
        ],
        edgeCases: [
          "Sticky header on mobile.",
          "Never style Follow as gold."
        ]
      };
    }
    return {
      answer: ["Tell me what you want to ship."],
      doNext: ["Clarify goal.", "Clarify platform.", "Proceed."],
      edgeCases: ["Say 'code only' if needed."]
    };
  }
}

export class App {
  nlu = new NLUModule();
  decisions = new DecisionModule();

  handle(text: string): AssistantResponse {
    const nlu = this.nlu.parse(text);
    return this.decisions.respond(nlu);
  }
}

// Demo
const app = new App();
console.log(app.handle("Where should the follow button go?"));
