export type ID = string;
export type ISODateTime = string;
export type Money = { currency: "USD"; amountCents: number };

export type Vertical =
  | "beauty"
  | "fitness"
  | "consulting"
  | "education"
  | "home_services"
  | "health_therapy"
  | "other";

export type LocationType = "in_person" | "virtual" | "mobile";

export type Professional = {
  id: ID;
  vertical: Vertical;
  businessName?: string;
  displayName: string;
  payout?: { provider: "stripe" | "mock"; accountRef?: string };
  compliance?: Record<string, string>;
};

export type Service = {
  id: ID;
  professionalId: ID;
  name: string;
  durationMin: number;
  price: Money;
  locationType: LocationType;
  recurrence?: "one_time" | "recurring" | "package";
  metadata?: Record<string, any>;
};

export type Client = {
  id: ID;
  phone?: string;
  email?: string;
  name?: string;
  paymentMethodRef?: string;
  trustScore: number; // 0..100
  preferences?: Record<string, string>;
};

export type BookingStatus = "held" | "confirmed" | "cancelled" | "completed";
export type Booking = {
  id: ID;
  clientId: ID;
  professionalId: ID;
  serviceId: ID;
  vertical: Vertical;
  startAtUtc: ISODateTime;
  endAtUtc: ISODateTime;
  status: BookingStatus;
  total: Money;
  deposit?: Money;
  createdAtUtc: ISODateTime;
};

export type Quote = {
  id: ID;
  lines: Array<{ serviceId: ID; name: string; price: Money }>;
  subtotal: Money;
  discounts: Money;
  total: Money;
};

export type PaymentIntent = {
  id: ID;
  bookingId: ID;
  amount: Money;
  status: "requires_payment" | "succeeded" | "refunded";
  provider: "stripe" | "mock";
  createdAtUtc: ISODateTime;
};

export type MessageChannel = "sms" | "email" | "push" | "dm";
export type OutboundMessage = {
  id: ID;
  toClientId: ID;
  channel: MessageChannel;
  text: string;
  createdAtUtc: ISODateTime;
};
