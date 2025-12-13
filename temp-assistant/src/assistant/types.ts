export type ID = string;
export type Channel = "email" | "sms" | "push" | "call";
export type ServiceType = "LIVE" | "ASYNC" | "DIGITAL";
export type AppointmentStatus = "BOOKED" | "COMPLETED" | "NO_SHOW" | "CANCELLED" | "RESCHEDULED";
export type OrderStatus = "PAID" | "HELD" | "DELIVERED" | "COMPLETED" | "DISPUTED" | "REFUNDED";
export type Role = "owner" | "staff" | "admin";

export interface Client {
  id: ID;
  email: string;
  phone?: string;
  timezone?: string;
  createdAt: Date;
  tags?: string[];
  marketingSource?: string;
  birthday?: string; // MM-DD optional
}

export interface Practitioner {
  id: ID;
  displayName: string;
  timezone: string;
  role: Role;
}

export interface Service {
  id: ID;
  practitionerId: ID;
  title: string;
  type: ServiceType;
  basePriceCents: number;
  durationMin?: number;         // LIVE
  deliveryWindowHours?: number; // ASYNC
  addOns?: Array<{ id: ID; title: string; priceCents: number }>;
  buffers?: { beforeMin: number; afterMin: number };
  category?: string;
}

export interface Booking {
  id: ID;
  serviceId: ID;
  practitionerId: ID;
  clientId: ID;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  createdAt: Date;
  pricePaidCents: number;
  depositCents?: number;
  notes?: string;
}

export interface Order {
  id: ID;
  serviceId: ID;
  practitionerId: ID;
  clientId: ID;
  status: OrderStatus;
  createdAt: Date;
  dueAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  amountCents: number;
  platformFeeCents: number;
}

export interface MessageEvent {
  id: ID;
  clientId: ID;
  channel: Channel;
  kind: "promo" | "reminder" | "review" | "support" | "transactional";
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  respondedAt?: Date;
}

export interface InventoryItem {
  id: ID;
  name: string;
  unit: "ml" | "oz" | "count";
  onHand: number;
  reorderPoint: number;
  reorderQuantity: number;
  costCentsPerUnit: number;
}

export interface ServiceUsage {
  serviceId: ID;
  itemId: ID;
  unitsPerService: number;
}

export interface Suggestion {
  id: ID;
  engine: string;
  title: string;
  message: string;
  severity: "info" | "warn" | "critical";
  createdAt: Date;
  why: string[];
  actions?: Array<{ label: string; intent: string; payload?: Record<string, unknown> }>;
  practitionerId?: ID;
  clientId?: ID;
  bookingId?: ID;
}

export interface AssistantContext {
  now: Date;
  practitioner: Practitioner;
  clients: Client[];
  services: Service[];
  bookings: Booking[];
  orders: Order[];
  messages: MessageEvent[];
  inventory: InventoryItem[];
  serviceUsage: ServiceUsage[];
}
