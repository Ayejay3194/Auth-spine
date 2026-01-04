export type ID = string;
export type ISODateTime = string;
export type Money = { currency: string; amountCents: number };
export type Vertical = string;

export interface Service {
  id: ID;
  professionalId: ID;
  name: string;
  durationMin: number;
  price: Money;
  locationType: "in_person" | "virtual" | "mobile";
  recurrence: "one_time" | "recurring";
  metadata: Record<string, any>;
}

export interface Booking {
  id: ID;
  clientId: ID;
  professionalId: ID;
  serviceId: ID;
  vertical: Vertical;
  startAtUtc: ISODateTime;
  endAtUtc: ISODateTime;
  status: "held" | "confirmed" | "cancelled" | "completed";
  total: Money;
  deposit?: Money;
  createdAtUtc: ISODateTime;
}

export interface ClientProfile {
  id: ID;
  email: string;
  name: string;
  phone?: string;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
}

export interface Professional {
  id: ID;
  email: string;
  name: string;
  vertical: Vertical;
  bio?: string;
  metadata: Record<string, any>;
}

export interface Message {
  id: ID;
  fromId: ID;
  toId: ID;
  content: string;
  channel: string;
  sentAtUtc: ISODateTime;
  timestamp?: string;
  role?: 'user' | 'assistant' | 'system';
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: ID;
  bookingId: ID;
  amount: Money;
  status: "pending" | "processing" | "completed" | "failed";
  paymentMethodId?: string;
  createdAtUtc: ISODateTime;
  processedAtUtc?: ISODateTime;
}

export interface VerticalConfig {
  vertical: Vertical;
  displayName: string;
  serviceTemplates: Array<{
    name: string;
    defaultDurationMin: number;
    defaultPriceCents: number;
    locationType: Service["locationType"];
    metadata?: Record<string, any>;
  }>;
  compliance: {
    requiresVerification: boolean;
    dataRetentionDays: number;
    allowedPaymentMethods: string[];
  };
  metadata?: Record<string, any>;
}

export interface NLUIntent {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    start: number;
    end: number;
  }>;
}

export interface PromptContext {
  clientId: ID;
  professionalId?: ID;
  conversationHistory: Message[];
  intent?: NLUIntent;
  vertical?: Vertical;
  metadata: Record<string, any>;
}

export interface AnalyticsEvent {
  id?: string;
  type: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet" | "cash";
  provider: string;
  providerMethodId: string;
  isDefault: boolean;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: Money;
  reason: string;
}

export interface Refund {
  id: string;
  paymentIntentId: string;
  amount: Money;
  reason: string;
  status: "pending" | "processed" | "failed";
  createdAtUtc: string;
  processedAtUtc?: string;
}

export interface DecisionResponse {
  action: string;
  confidence: number;
  reasoning: string;
  nextSteps: string[];
  metadata?: Record<string, any>;
}
