export type ID = string;
export type ISODate = string;
export type ISOTime = string;
export type ISODateTime = string;
export type Platform = "web" | "ios" | "android";
export type Channel = "email" | "sms" | "push" | "dm";

export type Actor =
  | { kind: "client"; clientId: ID }
  | { kind: "artist"; artistId: ID }
  | { kind: "staff"; staffId: ID };

export type Money = { currency: "USD"; amountCents: number };

export type AssistantResponse = {
  answer: string[];
  doNext: string[];
  edgeCases: string[];
  meta?: Record<string, unknown>;
};

export type NLUIntent =
  | "booking_create"
  | "booking_reschedule"
  | "booking_cancel"
  | "artist_follow"
  | "artist_unfollow"
  | "services_list"
  | "portfolio_view"
  | "auth_login_help"
  | "payments_deposit"
  | "messaging_send"
  | "search_nearby"
  | "copy_bio"
  | "design_follow"
  | "unknown";

export type NLUEntities = Partial<{
  date: ISODate;
  time: ISOTime;
  service: string;
  artist_name: string;
  location: string;
  message_text: string;
}>;

export type NLUResult = { intent: NLUIntent; confidence: number; entities: NLUEntities };

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type RequestContext = { actor: Actor; platform: Platform; locale?: string };

export type AssistantRequest = { text: string; context: RequestContext; messages?: ChatMessage[]; nlu?: NLUResult };
